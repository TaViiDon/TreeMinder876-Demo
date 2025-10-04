// src/components/SupplierMap.tsx
"use client"
import React, { useEffect, useState, useRef } from 'react'
import type { Plant, PlanterSummary } from '@/lib/types'

export default function SupplierMap() {
  const [planters, setPlanters] = useState<PlanterSummary[]>([])
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [tracking, setTracking] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const pollingRef = useRef<number | null>(null)

  useEffect(() => { 
    fetchPlanters() 
  }, [])

  useEffect(() => {
    if (tracking) {
      fetchPlanters()
      pollingRef.current = window.setInterval(() => fetchPlanters(), 10_000)
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
    return () => { 
      if (pollingRef.current) { 
        clearInterval(pollingRef.current); 
        pollingRef.current = null 
      } 
    }
  }, [tracking])

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        //await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [36.8219, -1.2921],
          zoom: 2
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });

      } catch (error) {
        console.error('Error loading mapbox:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
      markersRef.current.forEach(marker => marker.remove());
    };
  }, []);

  // Update markers when planters data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const updateMarkers = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers for each planter
      planters.forEach(planter => {
        if (!planter.plants || planter.plants.length === 0) return;

        // Calculate centroid for planter's plants
        const [lat, lng] = centroid(planter.plants);

        const el = document.createElement('div');
        el.className = 'tree-marker cursor-pointer';
        
        const treeCount = planter.count || planter.plants.length;

        // Create marker with profile image and tree count
        if (planter.imageUrl) {
          el.innerHTML = `
            <div class="relative">
              <img 
                src="${planter.imageUrl}" 
                alt="${planter.name}"
                class="w-12 h-12 rounded-full border-2 border-white shadow-lg"
              />
              <div class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                ${treeCount}
              </div>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="w-10 h-10 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ${treeCount}
            </div>
          `;
        }

        // Create popup content
        const popupContent = `
          <div style="min-width: 240px; padding: 8px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
              ${planter.imageUrl ? 
                `<img src="${planter.imageUrl}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;" />` : 
                `<div style="width: 56px; height: 56px; border-radius: 50%; background: #eee;"></div>`
              }
              <div>
                <strong>${planter.name}</strong>
                <div style="font-size: 12px; color: #666;">${planter.email || ''}</div>
                <div style="margin-top: 4px; font-size: 14px;">Trees: ${treeCount}</div>
              </div>
            </div>

            <div style="margin-top: 12px;">
              <strong>Recent trees</strong>
              <div style="max-height: 200px; overflow-y: auto;">
                ${planter.plants.map(plant => `
                  <div key="${plant.id}" style="margin-top: 8px; display: flex; gap: 8px; align-items: center; padding: 4px; border-radius: 4px; background: #f8f9fa;">
                    ${plant.imageUrl ? 
                      `<img src="${plant.imageUrl}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;" />` : 
                      `<div style="width: 60px; height: 40px; background: #e9ecef; border-radius: 4px;"></div>`
                    }
                    <div style="flex: 1;">
                      <div style="font-size: 13px; font-weight: 500;">${plant.name}</div>
                      <div style="font-size: 11px; color: #666;">
                        ${plant.plantedAt ? new Date(plant.plantedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <button onclick="window.dispatchEvent(new CustomEvent('zoomToPlant', { detail: ${JSON.stringify(plant)} }))" 
                            style="background: #2E7D32; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                      Zoom
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);
      });

      // Fit map to bounds if we have planters
      if (planters.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        planters.forEach(planter => {
          if (planter.plants && planter.plants.length > 0) {
            const [lat, lng] = centroid(planter.plants);
            bounds.extend([lng, lat]);
          }
        });
        
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 40, duration: 1000 });
        }
      }
    };

    updateMarkers();
  }, [mapLoaded, planters]);

  // Handle zoom to plant events from popups
  useEffect(() => {
    const handleZoomToPlant = (event: CustomEvent) => {
      const plant: Plant = event.detail;
      setSelectedPlant(plant);
      flyToPlant(plant);
    };

    window.addEventListener('zoomToPlant', handleZoomToPlant as EventListener);
    
    return () => {
      window.removeEventListener('zoomToPlant', handleZoomToPlant as EventListener);
    };
  }, []);

  async function fetchPlanters() {
    try {
      const res = await fetch('/api/planters')
      const data = await res.json()
      setPlanters(data)
    } catch (error) {
      console.error('Error fetching planters:', error)
    }
  }

  // Compute centroid for planter's plants
  function centroid(plants: Plant[]) {
    if (!plants.length) return [0, 0]
    const lat = plants.reduce((s, p) => s + p.latitude, 0) / plants.length
    const lng = plants.reduce((s, p) => s + p.longitude, 0) / plants.length
    return [lat, lng]
  }

  // Fly to specific plant
  function flyToPlant(plant: Plant) {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [plant.longitude, plant.latitude],
      zoom: 18,
      duration: 2000
    });

    // Show a temporary popup at the plant location
    setTimeout(async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const plantedText = plant.plantedAt ? new Date(plant.plantedAt).toLocaleString() : 'Unknown';
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="min-width: 180px;">
            <strong>${plant.name}</strong>
            <div style="font-size: 12px; margin-top: 4px;">${plantedText}</div>
            ${plant.imageUrl ? `<img src="${plant.imageUrl}" style="width: 100%; height: 120px; object-fit: cover; margin-top: 8px; border-radius: 4px;" />` : ''}
          </div>
        `);

      new mapboxgl.Popup({ offset: 25 })
        .setLngLat([plant.longitude, plant.latitude])
        .setHTML(`
          <div style="min-width: 180px;">
            <strong>${plant.name}</strong>
            <div style="font-size: 12px; margin-top: 4px;">${plantedText}</div>
            ${plant.imageUrl ? `<img src="${plant.imageUrl}" style="width: 100%; height: 120px; object-fit: cover; margin-top: 8px; border-radius: 4px;" />` : ''}
          </div>
        `)
        .addTo(map.current);
    }, 500);
  }

  const totalTrees = planters.reduce((s, p) => s + (p.count || p.plants?.length || 0), 0)

  return (
    <div style={{ height: '80vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: 8, borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={() => setTracking(t => !t)}
          style={{
            background: tracking ? '#dc2626' : '#16a34a',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          {tracking ? 'Stop tracking' : 'Track trees'}
        </button>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>
          Total trees: {totalTrees}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Planters: {planters.length}
        </div>
      </div>

      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Selected Plant Details Panel */}
      {selectedPlant && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          width: 300, 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '16px',
          zIndex: 1000,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{selectedPlant.name}</h3>
          
          {selectedPlant.imageUrl && (
            <img 
              src={selectedPlant.imageUrl} 
              alt={selectedPlant.name}
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover', 
                borderRadius: '4px',
                marginBottom: '12px'
              }}
            />
          )}
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Planted:</strong> {selectedPlant.plantedAt ? new Date(selectedPlant.plantedAt).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Location:</strong> {selectedPlant.latitude.toFixed(4)}, {selectedPlant.longitude.toFixed(4)}</p>
            <p><strong>Status:</strong> {('status' in selectedPlant ? (selectedPlant as any).status : 'Healthy') || 'Healthy'}</p>
          </div>
          
          <button 
            onClick={() => setSelectedPlant(null)}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '12px',
              width: '100%'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}