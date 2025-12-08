// components/AssetImage.tsx
import { assetsVideo } from "../assetsVideoMap"

type Props = {
  name: string
}

export default function AssetVideo({ name }: Props) {
  const src = assetsVideo[name]
  if (!src) {
    return <span style={{ color: "red" }}>Missing asset: {name}</span>
  }
  return (
    <div className="media-block">
      <div className="media-item video-embed">
        <iframe
          src={src}
          title="video-embed"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

