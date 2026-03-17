"""
Caltrans CCTV Feed Ingester
Fetches live camera snapshots from California DOT's free CWWP2 JSON API.
No API key required. Images refresh every 1-20 minutes.
"""
import requests
import base64
import time
from typing import Optional

DISTRICT_URLS = {
    3: "https://cwwp2.dot.ca.gov/data/d3/cctv/cctvStatusD03.json",
    4: "https://cwwp2.dot.ca.gov/data/d4/cctv/cctvStatusD04.json",
    5: "https://cwwp2.dot.ca.gov/data/d5/cctv/cctvStatusD05.json",
    6: "https://cwwp2.dot.ca.gov/data/d6/cctv/cctvStatusD06.json",
    7: "https://cwwp2.dot.ca.gov/data/d7/cctv/cctvStatusD07.json",
    8: "https://cwwp2.dot.ca.gov/data/d8/cctv/cctvStatusD08.json",
    10: "https://cwwp2.dot.ca.gov/data/d10/cctv/cctvStatusD10.json",
    11: "https://cwwp2.dot.ca.gov/data/d11/cctv/cctvStatusD11.json",
    12: "https://cwwp2.dot.ca.gov/data/d12/cctv/cctvStatusD12.json",
}


def get_cameras(districts: list[int] = [7, 4, 12]) -> list[dict]:
    """Fetch all active cameras with image URLs for given districts."""
    cameras = []
    for d in districts:
        url = DISTRICT_URLS.get(d)
        if not url:
            continue
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            for cam in data.get("data", []):
                cctv = cam.get("cctv", {})
                if cctv.get("inService") != "true":
                    continue
                loc = cctv.get("location", {})
                img = cctv.get("imageData", {})
                static = img.get("static", {})
                image_url = static.get("currentImageURL", "")
                if not image_url:
                    continue
                cameras.append({
                    "id": f"D{d}-{loc.get('route', 'UNK')}-{cctv.get('index', '0')}",
                    "name": loc.get("locationName", "Unknown"),
                    "district": d,
                    "lat": float(loc.get("latitude", 0)),
                    "lon": float(loc.get("longitude", 0)),
                    "county": loc.get("county", ""),
                    "route": loc.get("route", ""),
                    "direction": loc.get("direction", ""),
                    "image_url": image_url,
                    "stream_url": img.get("streamingVideoURL", ""),
                })
        except Exception as e:
            print(f"[caltrans] Error fetching district {d}: {e}")
    return cameras


def fetch_frame(camera: dict) -> tuple[Optional[bytes], Optional[str]]:
    """Download latest JPEG snapshot. Returns (raw_bytes, base64_string)."""
    try:
        resp = requests.get(camera["image_url"], timeout=15)
        if resp.status_code == 200 and len(resp.content) > 1000:
            b64 = base64.b64encode(resp.content).decode()
            return resp.content, b64
    except Exception as e:
        print(f"[caltrans] Frame error {camera['id']}: {e}")
    return None, None


if __name__ == "__main__":
    print("Fetching cameras from District 7 (Los Angeles)...")
    cams = get_cameras([7])
    print(f"Found {len(cams)} active cameras")
    for c in cams[:5]:
        raw, b64 = fetch_frame(c)
        status = f"{len(raw)} bytes" if raw else "FAILED"
        print(f"  {c['name']}: {status}")
