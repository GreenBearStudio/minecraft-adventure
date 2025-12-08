// components/AssetImage.tsx
import { assetsImage } from "../assetsImageMap"

type Props = {
  name: string
  alt?: string
}

export default function AssetImage({ name, alt }: Props) {
  const src = assetsImage[name]
  if (!src) {
    return <span style={{ color: "red" }}>Missing asset: {name}</span>
  }
  return (
    <div className="media-block">
      <div className="media-item">
          <img src={src} alt={alt || name} />
      </div>
    </div>
  )
}

