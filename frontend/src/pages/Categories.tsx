import React from 'react';
import React, { useState } from 'react';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState<Type>([
    { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
    { id: 2, name: 'Clothing', description: 'Apparel and accessories' },
    { id: 3, name: 'Books', description: 'Books and publications' },
    { id: 4, name: 'Home & Garden', description: 'Home and garden products' }
  ]);

  const [isAdding, setIsAdding] = useState<Type>(false);
  const [newCategory, setNewCategory] = useState<Type>({ name: '', description: '' });

  const handleAddCategory = (e) => {
    e.preventDefault();
    const category = {
      id: categories.length + 1,
      ...newCategory
    };
    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '' });
    setIsAdding(false);
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Categories</h1>
        <button
          className="add-button"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsAdding(true)}
        >
          Add Category
        </button>
      </div>

      {isAdding && (
        <div className="category-form-overlay">
          <div className="category-form-container">
            <h2>Add New Category</h2>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleAddCategory}>
              <div className="form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="categoryDescription">Description</label>
                <textarea
                  id="categoryDescription"
                  value={newCategory.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsAdding(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
            <div className="category-actions">
              <button className="edit-button">Edit</button>
              <button 
                className="delete-button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDeleteCategory(category.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 