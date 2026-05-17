import { Tag, TrendingDown, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { showToast } from './Toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ProductCard.css';

function ProductCard({ product, index = 0 }) {
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
    <motion.div
      className={`product-card ${!isInStock ? 'out-of-stock' : ''}`}
      id={`product-${product.id}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ 
        y: -8,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      layout
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <motion.div 
          className="discount-badge"
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + (index % 6) * 0.08, type: 'spring', stiffness: 500, damping: 15 }}
        >
          <TrendingDown size={12} />
          {discountPercent}% OFF
        </motion.div>
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

        <motion.button 
          className="btn btn-primary add-to-cart-btn" 
          disabled={!isInStock}
          onClick={handleAddToCart}
          whileHover={isInStock ? { scale: 1.03 } : {}}
          whileTap={isInStock ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ProductCard;
