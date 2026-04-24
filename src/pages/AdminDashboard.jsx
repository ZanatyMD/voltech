import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useCategories } from '../context/CategoryContext';
import ProductForm from '../components/admin/ProductForm';
import { Plus, Edit, Trash2, Package, Tag, AlertTriangle, Download, CheckCircle, Clock, RotateCcw, Trash, ChevronDown, ChevronUp, Phone, User, Calendar, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '../assets/logoBase64';
import './AdminDashboard.css';

function AdminDashboard() {
  const { products, stats, deleteProduct, updateProduct } = useProducts();
  const { orders, updateOrderStatus, deleteOrder, deleteAllOrders } = useOrders();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

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

  const handleReturnedOrder = async (order) => {
    if (window.confirm(`Mark order from "${order.customerName}" as Returned?`)) {
      try {
        await updateOrderStatus(order.id, 'Returned');
      } catch (error) {
        console.error("Failed to update order:", error);
        alert("Failed to update order.");
      }
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Delete order from "${order.customerName}"? This cannot be undone.`)) {
      try {
        await deleteOrder(order.id);
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order.");
      }
    }
  };

  const handleDeleteAllOrders = async () => {
    if (window.confirm('Are you sure you want to DELETE ALL orders? This cannot be undone!')) {
      if (window.confirm('This is your LAST warning. All order history will be permanently lost. Continue?')) {
        try {
          await deleteAllOrders();
        } catch (error) {
          console.error("Failed to delete all orders:", error);
          alert("Failed to delete all orders.");
        }
      }
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
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

  // Group products by category
  const productsByCategory = {};
  products.forEach(product => {
    const cat = product.category || 'Uncategorized';
    if (!productsByCategory[cat]) {
      productsByCategory[cat] = [];
    }
    productsByCategory[cat].push(product);
  });

  const inStockProducts = products.filter(p => p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

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
        {activeTab === 'orders' && orders && orders.length > 0 && (
          <button className="btn btn-danger" onClick={handleDeleteAllOrders}>
            <Trash size={18} />
            Delete All Orders
          </button>
        )}
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} />
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} />
          Orders
          {pendingOrdersCount > 0 && <span className="badge-notification">{pendingOrdersCount}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} 
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={18} />
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

          {/* Stock Summary Lists */}
          {outOfStockProducts.length > 0 && (
            <div className="stock-alert-banner">
              <AlertTriangle size={18} />
              <span><strong>{outOfStockProducts.length}</strong> product{outOfStockProducts.length > 1 ? 's' : ''} out of stock: </span>
              <span className="stock-alert-names">{outOfStockProducts.map(p => p.name).join(', ')}</span>
            </div>
          )}

          {/* Category Squares */}
          <div className="category-grid">
            {Object.keys(productsByCategory).map(category => {
              const catProducts = productsByCategory[category];
              const catInStock = catProducts.filter(p => p.stock > 0).length;
              const catOutOfStock = catProducts.filter(p => p.stock === 0).length;

              return (
                <div className="category-square" key={category}>
                  <div className="category-square-header">
                    <Tag size={16} />
                    <h3>{category}</h3>
                    <span className="category-count">{catProducts.length}</span>
                  </div>
                  <div className="category-stock-info">
                    {catInStock > 0 && (
                      <span className="stock-pill in-stock">
                        <CheckCircle size={12} /> {catInStock} In Stock
                      </span>
                    )}
                    {catOutOfStock > 0 && (
                      <span className="stock-pill out-of-stock">
                        <AlertTriangle size={12} /> {catOutOfStock} Out
                      </span>
                    )}
                  </div>
                  <div className="category-product-list">
                    {catProducts.map(product => (
                      <div className={`category-product-item ${product.stock === 0 ? 'out' : ''}`} key={product.id}>
                        <img src={product.imageUrl} alt={product.name} className="cat-product-img" />
                        <div className="cat-product-info">
                          <span className="cat-product-name">{product.name}</span>
                          <span className="cat-product-price">EGP {product.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className={`cat-stock-badge ${product.stock > 0 ? 'in' : 'out'}`}>
                          {product.stock > 0 ? `${product.stock}` : 'Out'}
                        </div>
                        <div className="cat-product-actions">
                          <button className="btn-icon edit" onClick={() => handleEdit(product)} title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <Package size={48} />
              <p>No products found. Add some to get started!</p>
            </div>
          )}
        </>
      ) : activeTab === 'orders' ? (
        <div className="orders-card-grid">
          {orders && orders.length > 0 ? (
            orders.map(order => (
              <div className={`order-card ${order.status.toLowerCase()}`} key={order.id}>
                <div className="order-card-header">
                  <div className="order-card-date">
                    <Calendar size={14} />
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                    <span className="order-card-time">{new Date(order.orderDate).toLocaleTimeString()}</span>
                  </div>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status === 'Pending' && <Clock size={12} />}
                    {order.status === 'Completed' && <CheckCircle size={12} />}
                    {order.status === 'Returned' && <RotateCcw size={12} />}
                    {order.status}
                  </span>
                </div>

                <div className="order-card-customer">
                  <div className="order-card-customer-row">
                    <User size={14} />
                    <strong>{order.customerName}</strong>
                  </div>
                  <div className="order-card-customer-row">
                    <Phone size={14} />
                    <span>{order.customerPhone}</span>
                  </div>
                </div>

                <div className="order-card-items-toggle" onClick={() => toggleOrderExpand(order.id)}>
                  <ShoppingBag size={14} />
                  <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <strong className="order-card-total">EGP {order.total.toFixed(2)}</strong>
                  {expandedOrders[order.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {expandedOrders[order.id] && (
                  <div className="order-card-items-list">
                    {order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">x{item.quantity}</span>
                        <span className="order-item-price">EGP {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-card-actions">
                  {order.status === 'Pending' && (
                    <button 
                      className="order-action-btn complete" 
                      onClick={() => handleCompleteOrder(order)} 
                      title="Mark as Completed & Reduce Stock"
                    >
                      <CheckCircle size={15} />
                      Complete
                    </button>
                  )}
                  <button 
                    className="order-action-btn pdf" 
                    onClick={() => generatePDF(order)} 
                    title="Download PDF Invoice"
                  >
                    <Download size={15} />
                    PDF
                  </button>
                  {(order.status === 'Completed' || order.status === 'Pending') && (
                    <button 
                      className="order-action-btn returned" 
                      onClick={() => handleReturnedOrder(order)} 
                      title="Customer didn't take order"
                    >
                      <RotateCcw size={15} />
                      Returned
                    </button>
                  )}
                  <button 
                    className="order-action-btn delete-order" 
                    onClick={() => handleDeleteOrder(order)} 
                    title="Delete this order"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Package size={48} />
              <p>No orders yet.</p>
            </div>
          )}
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
