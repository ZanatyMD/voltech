import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useCategories } from '../context/CategoryContext';
import ProductForm from '../components/admin/ProductForm';
import { Plus, Edit, Trash2, Package, Tag, AlertTriangle, Download, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '../assets/logoBase64';
import './AdminDashboard.css';

function AdminDashboard() {
  const { products, stats, deleteProduct, updateProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName);
    setNewCategoryName('');
  };

  const handleCompleteOrder = async (order) => {
    try {
      await updateOrderStatus(order.id, 'Completed');
      // Auto-reduce stock
      for (const item of order.items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateProduct(product.id, { stock: newStock });
        }
      }
    } catch (error) {
      console.error("Failed to complete order:", error);
      alert("Failed to complete order.");
    }
  };

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

  const generatePDF = (order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(126, 200, 67); // Volt Green
    doc.text('Voltech Electronics', 14, 25);
    
    // Logo (top right)
    doc.addImage(logoBase64, 'PNG', 150, 2, 45, 45);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Order Invoice', 14, 38);
    
    // Order details
    doc.setFontSize(11);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleString()}`, 14, 50);
    doc.text(`Customer: ${order.customerName}`, 14, 57);
    doc.text(`Phone: ${order.customerPhone}`, 14, 64);
    doc.text(`Status: ${order.status}`, 14, 71);
    
    // Table
    const tableData = order.items.map(item => [
      item.name,
      item.quantity.toString(),
      `EGP ${item.price.toFixed(2)}`,
      `EGP ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [126, 200, 67] },
      styles: { fontSize: 10 }
    });
    
    // Total
    const finalY = doc.lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.setTextColor(126, 200, 67); // Volt Green
    doc.text(`Total Amount: EGP ${order.total.toFixed(2)}`, 14, finalY + 15);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with Voltech!', 14, finalY + 30);
    
    doc.save(`Voltech_Order_${order.customerName.replace(/\s+/g, '_')}.pdf`);
  };

  const pendingOrdersCount = orders ? orders.filter(o => o.status === 'Pending').length : 0;

  return (
    <div className="admin-dashboard container">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Manage your store inventory and orders</p>
        </div>
        {activeTab === 'products' && (
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
          {pendingOrdersCount > 0 && <span className="badge-notification">{pendingOrdersCount}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} 
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
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
        </>
      ) : activeTab === 'orders' ? (
        <div className="table-container">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                      <span className="order-time">{new Date(order.orderDate).toLocaleTimeString()}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.customerName}</strong>
                        <span>{order.customerPhone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="items-count">{order.items.length} items</span>
                    </td>
                    <td>
                      <strong>EGP {order.total.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {order.status === 'Pending' && (
                          <button 
                            className="btn-icon success" 
                            onClick={() => handleCompleteOrder(order)} 
                            title="Mark as Completed & Reduce Stock"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          className="btn-icon primary-text" 
                          onClick={() => generatePDF(order)} 
                          title="Download PDF Invoice"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="empty-state">
                      <Package size={48} />
                      <p>No orders yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'categories' ? (
        <div className="categories-manager">
          <div className="add-category-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
              placeholder="New Category Name" 
              className="form-input"
              style={{ maxWidth: '300px' }}
            />
            <button className="btn btn-primary" onClick={handleAddCategory}>
              <Plus size={18} />
              Add Category
            </button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <tr key={cat}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                          <Tag size={16} style={{ color: 'var(--volt-green)' }} />
                          {cat}
                        </div>
                      </td>
                      <td>
                        <button className="btn-icon delete" onClick={() => deleteCategory(cat)} title="Delete Category">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="empty-state">
                        <Tag size={48} />
                        <p>No categories found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

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
