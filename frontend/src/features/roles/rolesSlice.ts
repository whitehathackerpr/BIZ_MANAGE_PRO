import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  Role,
  RoleCreate,
  RoleUpdate
} from './rolesAPI';

interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

export const getRoles = createAsyncThunk('roles/fetchAll', async () => {
  return await fetchRoles();
});

export const addRole = createAsyncThunk('roles/create', async (data: RoleCreate) => {
  return await createRole(data);
});

export const editRole = createAsyncThunk('roles/update', async ({ id, data }: { id: number; data: RoleUpdate }) => {
  return await updateRole(id, data);
});

export const removeRole = createAsyncThunk('roles/delete', async (id: number) => {
  return await deleteRole(id);
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch roles';
      })
      .addCase(addRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles.push(action.payload);
      })
      .addCase(editRole.fulfilled, (state, action: PayloadAction<Role>) => {
        const idx = state.roles.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.roles[idx] = action.payload;
      })
      .addCase(removeRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles = state.roles.filter(r => r.id !== action.payload.id);
      });
  },
});

export default rolesSlice.reducer; 