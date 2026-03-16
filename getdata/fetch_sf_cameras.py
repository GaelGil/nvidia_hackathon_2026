"""
Fetch San Francisco area CCTV cameras from Caltrans official data.

Caltrans provides JSON/XML/CSV at https://cwwp2.dot.ca.gov (by district).
District 4 = Bay Area (includes San Francisco).
We try several possible endpoints, then filter to SF by county or bounding box.

Run from repo root:  python getdata/fetch_sf_cameras.py
Output: getdata/sf_cameras.json
"""

import json
import os
import urllib.request
import ssl

# San Francisco bounding box (approx): lon -122.52 to -122.35, lat 37.70 to 37.81
SF_BBOX = {
    "lon_min": -122.52,
    "lon_max": -122.35,
    "lat_min": 37.70,
    "lat_max": 37.81,
}
SF_COUNTY_NAMES = ("San Francisco", "SAN FRANCISCO")

# Possible Caltrans JSON endpoints (district 4 = Bay Area; also try statewide/vm)
CCTV_JSON_URLS = [
    "https://cwwp2.dot.ca.gov/data/d4/cctv/cctv.json",
    "https://www.dot.ca.gov/cwwp2/data/d4/cctv/cctv.json",
    "https://cwwp2.dot.ca.gov/vm/cctv.json",
    "https://cwwp2.dot.ca.gov/vm/d4/cctv.json",
]

# ArcGIS MapServer query for CCTV layer (all cameras in SF bounding box)
ARCGIS_QUERY_URL = (
    "https://caltrans-gis.dot.ca.gov/arcgis/rest/services/CHhighway/CCTV/MapServer/0/query"
    "?where=1%3D1"
    "&geometry=%7B%22xmin%22%3A-122.52%2C%22ymin%22%3A37.70%2C%22xmax%22%3A-122.35%2C%22ymax%22%3A37.81%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D"
    "&geometryType=esriGeometryEnvelope"
    "&inSR=4326"
    "&spatialRel=esriSpatialRelIntersects"
    "&outFields=*"
    "&returnGeometry=true"
    "&f=json"
)


def fetch_json(url: str, timeout: int = 15) -> dict | None:
    """Fetch URL and parse as JSON. Returns None on any failure."""
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={"User-Agent": "Caltrans-CCTV-Scraper/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print(f"  Skip {url}: {e}")
        return None


def in_sf_bbox(lon: float, lat: float) -> bool:
    return (
        SF_BBOX["lon_min"] <= lon <= SF_BBOX["lon_max"]
        and SF_BBOX["lat_min"] <= lat <= SF_BBOX["lat_max"]
    )


def normalize_cctv_from_cwwp2(raw: dict) -> list[dict]:
    """
    Normalize Caltrans CWWP2 JSON format to a simple list of camera records
    with location, name, and image URL.
    """
    out = []
    data = raw.get("data") if isinstance(raw.get("data"), list) else []
    for item in data:
        cctv = item.get("cctv") if isinstance(item.get("cctv"), dict) else {}
        loc = cctv.get("location") or {}
        img_data = (cctv.get("imageData") or {}).get("static") or {}
        name = loc.get("locationName") or loc.get("nearbyPlace") or "Unknown"
        county = (loc.get("county") or "").strip()
        try:
            lat = float(loc.get("latitude") or 0)
            lon = float(loc.get("longitude") or 0)
        except (TypeError, ValueError):
            lat, lon = 0, 0
        current_url = img_data.get("currentImageURL") or ""
        streaming_url = (cctv.get("imageData") or {}).get("streamingVideoURL") or ""
        out.append({
            "name": name,
            "county": county,
            "latitude": lat,
            "longitude": lon,
            "route": loc.get("route"),
            "direction": loc.get("direction"),
            "current_image_url": current_url,
            "streaming_video_url": streaming_url,
            "in_service": cctv.get("inService") == "true",
        })
    return out


def fetch_from_arcgis() -> list[dict]:
    """Fetch cameras in SF bounding box from Caltrans ArcGIS MapServer."""
    raw = fetch_json(ARCGIS_QUERY_URL)
    if not raw or "features" not in raw:
        return []
    out = []
    for f in raw.get("features", []):
        att = f.get("attributes") or {}
        geom = f.get("geometry") or {}
        x = geom.get("x") or att.get("longitude")
        y = geom.get("y") or att.get("latitude")
        if x is None or y is None:
            continue
        name = att.get("locationName") or att.get("nearbyPlace") or "Unknown"
        county = (att.get("county") or "").strip()
        img_url = att.get("currentImageURL") or ""
        streaming_url = att.get("streamingVideoURL") or ""
        out.append({
            "name": name,
            "county": county,
            "latitude": float(y),
            "longitude": float(x),
            "route": att.get("route"),
            "direction": att.get("direction"),
            "current_image_url": img_url,
            "streaming_video_url": streaming_url,
            "in_service": att.get("inService") is True,
        })
    return out


def main() -> None:
    all_cameras = []

    print("Trying Caltrans CWWP2 JSON endpoints...")
    for url in CCTV_JSON_URLS:
        raw = fetch_json(url)
        if raw:
            cams = normalize_cctv_from_cwwp2(raw)
            if cams:
                print(f"  Got {len(cams)} cameras from {url}")
                all_cameras.extend(cams)
                break

    if not all_cameras:
        print("Trying Caltrans ArcGIS MapServer (SF bbox)...")
        all_cameras = fetch_from_arcgis()
        if all_cameras:
            print(f"  Got {len(all_cameras)} cameras from ArcGIS")

    # Filter to San Francisco: by county name or by bounding box
    sf_cameras = []
    for c in all_cameras:
        if c.get("county") in SF_COUNTY_NAMES:
            sf_cameras.append(c)
        elif in_sf_bbox(c.get("longitude", 0), c.get("latitude", 0)):
            sf_cameras.append(c)

    # If no filter matched, keep all we got (e.g. if only district 4 data and no county/coords)
    if not sf_cameras and all_cameras:
        sf_cameras = all_cameras
        print("  No SF filter match; saving all cameras returned.")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(script_dir, "sf_cameras.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(sf_cameras, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(sf_cameras)} cameras to {out_path}")


if __name__ == "__main__":
    main()
