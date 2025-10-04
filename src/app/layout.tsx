// src/app/layout.tsx
import React from 'react'
import AuthProvider from './components/providers/AuthProvider'
import './globals.css'

export const metadata = {
  title: 'Tree‑Minder',
  description: 'Log and track planted seedlings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
      </head>
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial' }}>
        <AuthProvider>
          <header style={{ borderBottom: '1px solid #eee', padding: '12px 20px', marginBottom: 12 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Tree‑Minder</h2>
              <nav style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                <a href="/">Home</a>
                <a href="/add-plant">Add Plant</a>
                <a href="/map">View Map</a>
                <a href="/api/plants">API: Plants</a>
              </nav>
            </div>
          </header>

          <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}