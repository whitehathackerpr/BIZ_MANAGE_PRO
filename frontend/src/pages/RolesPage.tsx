import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getRoles,
  addRole,
  editRole,
  removeRole,
} from '../features/roles';
import { Role, RoleCreate, RoleUpdate } from '../features/roles/rolesAPI';
import { toast } from 'react-toastify';

const RolesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, loading, error } = useSelector((state: RootState) => state.roles);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleAdd = () => {
    setSelectedRole(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const result = await dispatch(removeRole(id));
      if (removeRole.fulfilled.match(result)) {
        toast.success('Role deleted successfully.');
      } else {
        toast.error('Failed to delete role.');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold">Roles</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add Role</button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Permissions</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td className="py-2 px-4 border-b">{r.name}</td>
              <td className="py-2 px-4 border-b">{r.description}</td>
              <td className="py-2 px-4 border-b">{r.permissions.join(', ')}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(r)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* TODO: Add RoleFormModal here */}
    </div>
  );
};

export default RolesPage; 