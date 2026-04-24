import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { X, Save, Upload, Image as ImageIcon, Clipboard } from 'lucide-react';
import './ProductForm.css';

function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: categories && categories.length > 0 ? categories[0] : '',
    originalPrice: '',
    currentPrice: '',
    stock: '',
    imageUrl: '',
    description: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        originalPrice: product.originalPrice,
        currentPrice: product.currentPrice,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        description: product.description || ''
      });
    }
  }, [product]);

  // Paste event listener for image copy/paste support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formattedData = {
      ...formData,
      originalPrice: parseFloat(formData.originalPrice),
      currentPrice: parseFloat(formData.currentPrice),
      stock: parseInt(formData.stock, 10),
    };

    if (product) {
      updateProduct(product.id, formattedData);
    } else {
      addProduct(formattedData);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-icon close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Current Price (EGP)</label>
              <input
                type="number"
                name="currentPrice"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.currentPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Original Price (EGP)</label>
              <input
                type="number"
                name="originalPrice"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${formData.imageUrl ? 'has-image' : ''}`}
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.imageUrl ? (
                <div className="drop-zone-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <div className="drop-zone-overlay">
                    <Upload size={24} />
                    <span>Click or drag to replace</span>
                  </div>
                </div>
              ) : (
                <div className="drop-zone-empty">
                  <Upload size={32} />
                  <p>Drag & drop an image here</p>
                  <span>or click to browse</span>
                  <div className="paste-hint">
                    <Clipboard size={14} />
                    <span>You can also Ctrl+V to paste</span>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input textarea"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
