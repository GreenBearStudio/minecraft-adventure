#!/bin/bash
set -e

# Activate virtual environment
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* || "$OSTYPE" == "cygwin"* ]]; then
    echo "Running on Linux/MacOS/Cygwin."
    LP="/"
    source .venv/bin/activate
elif [ -n "$MSYSTEM" ]; then
    echo "Running in an MSYS2 environment (MSYSTEM is set to: $MSYSTEM)"
    LP="\\"
    .venv\Scripts\activate
else
    echo "Unknown operating system."
    exit 1
fi
echo "Virtual env: $VIRTUAL_ENV"

# Run the image sync
(
  cd "files${LP}images${LP}"
  python3 sync_images.py
)
echo "DONE images"

# Run the video (TUS protocol) sync
(
  cd "files${LP}videos${LP}"
  #python3 sync_large_videos.py
)
#echo "DONE videos"

echo "DONE"
