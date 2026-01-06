import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUI } from '../context/UIContext'   // <-- unified context
import pkg from "../package.json";

type Episode = { slug: string; title: string }
type Props = { children: React.ReactNode; episodes: Episode[] }

export default function Layout({ children, episodes }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useUI()   // <-- from UIContext

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value
    if (slug) router.push(`/episodes/${slug}`)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <nav className="layout-nav">
          <Link href="/" className="button">Home</Link>
          <Link href="/about" className="button">About</Link>
          <Link href="/settings" className="button">Settings</Link>
        </nav>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        {pkg.name} v{pkg.version}
      </footer>
    </div>
  )
}

