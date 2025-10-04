// src/app/map/page.tsx
'use client';

import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('@/components/MapViewer'), { 
  ssr: false 
});

export default function MapPage() {
  return <MapViewer />;
}