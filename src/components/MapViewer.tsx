// src/components/MapViewer.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import type { Plant } from '@/lib/types';

export default function MapViewer(props: { 
  trees?: any[]; 
  selectedTree?: any; 
  onTreeSelect?: Function; 
  mode?: string 
} = {}) {
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // If trees passed in props, use them; otherwise fetch
    if (props.trees && Array.isArray(props.trees)) {
      setPlants(props.trees)
      setLoading(false)
      return
    }
    fetchPlants();
  }, [props.trees]);

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
          center: [18.0, -77.5],
          zoom: 7
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });

      } catch (error) {
        console.error('Error loading mapbox:', error);
        setError('Failed to load map');
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

  // Update markers when plants data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const updateMarkers = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers for each plant
      plants.forEach((plant) => {
        const el = document.createElement('div');
        el.className = 'tree-marker cursor-pointer';
        el.style.cursor = 'pointer';

        // Create marker with tree icon
        el.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
              🌳
            </div>
          </div>
        `;

        // Create popup content
        const popupContent = `
          <div style="min-width: 250px; max-width: 300px; padding: 12px;">
            <h3 style="margin: 0 0 10px 0; color: #2E7D32; font-size: 16px;">
              ${plant.name || 'Unnamed Tree'}
            </h3>
            
            <div style="margin-bottom: 8px; font-size: 14px;">
              <strong>Planted:</strong> ${plant.plantedAt ? new Date(plant.plantedAt).toLocaleDateString() : 'Unknown'}
            </div>
            
            ${plant.planter ? `
              <div style="margin-bottom: 8px; font-size: 14px;">
                <strong>Planter:</strong> ${plant.planter.name}
              </div>
            ` : ''}
            
            <div style="margin-bottom: 8px; font-size: 12px; color: #666;">
              <strong>Location:</strong> ${plant.latitude.toFixed(4)}, ${plant.longitude.toFixed(4)}
            </div>
            
            ${plant.imageUrl ? `
              <div style="margin-top: 10px;">
                <img 
                  src="${plant.imageUrl}" 
                  alt="${plant.name}"
                  style="
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 4px;
                  "
                  onerror="this.style.display='none'"
                />
              </div>
            ` : ''}
            
            <div style="
              margin-top: 10px; 
              padding: 8px; 
              background-color: #E8F5E8; 
              border-radius: 4px;
              font-size: 12px;
            ">
              🌱 Plant ID: ${plant.id}
            </div>

            <button 
              onclick="window.dispatchEvent(new CustomEvent('selectTree', { detail: ${JSON.stringify(plant)} }))"
              style="
                width: 100%;
                margin-top: 10px;
                padding: 8px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              "
            >
              Select Tree
            </button>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([plant.longitude, plant.latitude])
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);

        // Add click handler for marker
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (props.onTreeSelect) {
            props.onTreeSelect(plant);
          }
        });
      });

      // Fit map to bounds if we have plants
      if (plants.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        plants.forEach(plant => {
          bounds.extend([plant.longitude, plant.latitude]);
        });
        
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 40, duration: 1000 });
        }
      }
    };

    updateMarkers();
  }, [mapLoaded, plants, props.onTreeSelect]);

  // Handle tree selection from popups
  useEffect(() => {
    const handleSelectTree = (event: CustomEvent) => {
      const plant: Plant = event.detail;
      if (props.onTreeSelect) {
        props.onTreeSelect(plant);
      }
    };

    window.addEventListener('selectTree', handleSelectTree as EventListener);
    
    return () => {
      window.removeEventListener('selectTree', handleSelectTree as EventListener);
    };
  }, [props.onTreeSelect]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/plants', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      
      const data = await response.json();
      setPlants(Array.isArray(data) ? data : data.plants || data.trees || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plants');
      console.error('Error fetching plants:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '90vh' 
      }}>
        <div>Loading plants map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '90vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ color: 'red' }}>Error: {error}</div>
        <button 
          onClick={fetchPlants}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>🌳 Tree Tracker</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          Total Plants: {plants.length}
        </p>
      </div>

      <div ref={mapContainer} className="h-full w-full" />

      {/* Refresh button */}
      <button 
        onClick={fetchPlants}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '10px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        🔄 Refresh
      </button>

      {/* Selected Tree Info Panel */}
      {props.selectedTree && (
        <div style={{ 
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2E7D32' }}>
            {props.selectedTree.name}
          </h3>
          
          {props.selectedTree.imageUrl && (
            <img 
              src={props.selectedTree.imageUrl} 
              alt={props.selectedTree.name}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '12px'
              }}
            />
          )}
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Planted:</strong> {props.selectedTree.plantedAt ? new Date(props.selectedTree.plantedAt).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Location:</strong> {props.selectedTree.latitude.toFixed(4)}, {props.selectedTree.longitude.toFixed(4)}</p>
            {props.selectedTree.planter && (
              <p><strong>Planter:</strong> {props.selectedTree.planter.name}</p>
            )}
            <p><strong>Status:</strong> {props.selectedTree.status || 'Healthy'}</p>
          </div>
        </div>
      )}
    </div>
  );
}