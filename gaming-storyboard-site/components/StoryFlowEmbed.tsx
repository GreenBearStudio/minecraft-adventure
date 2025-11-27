type Props = {
  src: string
  height?: number
}

export default function StoryFlowEmbed({ src, height = 600 }: Props) {
  return (
    <div style={{ margin: '20px 0' }}>
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
        allow="fullscreen"
      />
    </div>
  )
}

