import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app';
import {
  getEmployees,
  addEmployee,
  editEmployee,
  removeEmployee,
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
} from '../features/employees';
import EmployeeFormModal from './EmployeeFormModal';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const EmployeeList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employees);
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getEmployees(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Reset page to 1 on search/filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await dispatch(removeEmployee(id));
      if (removeEmployee.fulfilled.match(result)) {
        toast.success('Employee deleted successfully.');
      } else {
        toast.error('Failed to delete employee.');
      }
    }
  };

  const handleSubmit = async (data: EmployeeCreate | EmployeeUpdate) => {
    if (!user) return;
    
    if (editMode && selectedEmployee) {
      const result = await dispatch(editEmployee({ id: selectedEmployee.id, data: data as EmployeeUpdate }));
      if (editEmployee.fulfilled.match(result)) {
        toast.success('Employee updated successfully.');
      } else {
        toast.error('Failed to update employee.');
      }
    } else {
      // For a new employee, use the typed data with password
      const result = await dispatch(addEmployee(data as EmployeeCreate));
      if (addEmployee.fulfilled.match(result)) {
        toast.success('Employee added successfully.');
      } else {
        toast.error('Failed to add employee.');
      }
    }
    setModalOpen(false);
  };

  // Filtering and search
  const filteredEmployees = employees.filter((e) =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || e.role === roleFilter) &&
    (!statusFilter || e.status === statusFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const paginatedEmployees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique roles for filter dropdown
  const roles = Array.from(new Set(employees.map((e) => e.role)));

  // Role-based UI: Only allow add/edit/delete for owner/manager
  const canEdit = user && (user.role === 'owner' || user.role === 'manager');

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
          disabled={!canEdit}
        >
          Add Employee
        </button>
      </div>
      
      {loading && <div>Loading...</div>}
      
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Position</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Department</th>
            {canEdit && <th className="py-2 px-4 border-b">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((e) => (
            <tr key={e.id}>
              <td className="py-2 px-4 border-b">{e.name}</td>
              <td className="py-2 px-4 border-b">{e.email}</td>
              <td className="py-2 px-4 border-b">{e.role}</td>
              <td className="py-2 px-4 border-b">{e.position}</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded-full text-xs ${e.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {e.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{e.department || '-'}</td>
              {canEdit && (
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(e)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(e.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination controls */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page} of {totalPages || 1}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
      
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editMode && selectedEmployee ? selectedEmployee : undefined}
        isEdit={editMode}
        businessId={businessId}
      />
    </div>
  );
};

export default EmployeeList; 