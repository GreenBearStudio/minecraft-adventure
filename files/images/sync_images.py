import os
import requests
import shutil

# CONFIG
IMGBB_API_KEY = "5bbf633278499f8a3608b030bc46ed87"
SOURCE_FOLDER = "todo"
DEST_FOLDER = "uploaded"
OUTPUT_FILE = "uploaded_image_links.txt"

UPLOAD_URL = "https://api.imgbb.com/1/upload"

def upload_image(file_path):
    with open(file_path, "rb") as f:
        payload = {
            "key": IMGBB_API_KEY,
        }
        files = {
            "image": f
        }
        response = requests.post(UPLOAD_URL, data=payload, files=files)
        response.raise_for_status()
        data = response.json()
        return data["data"]["url"]  # Direct link to the image

def main():
    if not os.path.exists(DEST_FOLDER):
        os.makedirs(DEST_FOLDER)

    with open(OUTPUT_FILE, "a") as out_file:
        for filename in os.listdir(SOURCE_FOLDER):
            file_path = os.path.join(SOURCE_FOLDER, filename)
            if os.path.isfile(file_path) and filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                print(f"Uploading {filename}...")
                try:
                    link = upload_image(file_path)
                    out_file.write(f"{filename}# {link}\n")
                    print(f"Uploaded {filename} → {link}")

                    # Move file to uploaded folder
                    shutil.move(file_path, os.path.join(DEST_FOLDER, filename))
                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")

if __name__ == "__main__":
    main()

