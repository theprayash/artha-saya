'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#071d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '0 20px' }}>
        <div>
          <p style={{ color: '#7a9eb5', fontSize: 12, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Critical Error
          </p>
          <h1 style={{ color: '#F8F9F4', fontSize: 32, fontWeight: 900, marginBottom: 16 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#BFCCD5', fontSize: 14, marginBottom: 32 }}>
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', background: '#C8A756', color: '#000', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  )
}
