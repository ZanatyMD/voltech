import { Tag, TrendingDown, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { showToast } from './Toast';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const { name, originalPrice, currentPrice, stock, imageUrl, category } = product;
  
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const isInStock = stock > 0;

  const handleAddToCart = () => {
    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty >= stock) {
      showToast(`Sorry, only ${stock} item${stock > 1 ? 's' : ''} remaining in stock.`, 'error');
      return;
    }
    addToCart(product);
    showToast(`${name} added to cart!`, 'success', 2000);
  };

  return (
    <div className={`product-card scroll-reveal ${!isInStock ? 'out-of-stock' : ''}`} id={`product-${product.id}`}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="discount-badge">
          <TrendingDown size={12} />
          {discountPercent}% OFF
        </div>
      )}

      {/* Image */}
      <Link to={`/product/${product.id}`} className="product-image-wrapper">
        <img src={imageUrl} alt={name} className="product-image" loading="lazy" />
        {!isInStock && (
          <div className="product-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="product-info">
        <div className="product-category">
          <Tag size={12} />
          {category}
        </div>

        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{name}</h3>
        </Link>

        <div className="product-pricing">
          <span className="price-current">EGP {currentPrice.toFixed(2)}</span>
          {discountPercent > 0 && (
            <span className="price-original">EGP {originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="product-footer">
          <div className={`stock-indicator ${isInStock ? 'in' : 'out'}`}>
            <div className="stock-dot"></div>
            <span>{!isInStock ? 'Out of Stock' : `${stock} In Stock`}</span>
          </div>
        </div>

        <button 
          className="btn btn-primary add-to-cart-btn" 
          disabled={!isInStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
