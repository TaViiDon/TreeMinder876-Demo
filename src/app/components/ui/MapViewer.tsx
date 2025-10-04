// src/app/components/ui/MapViewer.tsx - DELETE MapViewerClient.tsx and use this only
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Tree } from '@/lib/types';

interface MapViewerProps {
  trees: Tree[];
  selectedTree: Tree | null;
  onTreeSelect: (tree: Tree) => void;
  mode: 'supplier' | 'custodian';
  onTreeUpdate?: (tree: Tree) => void;
}

export default function MapViewer({
  trees,
  selectedTree,
  onTreeSelect,
  mode,
  onTreeUpdate
}: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
       // await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'your_mapbox_token_here';

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [36.8219, -1.2921],
          zoom: 2
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });

        return () => {
          if (map.current) {
            map.current.remove();
          }
        };
      } catch (error) {
        console.error('Error loading mapbox:', error);
      }
    };

    initializeMap();
  }, [isClient]);

  useEffect(() => {
    if (!mapLoaded || !map.current || !isClient) return;

    const addMarkers = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      trees.forEach(tree => {
        const el = document.createElement('div');
        el.className = 'tree-marker cursor-pointer';
        
        const treeCount = mode === 'supplier'
          ? (tree.planter?.plantedTrees?.length ?? 0)
          : 1;

        if (mode === 'supplier' && tree.planter?.profileImage) {
          el.innerHTML = `
            <div class="relative">
              <img 
                src="${tree.planter.profileImage}" 
                alt="${tree.planter.name}"
                class="w-8 h-8 rounded-full border-2 border-white shadow-lg"
              />
              <div class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                ${treeCount}
              </div>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
              ${treeCount}
            </div>
          `;
        }

        el.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          onTreeSelect(tree);
          map.current?.flyTo({
            center: [tree.longitude, tree.latitude],
            zoom: 15
          });
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([tree.longitude, tree.latitude])
          .addTo(map.current);

        markersRef.current.push(marker);
      });

      // Fly to selected tree
      if (selectedTree && map.current) {
        map.current.flyTo({
          center: [selectedTree.longitude, selectedTree.latitude],
          zoom: 15
        });
      }
    };

    addMarkers();
  }, [mapLoaded, trees, selectedTree, mode, onTreeSelect, isClient]);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Tree Details Panel */}
      {selectedTree && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center space-x-3 mb-4">
            {selectedTree.planter?.profileImage && (
              <img
                src={selectedTree.planter.profileImage}
                alt={selectedTree.planter?.name || 'Planter'}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold">{selectedTree.planter?.name || 'Unknown'}</h3>
              <p className="text-sm text-gray-600">
                Trees planted: {selectedTree.planter?.plantedTrees?.length ?? 0}
              </p>
            </div>
          </div>

          <h4 className="font-bold text-lg mb-2">Tree - {selectedTree.treeId}</h4>
          
          {selectedTree.images && selectedTree.images.length > 0 && (
            <img
              src={selectedTree.images[0].url}
              alt={selectedTree.images[0].caption || 'Tree image'}
              className="w-full h-48 object-cover rounded mb-3"
            />
          )}

          <div className="space-y-2 text-sm">
            <p><strong>Species:</strong> {selectedTree.species || 'Unknown'}</p>
            <p><strong>Planted:</strong> {selectedTree.plantedDate ? new Date(selectedTree.plantedDate).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Status:</strong> {selectedTree.status}</p>
            <p><strong>Location:</strong> {selectedTree.latitude.toFixed(4)}, {selectedTree.longitude.toFixed(4)}</p>
          </div>

          {mode === 'custodian' && onTreeUpdate && (
            <div className="mt-4">
              <button
                onClick={() => {/* Open update modal */}}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Add Tree Update
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}