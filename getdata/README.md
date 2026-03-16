# getdata — SF CCTV camera data

Fetches San Francisco area Caltrans CCTV cameras (image + streaming video URLs) from the official ArcGIS API and saves to `sf_cameras.json`.

## Run

From repo root:

```bash
python getdata/fetch_sf_cameras.py
```

Output: `getdata/sf_cameras.json` (28 cameras with `current_image_url` and `streaming_video_url`).

## Refresh

Re-run the script anytime to refresh the list. For periodic refresh, run it on a schedule (e.g. cron/Task Scheduler) or use a loop with `time.sleep(600)`.
