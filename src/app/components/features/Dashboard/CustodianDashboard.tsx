'use client';

import { useState, useEffect } from 'react';
import AddPlantMap from '@/components/AddPlantMap';
import MapViewer from '@/components/ui/MapViewer';
import PlantForm from './PlantForm';
import { useSession } from '@/hooks/useSession';
import type { Tree } from '@/lib/types';


export default function CustodianDashboard() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('view');
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  useEffect(() => {
    fetchMyTrees();
  }, []);

  const fetchMyTrees = async () => {
    try {
      const response = await fetch('/api/custodian/trees');
      const data = await response.json();
      setTrees(data.trees || data);
    } catch (error) {
      console.error('Error fetching trees:', error);
    }
  };

  const handleTreeAdded = (newTree: Tree) => {
    setTrees(prev => [newTree, ...prev]);
    setActiveTab('view');
  };

  const handleTreeUpdate = (updatedTree: Tree) => {
    setTrees(prev => prev.map(tree => 
      tree.id === updatedTree.id ? updatedTree : tree
    ));
    setSelectedTree(updatedTree);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-green-700 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Custodian Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'add' ? 'bg-white text-green-700' : 'bg-green-600'
                }`}
              >
                Add Plant
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'view' ? 'bg-white text-green-700' : 'bg-green-600'
                }`}
              >
                View My Plants
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'add' ? (
          <div className="h-full flex">
            <div className="w-96 bg-white border-r border-gray-200 p-4 overflow-y-auto">
              <PlantForm onTreeAdded={handleTreeAdded} />
            </div>
            <div className="flex-1">
              <AddPlantMap userId={user?.id ?? ''} />
            </div>
          </div>
        ) : (
          <div className="h-full flex">
            <div className="w-96 bg-white border-r border-gray-200 p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">My Plants ({trees.length})</h2>
              <div className="space-y-4">
                {trees.map(tree => (
                  <div
                    key={tree.id}
                    className={`p-4 border rounded cursor-pointer ${
                      selectedTree?.id === tree.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedTree(tree)}
                  >
                    <h3 className="font-semibold">Tree - {tree.treeId}</h3>
                    <p className="text-sm text-gray-600">
                      Planted: {tree.plantedDate ? new Date(tree.plantedDate).toLocaleDateString() : 'Unknown'}
                    </p>
                    <p className="text-sm">Status: {tree.status}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <MapViewer
                trees={trees}
                selectedTree={selectedTree}
                onTreeSelect={setSelectedTree}
                mode="custodian"
                onTreeUpdate={handleTreeUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
