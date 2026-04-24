import { Tag, Package, TrendingDown, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { name, originalPrice, currentPrice, stock, imageUrl, category } = product;
  
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const isInStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className={`product-card ${!isInStock ? 'out-of-stock' : ''}`} id={`product-${product.id}`}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="discount-badge">
          <TrendingDown size={12} />
          {discountPercent}% OFF
        </div>
      )}

      {/* Image */}
      <div className="product-image-wrapper">
        <img
          src={imageUrl}
          alt={name}
          className="product-image"
          loading="lazy"
        />
        {!isInStock && (
          <div className="product-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="product-category">
          <Tag size={12} />
          {category}
        </div>

        <h3 className="product-name">{name}</h3>

        <div className="product-pricing">
          <span className="price-current">EGP {currentPrice.toFixed(2)}</span>
          {discountPercent > 0 && (
            <span className="price-original">EGP {originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="product-footer">
          <div className={`stock-indicator ${isInStock ? 'in' : 'out'}`}>
            <div className="stock-dot"></div>
            <span>
              {!isInStock ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>
        </div>

        <button 
          className="btn btn-primary add-to-cart-btn" 
          disabled={!isInStock}
          onClick={() => addToCart(product)}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
