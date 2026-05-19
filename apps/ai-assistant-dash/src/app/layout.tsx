import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Assistant Dashboard',
  description: 'Optimization, Safety, and Security for your AI workflows.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'inherit' }}>Assistant Dash</a>
            <div>
              <a href="/blog" style={{ marginLeft: '1rem' }}>Blog</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="container">
          <p>&copy; {new Date().getFullYear()} AI Assistant Dash. Powered by ThumbGate & AnswerGuard.</p>
        </footer>
      </body>
    </html>
  )
}
