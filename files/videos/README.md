- video width = ?
- video height = ?

## Videos

- small files (< 200 MB), use `sync_videos.py` script, doesn't need tuspy.
- large files (> 200 MB, especially > 500 MB), use `sync_large_videos.py` script, uses tuspy.

## ffplay viewing

ffplay output.mp4

## ffmpeg editing

Example, clip `input.mp4` from 1 minute to 2 minutes and 30 seconds.

ffmpeg -ss 00:01:00 -to 00:02:30 -i input.mp4 -c:v libx264 -crf 23 -preset fast -c:a aac output_clip.mp4

- c:v libx264 → re‑encode video with H.264
- crf 23 → quality setting
- c:a aac → re‑encode audio

