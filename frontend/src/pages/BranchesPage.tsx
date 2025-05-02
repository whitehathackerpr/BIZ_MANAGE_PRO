import React, { useState } from 'react';
import BranchList from '../features/branches/BranchList';
import BranchForm from '../features/branches/BranchForm';
import { Branch } from '../features/branches/branchesAPI';
// If businessId comes from Redux, import useSelector and select it from state
// import { useSelector } from 'react-redux';
// import { RootState } from '../app/store';

const BranchesPage: React.FC = () => {
  // Replace this with actual businessId from Redux or props
  const businessId = 1;
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleAdd = () => {
    setEditingBranch(null);
    setShowForm(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBranch(null);
  };

  return (
    <div className="container mx-auto py-6">
      <BranchList businessId={businessId} onEdit={handleEdit} onAdd={handleAdd} />
      {showForm && (
        <BranchForm
          businessId={businessId}
          branch={editingBranch}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default BranchesPage; 