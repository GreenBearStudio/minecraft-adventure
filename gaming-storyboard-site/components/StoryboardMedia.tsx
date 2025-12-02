type MediaItem = {
  type: 'image' | 'video' | 'embed'
  src: string
  alt?: string
}

type Props = {
  items: MediaItem[]
}

export default function StoryboardMedia({ items }: Props) {
  return (
    <div className="media-block">
      {items.map((item, i) => (
        <div key={i} className="media-item">
          {item.type === 'image' && (
            <img src={item.src} alt={item.alt || `media-${i}`} />
          )}

          {item.type === 'video' && (
            <div className="video-embed">
              <iframe
                src={item.src}
                title={item.alt || `video-${i}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {item.type === 'embed' && (
            <div className="embed-block">
              <iframe
                src={item.src}
                title={item.alt || `embed-${i}`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

