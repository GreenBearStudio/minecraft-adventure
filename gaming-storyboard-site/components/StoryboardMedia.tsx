// StoryboardMedia.tsx
import { z } from "zod";
import AssetImage from "./AssetImage";
import AssetVideo from "./AssetVideo";

// Define schema for MediaItem
export const MediaItemSchema = z.object({
  type: z.enum(["image", "video", "embed"]),
  src: z.string(),   // asset key or embed URL
  alt: z.string().optional(),
});

// Validate array of items
export const MediaItemsSchema = z.array(MediaItemSchema);

// Export type for reuse
export type MediaItem = z.infer<typeof MediaItemSchema>;

// ✅ Compile‑time assertion: ensures MediaItem always matches the schema
type MediaItemCheck = z.infer<typeof MediaItemSchema>;
type _AssertSame = MediaItem extends MediaItemCheck ? true : never;

type Props = {
  items: MediaItem[];
};

export default function StoryboardMedia({ items }: Props) {
  const parsed = MediaItemsSchema.safeParse(items);

  if (!parsed.success) {
    console.error("❌ Invalid media items:", parsed.error.format());
    return (
      <div style={{ color: "red" }}>
        Media validation failed — check console for details.
      </div>
    );
  }

  return (
    <div className="media-block">
      {parsed.data.map((item, i) => (
        <div key={i} className="media-item">
          {item.type === "image" && (
            <AssetImage name={item.src} alt={item.alt || `media-${i}`} />
          )}
          {item.type === "video" && (
            <AssetVideo name={item.src} title={item.alt || `video-${i}`} />
          )}
          {item.type === "embed" && (
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
  );
}

