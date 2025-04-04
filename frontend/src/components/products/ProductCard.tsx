import React from 'react';
import type { Product } from '../../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  isSelected: boolean;
  onSelect: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, isSelected, onSelect }) => {
  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <div className="product-card-header">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="product-select"
        />
        <div className="product-actions">
          <button 
            className="button-icon" 
            onClick={() => onEdit(product)}
            title="Edit Product"
          >
            ✏️
          </button>
          <button 
            className="button-icon" 
            onClick={() => onDelete(product.id)}
            title="Delete Product"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="product-card-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-category">{product.category}</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-quantity">
          Quantity: <span className={product.quantity <= 10 ? 'low-quantity' : ''}>{product.quantity}</span>
        </div>
        <span className={`status-badge ${product.status.toLowerCase()}`}>
          {product.status}
        </span>
      </div>

      <div className="product-card-footer">
        <button 
          className="button button-secondary"
          onClick={() => onEdit(product)}
        >
          Edit Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;