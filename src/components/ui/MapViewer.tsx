"use client"
import React from 'react'
import RealMapViewer from '@/components/MapViewer'

export default function MapViewer(props: any) {
  // RealMapViewer expects no props; we provide a minimal adapter
  // If props.selectedTree is present, you can extend RealMapViewer to highlight it
  return <RealMapViewer />
}
