import os
import requests
import shutil

# CONFIG
ACCESS_TOKEN = "YOUR_VIMEO_ACCESS_TOKEN"
SOURCE_FOLDER = "todo"
DEST_FOLDER = "uploaded"
OUTPUT_FILE = "uploaded_video_links.txt"

# Vimeo API endpoints
UPLOAD_ENDPOINT = "https://api.vimeo.com/me/videos"

def upload_video(file_path):
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4"
    }

    # Step 1: Create video upload ticket
    data = {
        "upload": {
            "approach": "tus",
            "size": os.path.getsize(file_path)
        },
        "name": os.path.basename(file_path),
        "privacy": {"view": "anybody"}  # public link
    }

    response = requests.post(UPLOAD_ENDPOINT, headers=headers, json=data)
    response.raise_for_status()
    video_data = response.json()

    # Step 2: Get upload link
    upload_link = video_data["upload"]["upload_link"]
    video_uri = video_data["uri"]

    # Step 3: Upload file via TUS protocol (simplified single request)
    with open(file_path, "rb") as f:
        tus_headers = {
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/offset+octet-stream",
            "Upload-Offset": "0",
            "Tus-Resumable": "1.0.0"
        }
        tus_response = requests.patch(upload_link, headers=tus_headers, data=f)
        tus_response.raise_for_status()

    # Step 4: Get share link
    video_id = video_uri.split("/")[-1]
    share_link = f"https://player.vimeo.com/video/{video_id}"

    return share_link

def main():
    if not os.path.exists(DEST_FOLDER):
        os.makedirs(DEST_FOLDER)

    with open(OUTPUT_FILE, "a") as out_file:
        for filename in os.listdir(SOURCE_FOLDER):
            file_path = os.path.join(SOURCE_FOLDER, filename)
            if os.path.isfile(file_path) and filename.lower().endswith((".mp4", ".mov", ".avi")):
                print(f"Uploading {filename}...")
                try:
                    share_link = upload_video(file_path)
                    out_file.write(f"{filename}# {share_link}\n")
                    print(f"Uploaded {filename} → {share_link}")

                    # Move file to uploaded folder
                    shutil.move(file_path, os.path.join(DEST_FOLDER, filename))
                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")

if __name__ == "__main__":
    main()

