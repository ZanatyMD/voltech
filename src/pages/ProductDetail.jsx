import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { showToast } from '../components/Toast';
import { Tag, ShoppingCart, TrendingDown, ChevronLeft, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { getProduct, products } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { t } = useLanguage();
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
            <h2>{t.pd_not_found}</h2>
            <p>{t.pd_not_found_desc}</p>
            <Link to="/" className="btn btn-primary">
              <ChevronLeft size={18} />
              {t.pd_back_to_shop}
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
      showToast(t.pd_specify_error, 'error');
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
        showToast(t.prod_max_qty, 'error');
      } else {
        showToast(`${t.pd_can_add_more} ${remaining} ${t.pd_more_items}.`, 'error');
      }
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd, activeVariant, customSpecification.trim());
    }
    const variantStr = activeVariant ? ` (${activeVariant.name})` : '';
    const specStr = customSpecification.trim() ? ` [${customSpecification.trim()}]` : '';
    showToast(`${quantity}x ${name}${variantStr}${specStr} ${t.prod_added_to_cart}`, 'success', 2000);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > displayStock) {
      showToast(t.prod_max_qty, 'error');
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
          <Link to="/">{t.pd_breadcrumb_home}</Link>
          <span>/</span>
          <Link to="/" onClick={() => {
            setTimeout(() => {
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>{t.pd_breadcrumb_products}</Link>
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
                  {discountPercent}% {t.pd_off}
                </div>
              )}
              <img 
                src={allImages[selectedImage]} 
                alt={name} 
                className="pd-hero-img"
              />
              {!isInStock && (
                <div className="pd-out-overlay">
                  <span>{t.pd_out_of_stock}</span>
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
              <span className="pd-price-current">{t.egp} {displayPrice.toFixed(2)}</span>
              {discountPercent > 0 && (
                <>
                  <span className="pd-price-original">{t.egp} {originalPrice.toFixed(2)}</span>
                  <span className="pd-save">{t.pd_save} {t.egp} {(originalPrice - displayPrice).toFixed(2)}</span>
                </>
              )}
            </div>

            {hasVariants && (
              <div className="pd-variants-box">
                <label className="pd-variants-title">{t.pd_select_option}</label>
                <div className="pd-variants-grid">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pd-variant-pill ${selectedVariantIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedVariantIndex(idx)}
                    >
                      <span className="pd-variant-name">{v.name}</span>
                      <span className="pd-variant-price">{t.egp} {Number(v.currentPrice || 0).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {requiresSpec && (
              <div className="pd-custom-spec-box">
                <div className="pd-custom-spec-header">
                  <label className="pd-custom-spec-title">
                    {t.pd_specify_value} <span className="req-star">*</span>
                  </label>
                  <span className="pd-custom-spec-hint">{t.pd_specify_hint}</span>
                </div>
                <input
                  type="text"
                  placeholder={t.pd_specify_placeholder}
                  className="form-input pd-custom-spec-input"
                  value={customSpecification}
                  onChange={(e) => setCustomSpecification(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={`pd-stock ${isInStock ? 'in' : 'out'}`}>
              <div className="pd-stock-dot"></div>
              {isInStock ? t.pd_in_stock : t.pd_out_of_stock}
            </div>

            {description && (
              <div className="pd-description">
                <h3>{t.pd_description}</h3>
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
                {isInStock ? t.pd_add_to_cart : t.pd_out_of_stock}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pd-related">
            <h2 className="pd-related-title">{t.pd_related}</h2>
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
