"""Quick smoke test — verifies Caltrans feeds are live and agent can be initialized."""
import os
import sys

print("=" * 60)
print("SENTINEL — Smoke Test")
print("=" * 60)

# 1. Test Caltrans API
print("\n[1/3] Testing Caltrans CCTV API...")
from caltrans import get_cameras, fetch_frame

cameras = get_cameras([7])
print(f"  Found {len(cameras)} active cameras in District 7 (LA)")
if not cameras:
    print("  ❌ No cameras found — check internet connection")
    sys.exit(1)

cam = cameras[0]
print(f"  Testing camera: {cam['name']}")
raw, b64 = fetch_frame(cam)
if raw:
    print(f"  ✅ Frame fetched: {len(raw)} bytes, base64 length: {len(b64)}")
else:
    print("  ❌ Could not fetch frame")
    sys.exit(1)

# 2. Test NVIDIA API key
print("\n[2/3] Testing NVIDIA API key...")
api_key = os.getenv("NVIDIA_API_KEY", "")
if not api_key:
    print("  ⚠️  NVIDIA_API_KEY not set — skipping agent test")
    print("  Set it with: export NVIDIA_API_KEY=nvapi-YOUR_KEY")
    print("\n[3/3] Skipped (no API key)")
    print("\n✅ Caltrans feed works! Set your API key to test the full pipeline.")
    sys.exit(0)

print(f"  Key: {api_key[:12]}...")

# 3. Test full pipeline
print("\n[3/3] Testing full analysis pipeline...")
from agent import SentinelAgent

agent = SentinelAgent(api_key)
report = agent.analyze(b64, cam)

print(f"\n  📋 Incident Report:")
print(f"     ID:         {report.incident_id}")
print(f"     Camera:     {report.camera_name}")
print(f"     Is Incident: {report.is_incident}")
print(f"     Severity:   {report.severity}/10")
print(f"     Type:       {report.incident_type}")
print(f"     Vehicles:   {report.vehicles_involved}")
print(f"     Confidence: {report.confidence}")
print(f"     Description: {report.description}")
print(f"     Response:   {report.recommended_response}")

print("\n✅ All tests passed! Run the server with:")
print("   uvicorn server:app --host 0.0.0.0 --port 8000")
