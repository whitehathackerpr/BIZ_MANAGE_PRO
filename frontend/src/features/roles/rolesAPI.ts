import api from '../../api';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
}

export interface RoleCreate {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const fetchRoles = async (): Promise<Role[]> => {
  const res = await api.get<Role[]>('/roles');
  return res.data;
};

export const createRole = async (data: RoleCreate): Promise<Role> => {
  const res = await api.post<Role>('/roles', data);
  return res.data;
};

export const updateRole = async (id: number, data: RoleUpdate): Promise<Role> => {
  const res = await api.put<Role>(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id: number): Promise<Role> => {
  const res = await api.delete<Role>(`/roles/${id}`);
  return res.data;
}; 