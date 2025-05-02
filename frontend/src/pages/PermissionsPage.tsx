import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { getPermissions } from '../features/roles';
import { Permission } from '../features/roles/permissionsAPI';
import { toast } from 'react-toastify';

const PermissionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, loading, error } = useSelector((state: RootState) => state.permissions);

  useEffect(() => {
    dispatch(getPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Permissions</h2>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p: Permission) => (
            <tr key={p.id}>
              <td className="py-2 px-4 border-b">{p.name}</td>
              <td className="py-2 px-4 border-b">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionsPage; 