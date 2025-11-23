type Props = { images: string[] }

export default function ImageGallery({ images }: Props) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {images.map((src, i) => (
        <img key={i} src={src} alt={`screenshot-${i}`} width="300" />
      ))}
    </div>
  )
}

