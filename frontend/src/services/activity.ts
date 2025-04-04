import api from './api';

export interface Activity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface ActivityFilter {
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export const activityService = {
  getActivities: async (params?: {
    page?: number;
    limit?: number;
    filter?: ActivityFilter;
  }): Promise<{
    items: Activity[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  getActivity: async (id: string): Promise<Activity> => {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },

  getUserActivities: async (userId: string, params?: {
    page?: number;
    limit?: number;
    filter?: ActivityFilter;
  }): Promise<{
    items: Activity[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get(`/users/${userId}/activities`, { params });
    return response.data;
  },

  getEntityActivities: async (entityType: string, entityId: string, params?: {
    page?: number;
    limit?: number;
    filter?: ActivityFilter;
  }): Promise<{
    items: Activity[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get(`/activities/${entityType}/${entityId}`, { params });
    return response.data;
  },

  getActivityTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/activities/types');
    return response.data;
  },

  getEntityTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/activities/entity-types');
    return response.data;
  },

  exportActivities: async (filter?: ActivityFilter): Promise<Blob> => {
    const response = await api.get('/activities/export', {
      params: filter,
      responseType: 'blob',
    });
    return response.data;
  },

  clearActivities: async (filter?: ActivityFilter): Promise<void> => {
    await api.delete('/activities', { params: filter });
  },
}; 