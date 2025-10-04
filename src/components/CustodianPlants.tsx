"use client"
import React, { useEffect, useState } from 'react'
import type { Plant } from '@/lib/types'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}

export default function CustodianPlants(props: { trees?: any[]; onTreeSelect?: (t: any) => void; selectedTree?: any } = {}) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPlantedAt, setEditPlantedAt] = useState('')
  const [editImage, setEditImage] = useState<File | null>(null)

  useEffect(() => {
    if (props.trees && Array.isArray(props.trees)) {
      setPlants(props.trees as any)
      return
    }
    const payloadRaw = localStorage.getItem('user')
    if (!payloadRaw) return
    try {
      const user = JSON.parse(payloadRaw)
      fetch(`/api/plants?planterId=${user.sub}`).then(r => r.json()).then(setPlants)
    } catch (e) {
      console.warn('failed to parse user from storage', e)
    }
  }, [props.trees])

  async function handleDelete(id: string | number) {
    const token = getToken()
    if (!token) return alert('Not authenticated')
    setLoading(true)
    try {
      const res = await fetch(`/api/plants/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setPlants(p => p.filter(x => x.id !== id))
      else alert('Delete failed')
    } finally { setLoading(false) }
  }

  function onTreeClick(t: Plant) {
    if (props.onTreeSelect) props.onTreeSelect(t as any)
  }

  async function startEdit(p: Plant) {
    setEditingId(p.id)
    setEditName(p.name ?? '')
    setEditPlantedAt(p.plantedAt ? new Date(p.plantedAt).toISOString().slice(0, 16) : '')
  }

  async function submitEdit(id: string | number) {
    const token = getToken()
    if (!token) return alert('Not authenticated')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', editName)
  fd.append('plantedAt', new Date(editPlantedAt || new Date().toISOString()).toISOString())
      if (editImage) fd.append('image', editImage)

      const res = await fetch(`/api/plants/${id}`, { method: 'PATCH', body: fd, headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) return alert('Update failed')
      const updated = await res.json()
  setPlants(plants.map(p => p.id === id ? updated : p))
      setEditingId(null)
    } finally { setLoading(false) }
  }

  return (
    <div>
      {plants.length === 0 && <p>No plants yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {plants.map(p => (
          <li key={p.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                {editingId === p.id ? (
                  <div>
                    <input value={editName} onChange={e => setEditName(e.target.value)} />
                    <input type="datetime-local" value={editPlantedAt} onChange={e => setEditPlantedAt(e.target.value)} />
                    <input type="file" accept="image/*" onChange={e => setEditImage(e.target.files ? e.target.files[0] : null)} />
                  </div>
                ) : (
                  <>
                    <strong style={{cursor: 'pointer'}} onClick={() => onTreeClick(p)}>{p.name}</strong>
                    <div>{p.plantedAt ? new Date(p.plantedAt).toLocaleString() : 'Unknown'}</div>
                    <div>{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</div>
                  </>
                )}
              </div>
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: 120, height: 80, objectFit: 'cover' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/map?plant=${p.id}`)}>Copy link</button>
                {editingId === p.id ? (
                  <>
                    <button onClick={() => submitEdit(p.id)} disabled={loading}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} disabled={loading}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
