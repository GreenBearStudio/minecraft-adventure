// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Inline script to set theme before hydration with diagnostic safeguard */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved) {
                    document.documentElement.setAttribute('data-theme', saved);
                    console.log("[Theme] Loaded from localStorage:", saved);
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    console.log("[Theme] No saved theme, defaulting to system preference: dark");
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    console.log("[Theme] No saved theme, defaulting to system preference: light");
                  }
                } catch (e) {
                  console.warn("[Theme] Error applying theme preference:", e);
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

