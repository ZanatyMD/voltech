import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../components/Toast';
import { Tag, ShoppingCart, TrendingDown, ChevronLeft, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { getProduct, products } = useProducts();
  const { addToCart, cartItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [customSpecification, setCustomSpecification] = useState('');

  const product = getProduct(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedVariantIndex(0);
    setCustomSpecification('');
  }, [id]);

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <Package size={64} />
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="btn btn-primary">
              <ChevronLeft size={18} />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { name, originalPrice, currentPrice, stock, imageUrl, category, description, galleryImages, variants } = product;
  
  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const activeVariant = hasVariants ? (variants[selectedVariantIndex] || variants[0]) : null;
  const displayPrice = activeVariant ? Number(activeVariant.currentPrice || currentPrice || 0) : Number(currentPrice || 0);
  const displayStock = activeVariant && activeVariant.stock !== undefined ? activeVariant.stock : (stock || 0);
  const isInStock = displayStock > 0;

  const discountPercent = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const allImages = [imageUrl, ...(galleryImages || [])].filter(Boolean);

  const relatedProducts = products
    .filter(p => p.category === category && p.id !== id)
    .slice(0, 4);

  const requiresSpec = Boolean(product.requiresSpecification);

  const handleAddToCart = () => {
    if (requiresSpec && !customSpecification.trim()) {
      showToast('Please type the required value/specification (e.g., resistor or capacitor value) before adding to cart.', 'error');
      return;
    }

    const productToAdd = {
      ...product,
      currentPrice: displayPrice,
      selectedVariant: activeVariant ? activeVariant.name : null,
      customSpecification: customSpecification.trim(),
      requiresSpecification: requiresSpec
    };

    const variantName = activeVariant ? activeVariant.name : null;
    let expectedCartId = product.id;
    if (variantName) expectedCartId += `-${variantName}`;
    if (customSpecification.trim()) expectedCartId += `-${customSpecification.trim()}`;

    const existingItem = cartItems.find(item => 
      (item.cartItemId || item.id) === expectedCartId
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + quantity > displayStock) {
      const remaining = displayStock - currentQty;
      if (remaining <= 0) {
        showToast(`Sorry, maximum available quantity reached for this item.`, 'error');
      } else {
        showToast(`Sorry, you can only add ${remaining} more item${remaining > 1 ? 's' : ''}.`, 'error');
      }
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd, activeVariant, customSpecification.trim());
    }
    const variantStr = activeVariant ? ` (${activeVariant.name})` : '';
    const specStr = customSpecification.trim() ? ` [${customSpecification.trim()}]` : '';
    showToast(`${quantity}x ${name}${variantStr}${specStr} added to cart!`, 'success', 2000);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > displayStock) {
      showToast(`Sorry, maximum available quantity reached for this item.`, 'error');
      setQuantity(displayStock);
      return;
    }
    setQuantity(newQty);
  };

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Voltech Electronics`;
    }
  }, [product]);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/" onClick={() => {
            setTimeout(() => {
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>Products</Link>
          <span>/</span>
          <span className="current">{name}</span>
        </div>

        <div className="pd-layout">
          {/* Left: Image Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              {discountPercent > 0 && (
                <div className="pd-discount-badge">
                  <TrendingDown size={14} />
                  {discountPercent}% OFF
                </div>
              )}
              <img 
                src={allImages[selectedImage]} 
                alt={name} 
                className="pd-hero-img"
              />
              {!isInStock && (
                <div className="pd-out-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="pd-thumbnails">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    className={`pd-thumb ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="pd-info">
            <div className="pd-category">
              <Tag size={14} />
              {category}
            </div>

            <h1 className="pd-name">{name}</h1>

            <div className="pd-pricing">
              <span className="pd-price-current">EGP {displayPrice.toFixed(2)}</span>
              {discountPercent > 0 && (
                <>
                  <span className="pd-price-original">EGP {originalPrice.toFixed(2)}</span>
                  <span className="pd-save">Save EGP {(originalPrice - displayPrice).toFixed(2)}</span>
                </>
              )}
            </div>

            {hasVariants && (
              <div className="pd-variants-box">
                <label className="pd-variants-title">Select Size / Option:</label>
                <div className="pd-variants-grid">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pd-variant-pill ${selectedVariantIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedVariantIndex(idx)}
                    >
                      <span className="pd-variant-name">{v.name}</span>
                      <span className="pd-variant-price">EGP {Number(v.currentPrice || 0).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {requiresSpec && (
              <div className="pd-custom-spec-box">
                <div className="pd-custom-spec-header">
                  <label className="pd-custom-spec-title">
                    Specify Value / Number <span className="req-star">*</span>
                  </label>
                  <span className="pd-custom-spec-hint">e.g. 10kΩ, 220Ω, 100uF, 0.1uF</span>
                </div>
                <input
                  type="text"
                  placeholder="Type the exact value/number you want..."
                  className="form-input pd-custom-spec-input"
                  value={customSpecification}
                  onChange={(e) => setCustomSpecification(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={`pd-stock ${isInStock ? 'in' : 'out'}`}>
              <div className="pd-stock-dot"></div>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {description && (
              <div className="pd-description">
                <h3>Description</h3>
                <p>{description}</p>
              </div>
            )}

            <div className="pd-actions">
              {isInStock && (
                <div className="pd-qty">
                  <button 
                    className="pd-qty-btn" 
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >−</button>
                  <span className="pd-qty-value">{quantity}</span>
                  <button 
                    className="pd-qty-btn" 
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >+</button>
                </div>
              )}
              <button 
                className="btn btn-primary pd-add-btn" 
                disabled={!isInStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pd-related">
            <h2 className="pd-related-title">Related Products</h2>
            <div className="pd-related-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
