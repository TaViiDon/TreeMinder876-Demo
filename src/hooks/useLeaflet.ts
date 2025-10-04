"use client"

import { useEffect } from 'react'

// No-op replacement for legacy Leaflet initialization.
// The project has migrated to Mapbox; keep this hook to avoid breaking imports
// but it intentionally does nothing.
export default function useLeaflet() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // intentionally no-op
    return () => {}
  }, [])
}
