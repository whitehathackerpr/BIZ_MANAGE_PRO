import React from 'react';
import { useForm } from 'react-hook-form';
import { BusinessCreate, BusinessUpdate } from '../features/business';

interface BusinessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessCreate | BusinessUpdate) => void;
  initialData?: BusinessCreate | BusinessUpdate;
  isEdit?: boolean;
}

const BusinessFormModal: React.FC<BusinessFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, isEdit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessCreate | BusinessUpdate>({
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
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Business' : 'Add Business'}</h2>
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
            <label className="block mb-1 font-semibold">Description</label>
            <input
              {...register('description')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Registration Number</label>
            <input
              {...register('registration_number')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Tax ID</label>
            <input
              {...register('tax_id')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4 flex items-center">
            <input type="checkbox" {...register('is_active')} className="mr-2" />
            <label className="font-semibold">Active</label>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessFormModal; 