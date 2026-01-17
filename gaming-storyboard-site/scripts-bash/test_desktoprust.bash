#!/bin/bash
set -e

echo "Starting Tauri dev mode..."
(
  cd tauri-app/src-tauri
  cargo run
)

