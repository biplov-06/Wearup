import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "../categories.css";

const Categories = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // const filters = ["All", "New", "Popular", "Sale"];

  return (
    <div className="categories container">
      <h1 className="categories-title">Shop By Category</h1>

      {/* Mobile-only subtitle and filters
      <div className="mobile-only-content">
        <p className="mobile-subtitle">Discover your perfect style</p>

        <div className="mobile-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${
                selectedFilter === filter ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div> */}

      <div className="categories-grid">
        <div className="category-card">
          <div className="category-wrapper">
            <Link className="nav-link" to="/menwear">
              <img
                src="https://media.istockphoto.com/id/1776498855/photo/indoor-portrait-of-a-man-in-white-dress.jpg?s=612x612&w=0&k=20&c=OlZ47C4P1X2m-8meTN5CbhIpOVEn62tJ5r1g5cK0zNA="
                alt="Gents Fashion"
              />
            </Link>

            {/* Mobile-only elements */}
            <div className="mobile-overlay">
              <span className="category-tag">NEW IN</span>
              <p className="category-desc">Trendy men's fashion</p>
            </div>

            <button className="mobile-heart">♡</button>
          </div>

          <div className="category-info">
            <p className="category-name">Gents</p>
            <div className="mobile-stats">
              <span>120+ items</span>
              {/* <span className="dot">•</span>
              <span>From $29</span> */}
            </div>
          </div>
        </div>

        <div className="category-card">
          <div className="category-wrapper">
            <Link className="nav-link" to="/ladieswear">
              <img
                src="https://jcpenney.scene7.com/is/image/JCPenney/DP0327202507114619M.tif?$gallery$&wid=248&hei=248&op_sharpen=1"
                alt="Ladies Fashion"
              />
            </Link>

            <button className="mobile-heart">♡</button>
          </div>

          <div className="category-info">
            <p className="category-name">Ladies</p>
            <div className="mobile-stats">
              <span>95+ items</span>
              {/* <span className="dot">•</span>
              <span>From $35</span> */}
            </div>
          </div>
        </div>

        <div className="category-card">
          <div className="category-wrapper">
            <Link className="nav-link" to="/unisex">
              <img
                src="https://images.unsplash.com/flagged/photo-1556637640-2c80d3201be8?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c25lYWtlcnxlbnwwfHwwfHx8MA%3D%3D"
                alt="Unisex Fashion"
              />
            </Link>
            <button className="mobile-heart">♡</button>
          </div>

          <div className="category-info">
            <p className="category-name">Unisex</p>
            <div className="mobile-stats">
              <span>80+ items</span>
              {/* <span className="dot">•</span>
              <span>From $25</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
