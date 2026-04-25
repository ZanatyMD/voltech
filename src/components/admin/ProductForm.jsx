import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { X, Save, Upload, Clipboard, Plus, Trash2 } from 'lucide-react';
import './ProductForm.css';

function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const galleryDropZoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const [pasteTarget, setPasteTarget] = useState('main'); // 'main' or 'gallery'
  
  const [formData, setFormData] = useState({
    name: '',
    category: categories && categories.length > 0 ? categories[0] : '',
    originalPrice: '',
    currentPrice: '',
    stock: '',
    imageUrl: '',
    galleryImages: [],
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
        galleryImages: product.galleryImages || [],
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
            if (pasteTarget === 'gallery') {
              handleGalleryImageFile(file);
            } else {
              handleImageFile(file);
            }
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [pasteTarget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 800; // Resize to max 800px

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as WebP/JPEG with 0.7 quality to reduce base64 size drastically
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        callback(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    compressImage(file, (compressedDataUrl) => {
      setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
    });
  };

  const handleGalleryImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    compressImage(file, (compressedDataUrl) => {
      setFormData(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, compressedDataUrl] 
      }));
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleGalleryFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => handleGalleryImageFile(file));
    e.target.value = '';
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

  const handleGalleryDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGalleryDragging(true);
  };

  const handleGalleryDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGalleryDragging(false);
  };

  const handleGalleryDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGalleryDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleGalleryImageFile(file));
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

          {/* Main Product Image */}
          <div className="form-group">
            <label className="form-label">Main Product Image</label>
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${formData.imageUrl ? 'has-image' : ''}`}
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onFocus={() => setPasteTarget('main')}
              onMouseEnter={() => setPasteTarget('main')}
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

          {/* Gallery Images */}
          <div className="form-group">
            <label className="form-label">Additional Images (Gallery)</label>
            
            {/* Gallery thumbnails */}
            {formData.galleryImages.length > 0 && (
              <div className="gallery-thumbnails">
                {formData.galleryImages.map((img, index) => (
                  <div className="gallery-thumb" key={index}>
                    <img src={img} alt={`Gallery ${index + 1}`} />
                    <button 
                      type="button" 
                      className="gallery-thumb-remove" 
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery drop zone */}
            <div 
              className={`drop-zone gallery-drop-zone ${isGalleryDragging ? 'dragging' : ''}`}
              ref={galleryDropZoneRef}
              onDragOver={handleGalleryDragOver}
              onDragLeave={handleGalleryDragLeave}
              onDrop={handleGalleryDrop}
              onClick={() => galleryInputRef.current?.click()}
              onFocus={() => setPasteTarget('gallery')}
              onMouseEnter={() => setPasteTarget('gallery')}
            >
              <div className="drop-zone-empty gallery-drop-content">
                <Plus size={20} />
                <span>Add more images — drag, paste, or click</span>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFileSelect}
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
