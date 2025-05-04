import React from 'react';
import { useForm } from 'react-hook-form';
import { EmployeeCreate, EmployeeUpdate } from '../features/employees/employeesAPI';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeCreate | EmployeeUpdate) => void;
  initialData?: EmployeeCreate | EmployeeUpdate;
  isEdit?: boolean;
  businessId: number;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEdit, 
  businessId 
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeCreate | EmployeeUpdate>({
    defaultValues: initialData || {},
  });

  React.useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
          </div>
          {!isEdit && (
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message as string}</span>}
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Role</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
            {errors.role && <span className="text-red-500 text-sm">{errors.role.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Position</label>
            <input
              {...register('position', { required: 'Position is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.position && <span className="text-red-500 text-sm">{errors.position.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Status</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Hire Date</label>
            <input
              type="date"
              {...register('hire_date', { required: 'Hire date is required' })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.hire_date && <span className="text-red-500 text-sm">{errors.hire_date.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Salary</label>
            <input
              type="number"
              step="0.01"
              {...register('salary', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Department</label>
            <input
              {...register('department')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          {/* Hidden inputs for business_id and branch_id */}
          {!isEdit && (
            <>
              <input type="hidden" {...register('business_id')} value={businessId} />
              {/* For demo we use 1; in a real app, you would select from available branches */}
              <input type="hidden" {...register('branch_id')} value={1} />
            </>
          )}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal; 