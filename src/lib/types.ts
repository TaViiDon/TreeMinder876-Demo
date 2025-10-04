// Central shared types used across the app
export type Role = 'SUPPLIER' | 'CUSTODIAN' | 'ADMIN';

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  profileImage?: string | null;
}

export interface TreeImage {
  id?: string;
  url: string;
  caption?: string | null;
  createdAt?: string;
}

export interface TreeUpdate {
  id?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Tree {
  id: string;
  treeId?: string;
  species?: string;
  plantedDate?: string;
  plantedAt?: string;
  latitude: number;
  longitude: number;
  status?: string;
  planter?: User & { plantedTrees?: Array<{ id: string }> } | null;
  images?: TreeImage[];
  updates?: TreeUpdate[];
}

export interface Plant {
  id: number | string;
  name?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  plantedAt?: string;
  planter?: User | null;
}

export interface PlanterSummary {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | null;
  count: number;
  plants: Plant[];
}

export interface AuthTokenPayload {
  sub: string;
  role: Role;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export default {};
