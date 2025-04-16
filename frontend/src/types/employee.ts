export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  join_date: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'on_leave';
  salary?: number;
  position?: string;
  manager_id?: string;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
}

export interface EmployeeLeave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'sick' | 'vacation' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface EmployeePerformance {
  id: string;
  employee_id: string;
  date: string;
  rating: number;
  comments: string;
  goals: string[];
  achievements: string[];
} 