type Props = { src: string }

export default function VideoEmbed({ src }: Props) {
  return (
    <div style={{ margin: '20px 0' }}>
      <iframe
        width="560"
        height="315"
        src={src}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

