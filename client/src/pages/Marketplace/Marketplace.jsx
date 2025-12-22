import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, MapPin, Tag, Filter } from 'react-feather';
import './Marketplace.css';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'buy', label: 'Buy' },
    { id: 'sell', label: 'Sell' },
    { id: 'your-items', label: 'Your Items' },
    { id: 'saved', label: 'Saved' },
  ];

  const categories = [
    { id: 'electronics', label: 'Electronics' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'property', label: 'Property' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'services', label: 'Services' },
  ];

  const items = [
    { id: 1, title: 'MacBook Pro 2023', price: '$1,200', location: 'New York', category: 'electronics' },
    { id: 2, title: 'Sofa Set', price: '$450', location: 'Los Angeles', category: 'furniture' },
    { id: 3, title: 'iPhone 15 Pro', price: '$999', location: 'Chicago', category: 'electronics' },
    { id: 4, title: 'Mountain Bike', price: '$350', location: 'Miami', category: 'sports' },
    { id: 5, title: 'Gaming PC', price: '$1,500', location: 'Seattle', category: 'electronics' },
    { id: 6, title: 'Designer Dress', price: '$120', location: 'Paris', category: 'clothing' },
  ];

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>
          <ShoppingBag size={32} />
          <span>Marketplace</span>
        </h1>
        
        <div className="marketplace-actions">
          <div className="marketplace-search">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button className="sell-item-btn">
            <Plus size={20} />
            <span>Sell Item</span>
          </button>
        </div>
      </div>

      <div className="marketplace-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`marketplace-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="categories-bar">
        <button className="category-btn active">
          <Filter size={18} />
          <span>All Categories</span>
        </button>
        {categories.map(category => (
          <button key={category.id} className="category-btn">
            {category.label}
          </button>
        ))}
      </div>

      <div className="marketplace-content">
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-image"></div>
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-price">{item.price}</p>
                <div className="item-meta">
                  <span className="item-location">
                    <MapPin size={14} />
                    {item.location}
                  </span>
                  <span className="item-category">
                    <Tag size={14} />
                    {item.category}
                  </span>
                </div>
                <button className="item-contact-btn">Contact Seller</button>
              </div>
            </div>
          ))}
        </div>

        <div className="marketplace-sidebar">
          <div className="filters-card">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Price Range</label>
              <input type="range" min="0" max="5000" />
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input type="text" placeholder="Enter city" />
            </div>
            <div className="filter-group">
              <label>Condition</label>
              <select>
                <option>Any</option>
                <option>New</option>
                <option>Used</option>
              </select>
            </div>
          </div>

          <div className="recent-searches">
            <h3>Recent Searches</h3>
            <ul>
              <li>Laptops</li>
              <li>Furniture</li>
              <li>Phones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;