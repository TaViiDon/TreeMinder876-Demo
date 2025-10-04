"use client"

import { useSession as useNextAuthSession } from 'next-auth/react';
import type { User } from '@/lib/types';

export function useSession(): { user: User | null; loading: boolean } {
  const { data: session, status } = useNextAuthSession();
  
  return {
    user: session?.user || null,
    loading: status === 'loading'
  };
}