import React from 'react';
import { useForm } from 'react-hook-form';
import { ProductCreate, ProductUpdate } from '../features/products';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreate | ProductUpdate) => void;
  initialData?: ProductCreate | ProductUpdate;
  isEdit?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, isEdit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductCreate | ProductUpdate>({
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
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
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
            <label className="block mb-1 font-semibold">Price</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required', valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.price && <span className="text-red-500 text-sm">{errors.price.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Stock Level</label>
            <input
              type="number"
              {...register('stock_level', { required: 'Stock level is required', valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.stock_level && <span className="text-red-500 text-sm">{errors.stock_level.message as string}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Expiry Date</label>
            <input
              type="date"
              {...register('expiry_date')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Category</label>
            <input
              {...register('category')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          {/* Supplier and business_id can be handled elsewhere or as dropdowns if needed */}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal; 