// src/app/add-plant/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const AddPlantMap = dynamic(() => import('@/components/AddPlantMap'), { 
  ssr: false 
});

export default function AddPlantPage() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user ID from JWT token stored after login
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub);
      } catch (error) {
        console.error('Failed to decode token');
      }
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add New Plant</h1>
      <AddPlantMap userId={userId} />
    </div>
  );
}
