"use client"
import React from 'react'
import RealCustodianPlants from '@/components/CustodianPlants'

export default function CustodianPlants(props: any) {
  // Adapter: if props.trees exists, map to internal format used by RealCustodianPlants
  // For now, call original component (which fetches its own data) to keep behavior stable
  return <RealCustodianPlants />
}
