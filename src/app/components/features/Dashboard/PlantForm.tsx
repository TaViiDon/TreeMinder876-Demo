 'use client';

import { useState } from 'react';
import type { Tree } from '@/lib/types';

interface Props {
  onTreeAdded: (tree: Tree) => void;
}

export default function PlantForm({ onTreeAdded }: Props) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('plantedAt', date || new Date().toISOString());
      form.append('latitude', latitude);
      form.append('longitude', longitude);
      if (image) form.append('image', image);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        onTreeAdded(data);
        setName('');
        setDate('');
        setLatitude('');
        setLongitude('');
        setImage(null);
      } else {
        console.error('Failed to create tree', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <div className="text-sm font-medium">Species / Name</div>
        <input className="mt-1 w-full border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Planted At</div>
        <input type="date" className="mt-1 w-full border rounded p-2" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Latitude</div>
        <input className="mt-1 w-full border rounded p-2" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Longitude</div>
        <input className="mt-1 w-full border rounded p-2" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Image</div>
        <input type="file" className="mt-1" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </label>

      <div className="flex space-x-2">
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded" disabled={loading}>
          {loading ? 'Adding...' : 'Add Plant'}
        </button>
      </div>
    </form>
  );
}
