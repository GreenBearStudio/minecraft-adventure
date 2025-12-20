import os
import requests
import shutil
from tusclient import client
import time
import sys

# CONFIG
ACCESS_TOKEN = os.environ.get("VIMEO_TOKEN", "5c1a86f18443bf6d8d8b980406dbc6bf")
SOURCE_FOLDER = "todo"
DEST_FOLDER = "uploaded"
OUTPUT_FILE = "uploaded_video_links.txt"

VIMEO_UPLOAD_ENDPOINT = "https://api.vimeo.com/me/videos"


def create_upload_ticket(file_path):
    """Create a Vimeo upload ticket and return the TUS upload URL + video URI."""
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4"
    }

    data = {
        "upload": {
            "approach": "tus",
            "size": os.path.getsize(file_path)
        },
        "name": os.path.basename(file_path),
        "privacy": {"view": "anybody"}
    }

    response = requests.post(VIMEO_UPLOAD_ENDPOINT, headers=headers, json=data)
    response.raise_for_status()

    video_data = response.json()
    upload_link = video_data["upload"]["upload_link"]
    video_uri = video_data["uri"]

    return upload_link, video_uri


def upload_video(file_path):
    """Upload a video to Vimeo using tusclient with a progress bar."""
    upload_link, video_uri = create_upload_ticket(file_path)

    my_client = client.TusClient(upload_link, headers={
        "Authorization": f"Bearer {ACCESS_TOKEN}"
    })

    uploader = my_client.uploader(
        file_path=file_path,
        url=upload_link,              # IMPORTANT: Vimeo requires resume mode
        chunk_size=5 * 1024 * 1024    # 5MB chunks
    )

    total_size = uploader.get_file_size()
    start_time = time.time()

    # Upload in chunks with progress bar
    while True:
        try:
            before = uploader.offset
            uploader.upload_chunk()
            after = uploader.offset

            # Progress metrics
            uploaded = after
            progress = uploaded / total_size
            percent = progress * 100

            elapsed = time.time() - start_time
            speed = uploaded / (1024 * 1024 * elapsed) if elapsed > 0 else 0
            remaining = (total_size - uploaded) / (speed * 1024 * 1024) if speed > 0 else 0

            # Render progress bar
            bar_len = 40
            filled = int(bar_len * progress)
            bar = "█" * filled + "-" * (bar_len - filled)

            sys.stdout.write(
                f"\r[{bar}] {percent:6.2f}%  "
                f"{uploaded/1024/1024:8.2f}MB / {total_size/1024/1024:8.2f}MB  "
                f"{speed:5.2f} MB/s  ETA {remaining:5.1f}s"
            )
            sys.stdout.flush()

            if uploader.offset >= uploader.get_file_size():
                break

        except Exception as e:
            print(f"\nChunk upload failed, retrying: {e}")
            continue

    print()  # newline after progress bar

    # Build share link
    video_id = video_uri.split("/")[-1]
    share_link = f"https://player.vimeo.com/video/{video_id}"

    return share_link


def main():
    if not os.path.exists(DEST_FOLDER):
        os.makedirs(DEST_FOLDER)

    with open(OUTPUT_FILE, "a") as out_file:
        for filename in os.listdir(SOURCE_FOLDER):
            file_path = os.path.join(SOURCE_FOLDER, filename)

            if os.path.isfile(file_path) and filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
                print(f"Uploading {filename}...")

                try:
                    share_link = upload_video(file_path)
                    out_file.write(f"{filename}# {share_link}\n")
                    print(f"Uploaded {filename} → {share_link}")

                    shutil.move(file_path, os.path.join(DEST_FOLDER, filename))

                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")


if __name__ == "__main__":
    main()

