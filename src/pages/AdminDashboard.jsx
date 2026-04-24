import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductForm from '../components/admin/ProductForm';
import { Plus, Edit, Trash2, Package, Tag, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard() {
  const { products, stats, deleteProduct } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="admin-dashboard container">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Manage your store inventory and products</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-stock"><Tag size={24} /></div>
          <div className="stat-info">
            <h3>In Stock</h3>
            <p className="stat-value">{stats.inStock}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon out-of-stock"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <p className="stat-value">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="table-product">
                    <img src={product.imageUrl} alt={product.name} className="table-img" />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-green">{product.category}</span>
                </td>
                <td>
                  <div className="table-price">
                    <span className="current">EGP {product.currentPrice.toFixed(2)}</span>
                    {product.originalPrice > product.currentPrice && (
                      <span className="original">EGP {product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={`table-stock ${product.stock > 0 ? 'in' : 'out'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(product)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No products found. Add some to get started!</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}

export default AdminDashboard;
