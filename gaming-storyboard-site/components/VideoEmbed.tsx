type Props = { src: string }

export default function VideoEmbed({ src }: Props) {
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

