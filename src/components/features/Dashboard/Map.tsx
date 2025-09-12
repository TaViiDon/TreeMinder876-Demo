"use client"

import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps"

export default function Map() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        defaultZoom={3}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      />
    </APIProvider>
  )
}