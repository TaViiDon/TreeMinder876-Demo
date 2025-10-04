"use client"
import React from 'react'
// Update the import path if SupplierMap is in src/components/SupplierMap.tsx
import SupplierMap from '../../../components/SupplierMap'

export default function SupplierDashboard() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Supplier Dashboard</h1>
      <SupplierMap />
    </div>
  )
}
