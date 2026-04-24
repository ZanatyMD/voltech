import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import { Filter, Search } from 'lucide-react';
import './ProductGrid.css';

function ProductGrid() {
  const { products, stats } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="product-section" id="products-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest Arrivals</h2>
            <p className="section-subtitle">Discover our cutting-edge selection</p>
          </div>
        </div>

        <div className="product-controls">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="form-input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All
            </button>
            {stats.categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <Filter size={48} className="no-products-icon" />
            <h3>No products found</h3>
            <p>We couldn't find any products matching your current filters.</p>
            <button 
              className="btn btn-secondary mt-4" 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;
