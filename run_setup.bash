#!/bin/bash
set -e

# Check if need to create virtual environment folder
folder_path=".venv"

CREATE_VENV=""
if [ -d "$folder_path" ]; then
    echo "Folder '$folder_path' exists, will not create venv."
else
    echo "Folder '$folder_path' does not exist, will create venv."
    CREATE_VENV="yes"
fi

# Create a virtual environment, if not there
if [[ "$CREATE_VENV" == "yes" ]]; then
    echo "Creating ${folder_path} virtual env folder"
    python3 -m venv .venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* || "$OSTYPE" == "cygwin"* ]]; then
    echo "Running on Linux/MacOS/Cygwin."
    source .venv/bin/activate
elif [ -n "$MSYSTEM" ]; then
    echo "Running in an MSYS2 environment (MSYSTEM is set to: $MSYSTEM)"
    .venv\Scripts\activate
else
    echo "Unknown operating system."
    exit 1
fi
echo "Virtual env: $VIRTUAL_ENV"

# Install dependencies, it handles not installing too
pip install -r requirements.txt

echo "DONE"

