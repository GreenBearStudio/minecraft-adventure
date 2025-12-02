export default function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="media-block">
      {images.map((src, i) => (
        <div key={i} className="media-item">
          <img src={src} alt={`screenshot-${i}`} />
        </div>
      ))}
    </div>
  )
}

