import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Branch, BranchCreate, BranchUpdate, fetchBranches, fetchBranch, createBranch, updateBranch, deleteBranch } from './branchesAPI';

interface BranchesState {
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  error: string | null;
}

const initialState: BranchesState = {
  branches: [],
  selectedBranch: null,
  loading: false,
  error: null,
};

export const getBranches = createAsyncThunk('branches/fetchAll', async (business_id: number) => {
  return await fetchBranches(business_id);
});

export const getBranch = createAsyncThunk('branches/fetchOne', async ({ business_id, branch_id }: { business_id: number; branch_id: number }) => {
  return await fetchBranch(business_id, branch_id);
});

export const addBranch = createAsyncThunk('branches/create', async ({ business_id, data }: { business_id: number; data: BranchCreate }) => {
  return await createBranch(business_id, data);
});

export const editBranch = createAsyncThunk('branches/update', async ({ business_id, branch_id, data }: { business_id: number; branch_id: number; data: BranchUpdate }) => {
  return await updateBranch(business_id, branch_id, data);
});

export const removeBranch = createAsyncThunk('branches/delete', async ({ business_id, branch_id }: { business_id: number; branch_id: number }) => {
  return await deleteBranch(business_id, branch_id);
});

const branchesSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearSelectedBranch(state) {
      state.selectedBranch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branches';
      })
      .addCase(getBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.selectedBranch = action.payload;
      })
      .addCase(addBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.branches.push(action.payload);
      })
      .addCase(editBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        const idx = state.branches.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.branches[idx] = action.payload;
      })
      .addCase(removeBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.branches = state.branches.filter(b => b.id !== action.payload.id);
      });
  },
});

export const { clearSelectedBranch } = branchesSlice.actions;
export default branchesSlice.reducer; 