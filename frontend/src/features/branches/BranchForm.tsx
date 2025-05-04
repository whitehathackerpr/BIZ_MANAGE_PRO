import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { addBranch, editBranch } from './branchesSlice';
import { Branch, BranchCreate, BranchUpdate, fetchManagers, User } from './branchesAPI';
import { toast } from 'react-toastify';

interface BranchFormProps {
  businessId: number;
  branch?: Branch | null;
  onClose: () => void;
}

const BranchForm: React.FC<BranchFormProps> = ({ businessId, branch, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<BranchCreate | BranchUpdate>({
    name: '',
    address: '',
    phone: '',
    manager_id: undefined,
    business_id: businessId,
  });
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        manager_id: branch.manager_id,
        business_id: branch.business_id,
      });
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        manager_id: undefined,
        business_id: businessId,
      });
    }
  }, [branch, businessId]);

  useEffect(() => {
    setLoadingManagers(true);
    fetchManagers()
      .then(setManagers)
      .catch(() => setManagers([]))
      .finally(() => setLoadingManagers(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'manager_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (branch) {
        await dispatch(
          editBranch({ business_id: businessId, branch_id: branch.id, data: form as BranchUpdate })
        ).unwrap();
        toast.success('Branch updated');
      } else {
        await dispatch(
          addBranch({ business_id: businessId, data: form as BranchCreate })
        ).unwrap();
        toast.success('Branch created');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save branch');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{branch ? 'Edit Branch' : 'Add Branch'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Manager</label>
            <select
              name="manager_id"
              value={form.manager_id || ''}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={loadingManagers}
            >
              <option value="">Select a manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{branch ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchForm; 