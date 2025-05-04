import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { getBranches, removeBranch } from './branchesSlice';
import { toast } from 'react-toastify';
import { Branch, fetchManagers, User } from './branchesAPI';

interface BranchListProps {
  businessId: number;
  onEdit: (branch: Branch) => void;
  onAdd: () => void;
}

const BranchList: React.FC<BranchListProps> = ({ businessId, onEdit, onAdd }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading, error } = useSelector((state: RootState) => state.branches);
  const [managers, setManagers] = useState<User[]>([]);

  useEffect(() => {
    dispatch(getBranches(businessId));
    fetchManagers().then(setManagers).catch(() => setManagers([]));
  }, [dispatch, businessId]);

  const handleDelete = async (branch: Branch) => {
    if (window.confirm(`Delete branch "${branch.name}"?`)) {
      try {
        await dispatch(removeBranch({ business_id: businessId, branch_id: branch.id })).unwrap();
        toast.success('Branch deleted');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete branch');
      }
    }
  };

  const getManagerName = (manager_id?: number) => {
    if (!manager_id) return '-';
    const manager = managers.find((m) => m.id === manager_id);
    return manager ? `${manager.name} (${manager.email})` : manager_id;
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Branches</h2>
        <button onClick={onAdd} className="btn btn-primary">Add Branch</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full table-auto border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Address</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Manager</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(branch => (
            <tr key={branch.id}>
              <td className="border px-4 py-2">{branch.name}</td>
              <td className="border px-4 py-2">{branch.address || '-'}</td>
              <td className="border px-4 py-2">{branch.phone || '-'}</td>
              <td className="border px-4 py-2">{getManagerName(branch.manager_id)}</td>
              <td className="border px-4 py-2">
                <button onClick={() => onEdit(branch)} className="btn btn-sm btn-secondary mr-2">Edit</button>
                <button onClick={() => handleDelete(branch)} className="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchList; 