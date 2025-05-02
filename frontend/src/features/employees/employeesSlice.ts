import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Employee, 
  EmployeeCreate, 
  EmployeeUpdate, 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  fetchPerformanceMetrics,
  PerformanceMetric
} from './employeesAPI';

interface EmployeesState {
  employees: Employee[];
  performanceMetrics: PerformanceMetric[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  performanceMetrics: [],
  loading: false,
  error: null,
};

export const getEmployees = createAsyncThunk(
  'employees/fetchAll', 
  async (business_id: number) => {
    return await fetchEmployees(business_id);
  }
);

export const addEmployee = createAsyncThunk(
  'employees/create', 
  async (data: EmployeeCreate) => {
    return await createEmployee(data);
  }
);

export const editEmployee = createAsyncThunk(
  'employees/update', 
  async ({ id, data }: { id: number; data: EmployeeUpdate }) => {
    return await updateEmployee(id, data);
  }
);

export const removeEmployee = createAsyncThunk(
  'employees/delete', 
  async (id: number) => {
    return await deleteEmployee(id);
  }
);

export const getPerformanceMetrics = createAsyncThunk(
  'employees/fetchPerformance', 
  async (employee_id: number) => {
    return await fetchPerformanceMetrics(employee_id);
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(addEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.employees.push(action.payload);
      })
      .addCase(editEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        const idx = state.employees.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      .addCase(removeEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.employees = state.employees.filter(e => e.id !== action.payload.id);
      })
      .addCase(getPerformanceMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPerformanceMetrics.fulfilled, (state, action: PayloadAction<PerformanceMetric[]>) => {
        state.loading = false;
        state.performanceMetrics = action.payload;
      })
      .addCase(getPerformanceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance metrics';
      });
  },
});

export default employeesSlice.reducer; 