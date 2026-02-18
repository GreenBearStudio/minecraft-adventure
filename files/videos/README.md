- video width = ?
- video height = ?

## Videos

- streaming uploader for files use `sync_videos.py` script, uses tuspy.

## ffplay viewing

ffplay output.mp4

## ffmpeg editing

Example, clip `input.mp4` from 1 minute to 2 minutes and 30 seconds.

ffmpeg -ss 00:01:00 -to 00:02:30 -i input.mp4 -c:v libx264 -crf 23 -preset fast -c:a aac output_clip.mp4

- c:v libx264 → re‑encode video with H.264
- crf 23 → quality setting
- c:a aac → re‑encode audio

## ffmpeg image extraction

ffmpeg -ss 00:00:05 -i input.mp4 -frames:v 1 output.png

- ss 00:00:05 → seek to 5 seconds
- frames:v 1 → output exactly one frame
- output.png → choose PNG or JPG depending on your needs

