import api from '../../api';

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export const fetchPermissions = async (): Promise<Permission[]> => {
  const res = await api.get<Permission[]>('/permissions');
  return res.data;
}; 