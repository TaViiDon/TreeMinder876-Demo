// src/components/AddPlantMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Plant } from '@/lib/types';

interface AddPlantMapProps {
  userId: string;
}

export default function AddPlantMap({ userId }: AddPlantMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null); // [lat, lng]
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mapboxglMod = await import('mapbox-gl');
        const mapboxgl = (mapboxglMod as any).default ?? mapboxglMod;
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        if (!mapContainer.current || !mounted) return;

        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [ -77.5, 18.0 ], // [lng, lat]
          zoom: 7,
        });

        // click to set position
        mapRef.current.on('click', (e: any) => {
          const lng = e.lngLat.lng;
          const lat = e.lngLat.lat;
          setPosition([lat, lng]);

          // update marker
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
          } else {
            const el = document.createElement('div');
            el.className = 'tree-marker cursor-pointer';
            el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#16a34a;color:white;font-size:14px;">🌳</div>`;
            markerRef.current = new mapboxgl.Marker({ element: el })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
          }
        });

      } catch (err) {
        console.error('Failed to load Mapbox in AddPlantMap', err);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (markerRef.current) {
          markerRef.current.remove();
        }
        if (mapRef.current) {
          mapRef.current.remove();
        }
      } catch (e) {}
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!position) {
      alert('Please pick a location on the map first');
      return;
    }

    if (!name.trim()) {
      alert('Please enter a plant name');
      return;
    }

    if (!userId) {
      alert('Please log in first');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('latitude', position[0].toString());
      formData.append('longitude', position[1].toString());
      formData.append('plantedAt', date || new Date().toISOString().split('T')[0]);
      formData.append('planterId', userId);
      if (file) {
        formData.append('image', file);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create plant');

      const data = await response.json();
      console.log('Plant created:', data);

      setName('');
      setDate('');
      setFile(null);
      setPosition(null);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      alert('Plant added successfully!');
    } catch (err) {
      console.error('Error creating plant', err);
      alert('Failed to add plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '400px' }}>
        <div style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}>
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
        </div>
        {position && (
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            Selected location: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        )}
      </div>

      <div style={{ flex: '0 0 300px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Plant Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter plant name"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>

          <div>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Date Planted
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Plant Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !position || !name.trim() || !userId}
            style={{
              padding: '12px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? 'Adding Plant...' : 'Add Plant'}
          </button>

          {!userId && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              Please log in to add plants
            </p>
          )}
        </form>
      </div>
    </div>
  );
}