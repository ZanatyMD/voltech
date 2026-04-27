import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import { Filter, Search, Loader } from 'lucide-react';
import './ProductGrid.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-badge" style={{ width: '60px', height: '18px' }}></div>
        <div className="skeleton skeleton-title" style={{ width: '80%', height: '20px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '50%', height: '14px' }}></div>
        <div className="skeleton-row">
          <div className="skeleton skeleton-price" style={{ width: '90px', height: '24px' }}></div>
          <div className="skeleton skeleton-btn" style={{ width: '36px', height: '36px', borderRadius: '50%' }}></div>
        </div>
      </div>
    </div>
  );
}

function ProductGrid() {
  const { products, stats, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef(null);

  // IntersectionObserver for scroll reveal animations
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Add staggered delay
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, index * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = gridRef.current?.querySelectorAll('.scroll-reveal');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, activeCategory, searchQuery, products]);

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

        {loading ? (
          <>
            <div className="loading-banner">
              <Loader size={20} className="loading-spinner" />
              <span>Loading products...</span>
            </div>
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid" ref={gridRef}>
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
