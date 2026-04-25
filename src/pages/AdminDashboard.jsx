import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useCategories } from '../context/CategoryContext';
import ProductForm from '../components/admin/ProductForm';
import { Plus, Edit, Trash2, Package, Tag, AlertTriangle, Download, CheckCircle, Clock, RotateCcw, Trash, ChevronDown, ChevronUp, Phone, User, Calendar, ShoppingBag, Search, Check, X, Truck, Barcode as BarcodeIcon } from 'lucide-react';
import Barcode from 'react-barcode';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '../assets/logoBase64';
import './AdminDashboard.css';

function AdminDashboard() {
  const { products, stats, deleteProduct, updateProduct } = useProducts();
  const { orders, updateOrderStatus, updateOrder, deleteOrder, deleteAllOrders } = useOrders();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderSearch, setOrderSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');
  const [isGeneratingSKUs, setIsGeneratingSKUs] = useState(false);

  const compressBase64Image = (base64Str) => {
    return new Promise((resolve) => {
      // Compress if it's a data URL larger than ~200KB
      if (!base64Str || !base64Str.startsWith('data:image') || base64Str.length < 200000) {
        resolve(base64Str);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;

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
        resolve(canvas.toDataURL('image/webp', 0.7));
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  const handleFixOldImages = async () => {
    if (!window.confirm('This will automatically compress all large images in your database to make your website load instantly. Continue?')) return;
    setIsCompressing(true);
    let fixedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      setCompressionProgress(`Compressing product ${i + 1} of ${products.length}...`);
      
      let needsUpdate = false;
      const updates = {};

      if (product.imageUrl && product.imageUrl.length > 200000) {
        updates.imageUrl = await compressBase64Image(product.imageUrl);
        needsUpdate = true;
      }

      if (product.galleryImages && product.galleryImages.length > 0) {
        const newGallery = [];
        for (const img of product.galleryImages) {
          if (img.length > 200000) {
            newGallery.push(await compressBase64Image(img));
            needsUpdate = true;
          } else {
            newGallery.push(img);
          }
        }
        if (needsUpdate) updates.galleryImages = newGallery;
      }

      if (needsUpdate) {
        try {
          await updateProduct(product.id, updates);
          fixedCount++;
        } catch(e) {
          console.error("Error updating product image size", e);
        }
      }
    }
    
    setCompressionProgress('');
    setIsCompressing(false);
    alert(`Complete! Compressed images for ${fixedCount} products. Your website should load instantly now.`);
  };

  const handleGenerateSKUs = async () => {
    if (!window.confirm("This will automatically generate a unique 8-digit numeric barcode (SKU) for any product that doesn't have one yet. Continue?")) return;
    setIsGeneratingSKUs(true);
    let updatedCount = 0;

    for (const product of products) {
      if (!product.sku) {
        const generatedSku = Math.floor(10000000 + Math.random() * 90000000).toString();
        try {
          await updateProduct(product.id, { sku: generatedSku });
          updatedCount++;
        } catch(e) {
          console.error("Error generating SKU", e);
        }
      }
    }
    
    setIsGeneratingSKUs(false);
    alert(`Complete! Generated barcodes for ${updatedCount} products.`);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName);
    setNewCategoryName('');
  };

  const handleStartEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat);
  };

  const handleSaveCategory = async () => {
    if (!editCategoryName.trim() || !editingCategory) return;
    try {
      await updateCategory(editingCategory, editCategoryName);
    } catch (e) {
      alert('Failed to rename category.');
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
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

  const handleSetDeliveryFee = async (order) => {
    const feeStr = window.prompt("Enter delivery fee (EGP):", order.deliveryFee || "30");
    if (feeStr === null) return; // Cancelled
    const fee = parseFloat(feeStr);
    if (isNaN(fee) || fee < 0) {
      alert("Please enter a valid number for the delivery fee.");
      return;
    }
    
    // Calculate new total: sum of items + delivery fee
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newTotal = itemsTotal + fee;

    try {
      await updateOrder(order.id, { deliveryFee: fee, total: newTotal });
    } catch (error) {
      console.error("Failed to set delivery fee:", error);
      alert("Failed to set delivery fee.");
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const green = [126, 200, 67];
    const darkBg = [18, 18, 22];
    const lightGray = [245, 245, 247];
    const medGray = [200, 200, 200];
    
    // ===== TOP HEADER BAR =====
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, 42, 'F');
    
    // Green accent line under header
    doc.setFillColor(...green);
    doc.rect(0, 42, pageWidth, 2, 'F');
    
    // Logo in header (left side)
    doc.addImage(logoBase64, 'PNG', 12, 4, 34, 34);
    
    // Company name in header
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('VOLTECH', 50, 20);
    doc.setFontSize(9);
    doc.setTextColor(...green);
    doc.setFont('helvetica', 'normal');
    doc.text('ELECTRONICS STORE', 50, 28);
    
    // Invoice label (right side)
    const orderNum = order.orderNumber || ('VT-' + order.id.slice(-6).toUpperCase());
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(...green);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${orderNum}`, pageWidth - 14, 30, { align: 'right' });

    // ===== ORDER INFO SECTION =====
    const infoY = 52;
    
    // Left column - Customer info
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, infoY, (pageWidth - 36) / 2, 44, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER DETAILS', 20, infoY + 10);
    
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customerName, 20, infoY + 19);
    
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customerPhone, 20, infoY + 27);
    
    // Status pill
    const statusColors = {
      'Pending': [245, 200, 66],
      'Completed': green,
      'Returned': [249, 115, 22]
    };
    const statusColor = statusColors[order.status] || green;
    doc.setFillColor(...statusColor);
    const statusWidth = doc.getTextWidth(order.status) + 12;
    doc.roundedRect(20, infoY + 31, statusWidth, 8, 4, 4, 'F');
    doc.setFontSize(7);
    doc.setTextColor(order.status === 'Pending' ? 30 : 255, order.status === 'Pending' ? 30 : 255, order.status === 'Pending' ? 30 : 255);
    doc.setFont('helvetica', 'bold');
    doc.text(order.status.toUpperCase(), 26, infoY + 36.5);
    
    // Right column - Order info
    const rightX = 14 + (pageWidth - 36) / 2 + 8;
    doc.setFillColor(...lightGray);
    doc.roundedRect(rightX, infoY, (pageWidth - 36) / 2, 44, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER DETAILS', rightX + 6, infoY + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, rightX + 6, infoY + 18);
    doc.text(`Time: ${new Date(order.orderDate).toLocaleTimeString()}`, rightX + 6, infoY + 24);
    doc.text(`Items: ${order.items.length}`, rightX + 6, infoY + 30);
    doc.setFont('helvetica', 'bold');
    doc.text(order.isDelivery ? 'Delivery:' : 'Type:', rightX + 6, infoY + 38);
    doc.setFont('helvetica', 'normal');
    
    // Split long address strings for PDF
    const addressText = order.isDelivery ? (order.deliveryLocation || 'New Damietta') : 'Store Pickup';
    const splitAddress = doc.splitTextToSize(addressText, (pageWidth - 36) / 2 - 12);
    doc.text(splitAddress, rightX + 6, infoY + 44);
    
    // ===== ITEMS TABLE =====
    const tableData = order.items.map((item, idx) => [
      (idx + 1).toString(),
      item.name,
      item.quantity.toString(),
      `EGP ${item.price.toFixed(2)}`,
      `EGP ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: infoY + 52,
      head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'plain',
      headStyles: { 
        fillColor: [...darkBg], 
        textColor: [...green],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 6,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: [...green] },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 36, halign: 'right' },
        4: { cellWidth: 36, halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        lineWidth: 0,
        overflow: 'linebreak'
      },
      didDrawPage: () => {},
      margin: { left: 14, right: 14 }
    });
    
    // ===== TOTAL BOX =====
    const finalY = doc.lastAutoTable.finalY || 150;
    
    // Subtle line
    doc.setDrawColor(...medGray);
    doc.setLineWidth(0.3);
    doc.line(14, finalY + 4, pageWidth - 14, finalY + 4);
    
    let currentY = finalY + 14;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal & Delivery Fee rows
    if (order.deliveryFee !== undefined) {
      const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      doc.text('Subtotal:', pageWidth - 80, currentY);
      doc.text(`EGP ${itemsTotal.toFixed(2)}`, pageWidth - 14, currentY, { align: 'right' });
      currentY += 8;
      doc.text('Delivery Fee:', pageWidth - 80, currentY);
      doc.text(`EGP ${order.deliveryFee.toFixed(2)}`, pageWidth - 14, currentY, { align: 'right' });
      currentY += 8;
    } else {
      doc.text('Subtotal:', pageWidth - 80, currentY);
      doc.text(`EGP ${order.total.toFixed(2)}`, pageWidth - 14, currentY, { align: 'right' });
      currentY += 8;
    }
    
    // Total highlight box
    doc.setFillColor(...green);
    doc.roundedRect(pageWidth - 100, currentY, 86, 16, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', pageWidth - 94, currentY + 10.5);
    doc.text(`EGP ${order.total.toFixed(2)}`, pageWidth - 18, currentY + 10.5, { align: 'right' });
    
    // ===== FOOTER =====
    const footerY = pageHeight - 30;
    
    // Footer line
    doc.setDrawColor(...medGray);
    doc.setLineWidth(0.3);
    doc.line(14, footerY, pageWidth - 14, footerY);
    
    // Thank you message
    doc.setFontSize(10);
    doc.setTextColor(...green);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for shopping with Voltech!', 14, footerY + 10);
    
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('Voltech Electronics Store  •  Your trusted electronics partner', 14, footerY + 18);
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 14, footerY + 18, { align: 'right' });
    
    const orderNum2 = order.orderNumber || ('VT-' + order.id.slice(-6).toUpperCase());
    const orderDateStr = new Date(order.orderDate).toLocaleDateString('en-GB').replace(/\//g, '-');
    doc.save(`Voltech_${orderNum2}_${orderDateStr}.pdf`);
  };

  const generateBarcodesPDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pick List - Order #${order.orderNumber || order.id.slice(-6).toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    order.items.forEach((item) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.quantity}x ${item.name}`, 14, yPos);
      yPos += 8;

      if (item.sku && item.sku !== 'N/A') {
        try {
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, item.sku, { format: "CODE128", displayValue: true, fontSize: 16, height: 50, margin: 0 });
          const barcodeDataUrl = canvas.toDataURL("image/png");
          // Add image: scale to approx 60x20
          doc.addImage(barcodeDataUrl, 'PNG', 14, yPos, 60, 20);
          yPos += 28;
        } catch (e) {
          console.error("Barcode generation failed for PDF", e);
          doc.setFont('helvetica', 'normal');
          doc.text(`SKU: ${item.sku}`, 14, yPos);
          yPos += 10;
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("No Barcode Assigned", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
      }
      
      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 10;
    });

    const orderNum2 = order.orderNumber || ('VT-' + order.id.slice(-6).toUpperCase());
    doc.save(`Voltech_PickList_${orderNum2}.pdf`);
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleGenerateSKUs} disabled={isGeneratingSKUs}>
              <BarcodeIcon size={18} />
              {isGeneratingSKUs ? 'Generating...' : 'Generate Missing Barcodes'}
            </button>
            <button className="btn btn-secondary" onClick={handleFixOldImages} disabled={isCompressing}>
              <AlertTriangle size={18} />
              {isCompressing ? compressionProgress : 'Fix Old Images'}
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <Plus size={18} />
              Add Product
            </button>
          </div>
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

          {/* Category Squares + Out of Stock Square */}
          <div className="category-grid">
            {/* Out of Stock Square (Red) */}
            {outOfStockProducts.length > 0 && (
              <div className="category-square out-of-stock-square">
                <div className="category-square-header oos-header">
                  <AlertTriangle size={16} />
                  <h3>Out of Stock</h3>
                  <span className="category-count oos-count">{outOfStockProducts.length}</span>
                </div>
                <div className="category-product-list">
                  {outOfStockProducts.map(product => (
                    <div className="category-product-item out" key={product.id}>
                      <img src={product.imageUrl} alt={product.name} className="cat-product-img" />
                      <div className="cat-product-info">
                        <span className="cat-product-name">{product.name}</span>
                        <span className="cat-product-price">EGP {product.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="cat-stock-badge out">Out</div>
                      <div className="cat-product-barcode" style={{ marginTop: '10px', transform: 'scale(0.8)', transformOrigin: 'left top' }}>
                        {product.sku ? <Barcode value={product.sku} format="CODE128" height={30} displayValue={true} fontSize={12} width={1.5} /> : <span style={{fontSize:'0.8rem', color:'gray'}}>No Barcode</span>}
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
            )}

            {/* Category Squares */}
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
                        <div className="cat-product-barcode" style={{ marginTop: '10px', transform: 'scale(0.8)', transformOrigin: 'left top', gridColumn: '1 / -1' }}>
                          {product.sku ? <Barcode value={product.sku} format="CODE128" height={30} displayValue={true} fontSize={12} width={1.5} /> : <span style={{fontSize:'0.8rem', color:'gray'}}>No Barcode</span>}
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
        <>
        <div className="order-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order number (e.g. VT-A3X9K2)"
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            className="form-input order-search-input"
          />
        </div>
        <div className="orders-card-grid">
          {orders && orders.length > 0 ? (
            orders
              .filter(order => {
                if (!orderSearch.trim()) return true;
                const num = (order.orderNumber || order.id.slice(-6)).toUpperCase();
                return num.includes(orderSearch.trim().toUpperCase());
              })
              .map(order => (
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

                <div className="order-card-number">
                  #{order.orderNumber || order.id.slice(-6).toUpperCase()}
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
                  <div className="order-card-customer-row" style={{ color: order.isDelivery ? 'var(--volt-green)' : 'var(--text-secondary)' }}>
                    <Package size={14} />
                    <span style={{ fontSize: '0.85rem' }}>
                      {order.isDelivery ? `Delivery: ${order.deliveryLocation}` : 'Store Pickup'}
                    </span>
                  </div>
                </div>

                <div className="order-card-items-toggle" onClick={() => toggleOrderExpand(order.id)}>
                  <ShoppingBag size={14} />
                  <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <strong className="order-card-total">
                    EGP {order.total.toFixed(2)}
                    {order.deliveryFee !== undefined && <span style={{fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8, marginLeft: '4px'}}>(inc. EGP {order.deliveryFee} delivery)</span>}
                  </strong>
                  {expandedOrders[order.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {expandedOrders[order.id] && (
                  <div className="order-card-items-list">
                    {order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx} style={{ flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span className="order-item-name">{item.name}</span>
                          {item.sku && item.sku !== 'N/A' && (
                            <div style={{ transform: 'scale(0.7)', transformOrigin: 'left top', marginTop: '4px', marginBottom: '-10px' }}>
                              <Barcode value={item.sku} format="CODE128" height={25} displayValue={true} fontSize={14} width={1.2} />
                            </div>
                          )}
                        </div>
                        <span className="order-item-qty" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>x{item.quantity}</span>
                        <span className="order-item-price" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>EGP {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.deliveryFee !== undefined && (
                      <div className="order-item-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <span className="order-item-name">Delivery Fee</span>
                        <span className="order-item-qty"></span>
                        <span className="order-item-price">EGP {order.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="order-card-actions">
                  {order.status === 'Pending' && order.isDelivery && (
                    <button 
                      className="order-action-btn edit" 
                      onClick={() => handleSetDeliveryFee(order)} 
                      title="Set Delivery Fee"
                    >
                      <Truck size={15} />
                      Set Fee
                    </button>
                  )}
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
                  <button 
                    className="order-action-btn edit" 
                    onClick={() => generateBarcodesPDF(order)} 
                    title="Download Pick List PDF with Barcodes"
                    style={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <BarcodeIcon size={15} />
                    Pick List
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
        </>
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
                        {editingCategory === cat ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag size={16} style={{ color: 'var(--volt-green)' }} />
                            <input
                              type="text"
                              className="form-input"
                              value={editCategoryName}
                              onChange={e => setEditCategoryName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveCategory(); if (e.key === 'Escape') handleCancelEditCategory(); }}
                              autoFocus
                              style={{ maxWidth: '250px', padding: '6px 12px' }}
                            />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <Tag size={16} style={{ color: 'var(--volt-green)' }} />
                            {cat}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {editingCategory === cat ? (
                            <>
                              <button className="btn-icon edit" onClick={handleSaveCategory} title="Save" style={{ color: 'var(--volt-green)' }}>
                                <Check size={16} />
                              </button>
                              <button className="btn-icon delete" onClick={handleCancelEditCategory} title="Cancel">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn-icon edit" onClick={() => handleStartEditCategory(cat)} title="Edit Category">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon delete" onClick={() => deleteCategory(cat)} title="Delete Category">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
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
