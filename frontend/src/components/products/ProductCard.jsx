import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete, isSelected, onSelect }) => {
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
        <p className="product-sku">SKU: {product.sku}</p>
        <p className="product-category">{product.category}</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-stock">
          Stock: <span className={product.stock <= 10 ? 'low-stock' : ''}>{product.stock}</span>
        </div>
        <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
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

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    sku: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default ProductCard; 