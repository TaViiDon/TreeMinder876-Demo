"use client";

import { useState, useEffect } from 'react';
import MapViewer from '@/components/MapViewer';
import CustodianPlants from '@/components/CustodianPlants';
import { useSession } from '@/hooks/useSession';
import type { Tree } from '@/lib/types';

export default function SupplierDashboard() {
  const { user } = useSession();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierTrees();
  }, []);

  const fetchSupplierTrees = async () => {
    try {
      const response = await fetch('/api/supplier/trees');
      const data = await response.json();
      setTrees(data.trees);
    } catch (error) {
      console.error('Error fetching trees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTreeSelect = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const totalTrees = trees.length;
  const uniquePlanters = new Set(trees.map(tree => tree.planter?.id).filter(Boolean)).size;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
          <div className="text-right">
            <p className="text-lg">Total Trees: {totalTrees}</p>
            <p className="text-sm">Unique Planters: {uniquePlanters}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <CustodianPlants 
            trees={trees}
            onTreeSelect={handleTreeSelect}
            selectedTree={selectedTree}
          />
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapViewer
            trees={trees}
            selectedTree={selectedTree}
            onTreeSelect={handleTreeSelect}
            mode="supplier"
          />
        </div>
      </div>
    </div>
  );
}
