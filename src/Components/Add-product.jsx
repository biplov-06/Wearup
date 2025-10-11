import React, { useState, useRef } from 'react';
import { Upload, Plus, Save, Package, X } from 'lucide-react';
import { API_BASE } from '../config';

const App = () => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [gender, setGender] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null, null, null]);
  const mainImageRef = useRef(null);
  const additionalImageRef1 = useRef(null);
  const additionalImageRef2 = useRef(null);
  const additionalImageRef3 = useRef(null);
  const additionalImageRefs = [additionalImageRef1, additionalImageRef2, additionalImageRef3];

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setMainImage(file);
    }
  };

  const handleAdditionalImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const newImages = [...additionalImages];
      newImages[index] = file;
      setAdditionalImages(newImages);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, isMain = false) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (isMain && imageFiles.length > 0) {
      setMainImage(imageFiles[0]);
    }
  };

  const authFetch = async (url, options = {}) => {
    const currentToken = localStorage.getItem("access_token");
    const headers = {
      ...options.headers,
    };
    // Don't set Content-Type for FormData, let browser set it to multipart/form-data
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${API_BASE}/auth/token/refresh/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("access_token", refreshData.access);
            // Retry original request with new token
            headers["Authorization"] = `Bearer ${refreshData.access}`;
            response = await fetch(url, { ...options, headers });
          } else {
            // Refresh failed, logout
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            alert("Session expired. Please login again.");
            window.location.href = "/login";
            return;
          }
        } catch (error) {
          // Refresh failed, logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          alert("Session expired. Please login again.");
          window.location.href = "/login";
          return;
        }
      } else {
        // No refresh token, logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        alert("Please login to add products.");
        window.location.href = "/login";
        return;
      }
    }

    return response;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('product_name', productName);
      formData.append('description', description);
      formData.append('gender', gender);
      formData.append('stock_quantity', stock);
      formData.append('sizes', JSON.stringify(selectedSizes));
      formData.append('categories', JSON.stringify(categories));
      formData.append('base_price', parseFloat(price.replace('NRP ', '').replace(',', '')) || 0);

      if (mainImage) {
        formData.append('main_image', mainImage);
      }
      additionalImages.forEach((image) => {
        if (image) {
          formData.append('additional_images', image);
        }
      });

      const response = await authFetch(`${API_BASE}/products/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Product added successfully!');
        // Reset form
        setProductName('');
        setDescription('');
        setGender('');
        setPrice('');
        setStock(0);
        setSelectedSizes([]);
        setCategories([]);
        setMainImage(null);
        setAdditionalImages([null, null, null]);
      } else {
        const errorData = await response.json();
        alert(`Error adding product: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .container1 {
          background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .max-width {
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          color: #6b7280;
          font-size: clamp(0.875rem, 2vw, 1.1rem);
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
          }
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
          .card {
            padding: 1.5rem;
          }
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: clamp(1.125rem, 3vw, 1.5rem);
          font-weight: 600;
          color: #111827;
        }

        .icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #3b82f6;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
          font-family: inherit;
          outline: none;
        }

        .form-input:focus {
          border: 2px solid #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .textarea {
          height: 8rem;
          resize: vertical;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .size-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .size-button {
          padding: 0.5rem 1rem;
          border: 2px solid #d1d5db;
          background: white;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 50px;
          font-size: 0.875rem;
        }

        .size-button:hover:not(.size-button-active) {
          border: 2px solid #3b82f6;
          background: #dbeafe;
        }

        .size-button-active {
          background: #3b82f6;
          color: white;
          border: 2px solid #3b82f6;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .radio-group {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .radio-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background 0.2s ease;
        }

        .radio-item:hover {
          background: #f3f4f6;
        }

        .radio-input {
          width: 1rem;
          height: 1rem;
          margin-right: 0.75rem;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .category-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .category-remove {
          margin-left: 0.5rem;
          width: 1rem;
          height: 1rem;
          background: #bfdbfe;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
          font-size: 0.75rem;
          padding: 0;
        }

        .category-remove:hover {
          background: #93c5fd;
        }

        .add-category-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .add-category-form {
            flex-direction: row;
          }
        }

        .add-category-input {
          flex: 1;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          width: 100%;
        }

        @media (min-width: 640px) {
          .btn-primary {
            width: auto;
          }
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        @media (min-width: 768px) {
          .upload-area {
            padding: 2rem;
          }
        }

        .upload-area:hover {
          border: 2px dashed #3b82f6;
          background: #dbeafe;
        }

        .upload-area:hover .upload-icon {
          color: #3b82f6;
        }

        .upload-area:hover .upload-text {
          color: #3b82f6;
        }

        .upload-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: #9ca3af;
          margin: 0 auto 1rem;
          transition: color 0.2s ease;
        }

        @media (min-width: 768px) {
          .upload-icon {
            width: 3rem;
            height: 3rem;
          }
        }

        .upload-text {
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .upload-text {
            font-size: 1rem;
          }
        }

        .upload-subtext {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        @media (min-width: 768px) {
          .upload-subtext {
            font-size: 0.875rem;
          }
        }

        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .thumbnail {
          aspect-ratio: 1;
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafafa;
          overflow: hidden;
        }

        .thumbnail:hover {
          border: 2px dashed #3b82f6;
          background: #dbeafe;
        }

        .thumbnail.has-image {
          background: white;
          border-color: #3b82f6;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-add-product {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          font-size: 1rem;
        }

        .btn-add-product:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .btn-add-product:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .summary-value {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }

        .summary-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        @media (max-width: 640px) {
          .container1 {
            padding: 0.75rem;
          }

          .header {
            margin-bottom: 1.5rem;
          }

          .card {
            border-radius: 0.75rem;
          }

          .section-header {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div className="container1">
        <div className="max-width">
          {/* Header */}
          <div className="header">
            <h1 className="header-title">Add New Product</h1>
            <p className="header-subtitle">Create and manage your product inventory</p>
          </div>

          <div className="main-grid">
            {/* Left Column - Main Content */}
            <div className="left-column">
              {/* General Information */}
              <div className="card">
                <div className="section-header">
                  <Package className="icon" />
                  <h2>General Information</h2>
                </div>

                <div>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="form-input"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-input textarea"
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="form-grid">
                    {/* Size Selection */}
                    <div>
                      <label className="form-label">Available Sizes</label>
                      <div className="size-buttons">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`size-button ${selectedSizes.includes(size) ? 'size-button-active' : ''}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="form-label">Gender</label>
                      <div className="radio-group">
                        {['Men', 'Women', 'Unisex'].map((g) => (
                          <label key={g} className="radio-item">
                            <input
                              type="radio"
                              checked={gender === g}
                              onChange={() => setGender(g)}
                              className="radio-input"
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing and Stock */}
              <div className="card">
                <h2 className="section-header">Pricing & Stock</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Base Price</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="form-input"
                      placeholder="NRP 0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="form-input"
                      placeholder="Enter quantity"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="card">
                <h2 className="section-header">Categories</h2>

                {/* Existing Categories */}
                <div className="form-group">
                  <label className="form-label">Current Categories</label>
                  <div className="categories-list">
                    {categories.map((cat) => (
                      <span key={cat} className="category-tag">
                        {cat}
                        <button
                          onClick={() => removeCategory(cat)}
                          className="category-remove"
                        >
                          <X style={{width: '0.75rem', height: '0.75rem'}} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add New Category */}
                <div className="add-category-form">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="form-input add-category-input"
                    placeholder="Add new category"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button onClick={addCategory} className="btn-primary">
                    <Plus style={{width: '1rem', height: '1rem'}} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="right-column">
              <div className="card">
                <div className="section-header">
                  <Upload className="icon" />
                  <h2>Product Images</h2>
                </div>

                {/* Main Image Upload */}
                <div className="form-group">
                  <label className="form-label">Main Image</label>
                  <div
                    className="upload-area"
                    onClick={() => mainImageRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    <Upload className="upload-icon" />
                    <p className="upload-text">
                      Click to upload or drag and drop
                    </p>
                    <p className="upload-subtext">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    ref={mainImageRef}
                    onChange={handleMainImageUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <input
                    type="file"
                    ref={additionalImageRef1}
                    onChange={(e) => handleAdditionalImageUpload(e, 0)}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <input
                    type="file"
                    ref={additionalImageRef2}
                    onChange={(e) => handleAdditionalImageUpload(e, 1)}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <input
                    type="file"
                    ref={additionalImageRef3}
                    onChange={(e) => handleAdditionalImageUpload(e, 2)}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </div>

                {/* Thumbnail Gallery */}
                <div className="form-group">
                  <label className="form-label">Additional Images</label>
                  <div className="thumbnail-grid">
                    {additionalImages.map((image, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${image ? 'has-image' : ''}`}
                        onClick={() => additionalImageRefs[index]?.current?.click()}
                      >
                        {image ? (
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Additional image ${index + 1}`}
                          />
                        ) : (
                          <Upload style={{width: '1.5rem', height: '1.5rem', color: '#9ca3af'}} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  <button className="btn-secondary">
                    <Save style={{width: '1rem', height: '1rem'}} />
                    Save Draft
                  </button>
                  <button
                    className="btn-add-product"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    <Package style={{width: '1rem', height: '1rem'}} />
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h3 className="summary-title">Product Summary</h3>
                <div>
                  <div className="summary-item">
                    <span className="summary-label">Selected Sizes:</span>
                    <span className="summary-value">{selectedSizes.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Gender:</span>
                    <span className="summary-value">{gender || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Stock:</span>
                    <span className="summary-value">{stock} units</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Categories:</span>
                    <span className="summary-value">{categories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;