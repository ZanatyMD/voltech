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

  const product = getProduct(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
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

  const { name, originalPrice, currentPrice, stock, imageUrl, category, description, galleryImages } = product;
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const isInStock = stock > 0;

  const allImages = [imageUrl, ...(galleryImages || [])].filter(Boolean);

  const relatedProducts = products
    .filter(p => p.category === category && p.id !== id)
    .slice(0, 4);

  const handleAddToCart = () => {
    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + quantity > stock) {
      const remaining = stock - currentQty;
      if (remaining <= 0) {
        showToast(`Sorry, only ${stock} item${stock > 1 ? 's' : ''} remaining in stock.`, 'error');
      } else {
        showToast(`Sorry, you can only add ${remaining} more item${remaining > 1 ? 's' : ''}.`, 'error');
      }
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`${quantity}x ${name} added to cart!`, 'success', 2000);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      showToast(`Sorry, only ${stock} item${stock > 1 ? 's' : ''} remaining in stock.`, 'error');
      setQuantity(stock);
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
              <span className="pd-price-current">EGP {currentPrice.toFixed(2)}</span>
              {discountPercent > 0 && (
                <>
                  <span className="pd-price-original">EGP {originalPrice.toFixed(2)}</span>
                  <span className="pd-save">Save EGP {(originalPrice - currentPrice).toFixed(2)}</span>
                </>
              )}
            </div>

            <div className={`pd-stock ${isInStock ? 'in' : 'out'}`}>
              <div className="pd-stock-dot"></div>
              {isInStock ? `${stock} In Stock` : 'Out of Stock'}
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
