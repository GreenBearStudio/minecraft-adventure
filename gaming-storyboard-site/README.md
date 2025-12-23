
## Folder structure (work in progress..)

gaming-storyboard-site/
├── content/
│   └── episodes/
│       ├── episode-01.mdx
│       ├── episode-02.mdx
│       └── ... more episodes
│
├── components/
│   ├── Layout.tsx            # Global layout wrapper (header, footer, nav)
│   ├── ImageGallery.tsx      # Reusable MDX component for image grids
│   ├── VideoEmbed.tsx        # Reusable MDX component for video iframes
│   └── StoryFlowEmbed.tsx    # Reusable MDX component for interactive flows
│
├── pages/
│   ├── _app.tsx              # Global MDXProvider + wraps pages in Layout
│   ├── index.tsx             # Homepage: auto-discovers episodes, shows grid
│   ├── about.tsx             # About page: project description, auto nav
│   └── episodes/
│       └── [slug].tsx        # Dynamic route: renders each episode with MDXRemote
│
├── public/
│   ├── images/
│   │   ├── phase1.png
│   │   ├── phase2.png
│   │   └── default.png
│   └── clips/
│       └── boss-phase.mp4
│
├── styles/
│   └── globals.css           # Global styles (or Tailwind config if used)
│
├── next.config.ts
├── package.json
└── tsconfig.json

## Next.js build

`bash run_build_core.bash`

basically does two things

- `npm install`
- `npm run build`

### Testing

`bash scripts-bash\test_manual.bash`

## Next.js to Android build

*NOTE* first make sure to build the Next.js project `bash run_build_core.bash`

`bash run_build_android.bash`

this uses Capacitor, WebViewer wrapper for Next.js to Android/Java builds. A
custom local server build that modifies the `MainActivity.java`, allowing server security
for app.

### Testing (Android device via USB)

`bash scripts-bash\test_android.bash`

