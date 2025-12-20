// pages/_app.tsx
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { UIProvider } from '../context/UIContext'
import { ToastProvider } from '../context/ToastContext'
import { StoryStateProvider } from "../context/StoryStateContext"
import { StoryNamespaceProvider } from "../context/StoryNamespaceContext"

// Import global stylesheet once here
import '../styles/globals.css'

// MDX components
import components from "../mdx-components";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoryStateProvider>
      <UIProvider>
        <ToastProvider>
          <MDXProvider components={components}>
            <Component {...pageProps} />
          </MDXProvider>
        </ToastProvider>
      </UIProvider>
    </StoryStateProvider>
  );
}



