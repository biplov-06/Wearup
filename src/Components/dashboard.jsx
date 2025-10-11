import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Heart,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Eye,
  Star,
  Plus,
  Box,
} from "lucide-react";
import { Link } from "react-router-dom";
import coverPhotoPlaceholder from "../assets/Elevatt.png";
import { API_BASE, MEDIA_BASE } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const { id: sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  const [isSellerView, setIsSellerView] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: 0,
  });
  const editImageRef = useRef(null);

  const token = localStorage.getItem("access_token");

  const authFetch = async (url, options = {}) => {
    const currentToken = localStorage.getItem("access_token");
    const headers = {
      ...options.headers,
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
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
            headers["Authorization"] = `Bearer ${refreshData.access}`;
            response = await fetch(url, { ...options, headers });
          } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
        } catch (error) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
    }

    return response;
  };

  const fetchProfile = async () => {
    if (!token && !isSellerView) {
      navigate("/login");
      return null;
    }

    try {
      let response;
      if (isSellerView) {
        const url = `${API_BASE}/users/${sellerId}/`;
        response = await fetch(url);
      } else {
        const url = `${API_BASE}/auth/profile/`;
        response = await authFetch(url);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();
      const userData = isSellerView ? profileData : profileData.user;
      setUser(userData);
      setEditFormData({
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        business_name: profileData.business_name || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        website: profileData.website || "",
        phone: profileData.phone || "",
      });
      setProfileImage(
        profileData.profile_image ||
         "https://s-media-cache-ak0.pinimg.com/originals/51/83/ef/5183ef65b82a66cf573f324e59cf028b.jpg"
      );
      setCoverImage(
        profileData.cover_image ||
          coverPhotoPlaceholder
          
      );
      return userData;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", editFormData.first_name);
    formData.append("last_name", editFormData.last_name);
    formData.append("business_name", editFormData.business_name);
    formData.append("bio", editFormData.bio);
    formData.append("location", editFormData.location);
    formData.append("website", editFormData.website);
    formData.append("phone", editFormData.phone);
    if (profileImageFile) {
      formData.append("profile_image", profileImageFile);
    }
    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }

    try {
      const response = await authFetch(`${API_BASE}/auth/profile/`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setShowEditModal(false);
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProducts = async (userId = null) => {
    try {
      let url = `${API_BASE}/products/`;
      if (isSellerView) {
        url = `${API_BASE}/products/?seller=${sellerId}`;
      } else if (token && userId) {
        url = `${API_BASE}/products/?seller=${userId}`;
      }
      const response = isSellerView ? await fetch(url) : await authFetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const productsData = await response.json();
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsSellerView(!!sellerId);
  }, [sellerId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const userData = await fetchProfile();
      const userId = userData?.id;
      await fetchProducts(userId);
      setLoading(false);
    };
    init();
  }, [sellerId]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.product_name || "",
      description: product.description || "",
      price: product.base_price || "",
      stock: product.stock_quantity || 0,
    });
    setShowEditPopup(true);
  };

  const handleDelete = async (productId) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    if (!token) {
      return;
    }

    const productToDelete = products.find((p) => p.id === productId);
    if (!productToDelete) {
      return;
    }

    setProducts(products.filter((p) => p.id !== productId));

    try {
      const response = await authFetch(`${API_BASE}/products/${productId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
    } catch (err) {
      setProducts((prev) => [...prev, productToDelete]);
      setError(err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !token) return;

    try {
      const formData = new FormData();
      formData.append("product_name", editForm.name);
      formData.append("description", editForm.description);
      if (editForm.price && editForm.price !== "") {
        formData.append("base_price_input", editForm.price);
      }
      formData.append("stock_quantity", editForm.stock);
      formData.append("gender", editingProduct.gender || "Unisex");
      formData.append(
        "discount_percentage",
        editingProduct.discount_percentage || 0
      );
      formData.append("sizes", JSON.stringify(editingProduct.sizes || []));
      formData.append(
        "categories",
        JSON.stringify(editingProduct.categories || [])
      );

      if (editImageRef.current && editImageRef.current.files[0]) {
        formData.append("main_image", editImageRef.current.files[0]);
      }

      const response = await authFetch(
        `${API_BASE}/products/${editingProduct.id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error("Update failed:", errorData);
          throw new Error(
            errorData.detail ||
              `Failed to update product: ${response.status} ${response.statusText}`
          );
        } catch (parseError) {
          console.error("Server returned non-JSON response:", errorText);
          throw new Error(
            `Server error (non-JSON response): ${response.status} ${response.statusText}`
          );
        }
      }

      setShowEditPopup(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : "Loading...";

  const stats = {
    totalProducts: products.length,
    soldProducts: products.filter((p) => p.status === "sold_out").length,
    activeProducts: products.filter((p) => p.status === "active").length,
    totalRevenue: products
      .filter((p) => p.status === "sold_out")
      .reduce((sum, p) => sum + (p.price || 0), 0),
  };

  let filteredProducts = filterStatus === "all" ? products : products.filter((p) => p.status === filterStatus);
  if (searchKeyword) {
    filteredProducts = filteredProducts.filter((p) =>
      (p.product_name && p.product_name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (p.categories && Array.isArray(p.categories) && p.categories.some(cat => cat && cat.name && cat.name.toLowerCase().includes(searchKeyword.toLowerCase())))
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "sold_out":
        return "#10b981";
      case "active":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sold_out":
        return "SOLD";
      case "active":
        return "ACTIVE";
      case "pending":
        return "PENDING APPROVAL";
      default:
        return status ? status.toUpperCase() : "UNKNOWN";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <style>{styles}</style>
        <div className="loading-content">
          <div className="spinner" />
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <style>{styles}</style>
        <div className="error-content">
          <div className="error-icon">
            <span>⚠️</span>
          </div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="error-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        {/* Cover Photo Section */}
        <div className="cover-photo-section">
          <img
            src={coverImage}
            alt="Cover"
            className="cover-image"
          />
        </div>

        {/* Profile Info Section */}
        <div className="main-content">
          <div className="profile-card">
            {/* Profile Picture and Basic Info */}
            <div className="profile-header">
              <div className="profile-picture-wrapper">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-picture"
                />
              </div>

              <div className="profile-info">
                <div className="profile-title-section">
                  <div>
                    <h1 className="profile-name">{displayName}</h1>
                    <h2 className="business-name">{editFormData.business_name}</h2>
                  </div>
                  {!isSellerView && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="edit-profile-button"
                    >
                      <Edit3 size={18} />
                      <span className="edit-text">Edit Profile</span>
                    </button>
                  )}
                </div>

                {/* Business Stats */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value-row">
                      <Package size={20} color="#4f46e5" />
                      <span className="stat-value">{stats.totalProducts}</span>
                    </div>
                    <span className="stat-label">Total Products</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value-row">
                      <TrendingUp size={20} color="#10b981" />
                      <span className="stat-value">{stats.soldProducts}</span>
                    </div>
                    <span className="stat-label">Sold Items</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value-row">
                      <ShoppingBag size={20} color="#3b82f6" />
                      <span className="stat-value">{stats.activeProducts}</span>
                    </div>
                    <span className="stat-label">Active Listings</span>
                  </div>
                  {!isSellerView && (
                    <div className="stat-item">
                      <div className="stat-value-row">
                        <DollarSign size={20} color="#f59e0b" />
                        <span className="stat-value-small">
                          ₹{(stats.totalRevenue / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <span className="stat-label">Total Revenue</span>
                    </div>
                  )}
                </div>

                <div className="profile-details">
                  <p className="bio-text">{editFormData.bio}</p>

                  <div className="contact-info">
                    <div className="contact-item">
                      <MapPin size={18} color="#4f46e5" />
                      <span>{editFormData.location}</span>
                    </div>
                    <div className="contact-item">
                      <Mail size={18} color="#4f46e5" />
                      <span>{user?.email || ""}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={18} color="#4f46e5" />
                      <span>{editFormData.phone}</span>
                    </div>
                    <div className="contact-item">
                      <Calendar size={18} color="#4f46e5" />
                      <span>Seller since March 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-section">
              <div className="tabs-container">
                {[
                  { key: "products", label: "MY PRODUCTS", icon: Package },
                  { key: "analytics", label: "ANALYTICS", icon: TrendingUp },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`tab-button ${activeTab === key ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span className="tab-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "products" && (
            <div>
              {/* Product Controls */}
              <div className="product-controls">
                <div className="filter-buttons">
                  {["all", "active", "sold_out", "pending"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`filter-button ${filterStatus === status ? 'active' : ''}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                {!isSellerView && (
                  <button className="add-product-button">
                    <Link
                      to="/add-product"
                      style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Plus size={18} />
                      <span>Add New Product</span>
                    </Link>
                  </button>
                )}
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="product-image-wrapper">
                      <img
                        src={product.image.startsWith("http")
                          ? product.image
                          : (() => {
                              const normalized = product.image.replace(/^\/+/, "").replace(/^media\//, "");
                              return `${MEDIA_BASE}/media/${normalized}`;
                            })()
                        }
                        alt={product.product_name}
                        className="product-image"
                      />
                      <div
                        className="product-status-badge"
                        style={{ backgroundColor: getStatusColor(product.status) }}
                      >
                        {getStatusLabel(product.status)}
                      </div>
                      {product.status === "sold_out" && (
                        <div className="sold-overlay">SOLD!</div>
                      )}
                    </div>

                    <div className="product-details">
                      <div className="product-header">
                        <div>
                          <h3 className="product-name">{product.product_name}</h3>
                          <p className="product-price">
                            ₹{product.price ? product.price.toLocaleString() : "0"}
                          </p>
                        </div>
                        <div className="product-rating">
                          <Star size={16} color="#f59e0b" fill="#f59e0b" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <div className="product-stats">
                        <div className="product-stat">
                          <Eye size={16} />
                          <span>{product.views} views</span>
                        </div>
                        <div className="product-stat">
                          <Heart size={16} />
                          <span>{product.likes} likes</span>
                        </div>
                      </div>

                      {product.status === "sold_out" && product.soldDate && (
                        <div className="sold-date">
                          Sold on {new Date(product.soldDate).toLocaleDateString()}
                        </div>
                      )}

                      {!isSellerView && (
                        <div className="product-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                            className="edit-button"
                          >
                            Edit Product
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="analytics-section">
              <div className="analytics-card">
                <h2 className="analytics-title">Business Analytics</h2>

                <div className="analytics-stats-grid">
                  <div className="analytics-stat conversion">
                    <TrendingUp size={32} />
                    <h3 className="analytics-stat-value">
                      {stats.totalProducts === 0
                        ? "0.0"
                        : ((stats.soldProducts / stats.totalProducts) * 100).toFixed(1)}%
                    </h3>
                    <p>Sale Conversion</p>
                  </div>

                  <div className="analytics-stat views">
                    <Eye size={32} />
                    <h3 className="analytics-stat-value">
                      {products.reduce((sum, p) => sum + p.views, 0)}
                    </h3>
                    <p>Total Views</p>
                  </div>

                  <div className="analytics-stat rating">
                    <MessageSquare size={32} />
                    <h3 className="analytics-stat-value">
                      {products.reduce((sum, p) => sum + p.comments, 0)}
                    </h3>
                    <p>Comments</p>
                  </div>

                  <div className="analytics-stat likes">
                    <Heart size={32} />
                    <h3 className="analytics-stat-value">
                      {products.reduce((sum, p) => sum + p.likes, 0)}
                    </h3>
                    <p>Total Likes</p>
                  </div>
                </div>

                <div className="analytics-bottom">
                  <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      {(() => {
                        const recentActivities = [];
                        const soldProducts = products.filter(p => p.status === "sold_out").slice(0, 2);
                        soldProducts.forEach(p => {
                          recentActivities.push({
                            type: 'sold',
                            product: p.product_name,
                            date: 'Recently'
                          });
                        });
                        if (recentActivities.length < 2) {
                          const likedProducts = products.filter(p => p.likes > 0).sort((a,b) => b.likes - a.likes).slice(0, 2 - recentActivities.length);
                          likedProducts.forEach(p => {
                            recentActivities.push({
                              type: 'liked',
                              product: p.product_name,
                              count: p.likes,
                              date: 'Recently'
                            });
                          });
                        }
                        return recentActivities.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <div className={`activity-icon ${activity.type}`}>
                              {activity.type === 'sold' ? <Package size={20} color="white" /> : <Heart size={20} color="white" />}
                            </div>
                            <div>
                              <p className="activity-text">
                                {activity.type === 'sold' ? `${activity.product} sold` : `${activity.product} received ${activity.count} likes`}
                              </p>
                              <p className="activity-date">{activity.date}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="top-categories">
                    <h3>Top Categories</h3>
                    <div className="categories-list">
                      {(() => {
                        const allCategories = products.flatMap(p => p.categories || []);
                        const categoryCounts = {};
                        allCategories.forEach(cat => {
                          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                        });
                        const topCategories = Object.entries(categoryCounts).map(([name, count]) => ({
                          name,
                          count,
                          percentage: products.length === 0 ? 0 : ((count / products.length) * 100).toFixed(0)
                        })).sort((a,b) => b.count - a.count).slice(0, 3);
                        const colors = ['#4f46e5', '#10b981', '#f59e0b'];
                        return topCategories.map((category, index) => (
                          <div key={category.name} className="category-item">
                            <div className="category-header">
                              <span className="category-name">{category.name}</span>
                              <span className="category-percentage">{category.percentage}%</span>
                            </div>
                            <div className="category-bar">
                              <div
                                className="category-bar-fill"
                                style={{
                                  width: `${category.percentage}%`,
                                  backgroundColor: colors[index % colors.length],
                                }}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-title">Edit Profile</h2>

                <div className="modal-form">
                  <div className="image-uploads">
                    <div className="image-upload-item">
                      <label className="upload-label">Profile Picture</label>
                      <div className="image-preview-wrapper">
                        <img
                          src={profileImagePreview || profileImage}
                          alt="Profile Preview"
                          className="profile-preview"
                        />
                        <label className="camera-button">
                          <Camera size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="image-upload-item">
                      <label className="upload-label">Cover Photo</label>
                      <div className="image-preview-wrapper">
                        <img
                          src={coverImagePreview || coverImage}
                          alt="Cover Preview"
                          className="cover-preview"
                        />
                        <label className="camera-button">
                          <Camera size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="field-label">First Name</label>
                      <input
                        type="text"
                        value={editFormData.first_name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            first_name: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Last Name</label>
                      <input
                        type="text"
                        value={editFormData.last_name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            last_name: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Business Name</label>
                    <input
                      type="text"
                      value={editFormData.business_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          business_name: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Bio</label>
                    <textarea
                      value={editFormData.bio}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, bio: e.target.value })
                      }
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="field-label">Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            location: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Website (optional)</label>
                      <input
                        type="url"
                        value={editFormData.website}
                        placeholder="https://example.com"
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            website: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Phone Number</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="modal-actions">
                    <button onClick={handleSaveProfile} className="save-button">
                      Save Changes
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Popup */}
          {showEditPopup && editingProduct && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-title">Edit Product</h2>

                <div className="modal-form">
                  <div className="form-field">
                    <label className="field-label">Product Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="field-label">Price (NPR)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Stock Quantity</label>
                      <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) =>
                          setEditForm({ ...editForm, stock: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Product Image (Optional)</label>
                    <input
                      type="file"
                      ref={editImageRef}
                      accept="image/*"
                      className="form-file-input"
                    />
                  </div>

                  <div className="modal-actions">
                    <button onClick={handleSaveEdit} className="save-button">
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setShowEditPopup(false);
                        setEditingProduct(null);
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  * {
    box-sizing: border-box;
  }

  .loading-container,
  .error-container {
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 20px;
  }

  .loading-content,
  .error-content {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .loading-text {
    font-size: 18px;
    color: #6b7280;
  }

  .error-icon {
    width: 60px;
    height: 60px;
    background-color: #fee2e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .error-icon span {
    font-size: 30px;
  }

  .error-title {
    color: #dc2626;
    margin-bottom: 10px;
  }

  .error-message {
    color: #6b7280;
    margin-bottom: 20px;
  }

  .error-button {
    padding: 10px 20px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
  }

  .dashboard-container {
    min-height: 100vh;
    background-color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .cover-photo-section {
    position: relative;
    height: 300px;
    overflow: hidden;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8);
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
    margin-top: -80px;
  }

  .profile-card {
    background-color: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
  }

  .profile-header {
    display: flex;
    align-items: flex-start;
    gap: 40px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .profile-picture-wrapper {
    flex-shrink: 0;
  }

  .profile-picture {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 6px solid white;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    object-fit: cover;
  }

  .profile-info {
    flex: 1;
    min-width: 280px;
  }

  .profile-title-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .profile-name {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 5px;
  }

  .business-name {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #4f46e5;
  }

  .edit-profile-button {
    background-color: #4f46e5;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
  }

  .edit-profile-button:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 30px;
    margin-bottom: 25px;
    padding: 20px;
    background-color: #f8fafc;
    border-radius: 15px;
    border: 2px solid #e2e8f0;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
  }

  .stat-value-small {
    font-size: 20px;
    font-weight: 700;
    color: #1a202c;
  }

  .stat-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .profile-details {
  }

  .bio-text {
    margin: 0 0 20px 0;
    line-height: 1.6;
    color: #374151;
    font-size: 16px;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6b7280;
    font-size: 16px;
  }

  .tabs-section {
    border-top: 2px solid #e2e8f0;
    padding-top: 30px;
  }

  .tabs-container {
    display: flex;
    justify-content: center;
    gap: 50px;
    flex-wrap: wrap;
  }

  .tab-button {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 15px 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #6b7280;
    border-top: 3px solid transparent;
    margin-top: -30px;
    padding-top: 30px;
    transition: all 0.3s ease;
  }

  .tab-button.active {
    color: #4f46e5;
    border-top: 3px solid #4f46e5;
  }

  .tab-button:hover {
    color: #4f46e5;
  }

  .product-controls {
    background-color: white;
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .filter-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-button {
    padding: 10px 20px;
    border-radius: 25px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    background-color: #f1f5f9;
    color: #64748b;
    transition: all 0.3s ease;
  }

  .filter-button.active {
    background-color: #4f46e5;
    color: white;
  }

  .filter-button:hover {
    background-color: #e2e8f0;
  }

  .filter-button.active:hover {
    background-color: #4338ca;
  }

  .add-product-button {
    background-color: #10b981;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .add-product-button:hover {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
  }

  .product-card {
    background-color: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    border: 2px solid #f1f5f9;
  }

  .product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }

  .product-image-wrapper {
    position: relative;
  }

  .product-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .product-status-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .sold-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(16, 185, 129, 0.95);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }

  .product-details {
    padding: 25px;
  }

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 15px;
  }

  .product-name {
    margin: 0 0 5px 0;
    font-size: 20px;
    font-weight: 700;
    color: #1a202c;
  }

  .product-price {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: #4f46e5;
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }

  .product-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f8fafc;
    border-radius: 12px;
    margin-bottom: 15px;
  }

  .product-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
  }

  .sold-date {
    font-size: 14px;
    color: #10b981;
    font-weight: 600;
    text-align: center;
    margin-top: 10px;
  }

  .product-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .edit-button,
  .delete-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .edit-button {
    background-color: #4f46e5;
    color: white;
  }

  .edit-button:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
  }

  .delete-button {
    background-color: #dc2626;
    color: white;
  }

  .delete-button:hover {
    background-color: #b91c1c;
    transform: translateY(-2px);
  }

  .analytics-section {
  }

  .analytics-card {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    margin-bottom: 25px;
  }

  .analytics-title {
    margin: 0 0 25px 0;
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
  }

  .analytics-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .analytics-stat {
    padding: 25px;
    border-radius: 15px;
    text-align: center;
  }

  .analytics-stat.conversion {
    background-color: #f0f9ff;
    color: #0369a1;
    border: 2px solid #e0f2fe;
  }

  .analytics-stat.views {
    background-color: #f0fdf4;
    color: #15803d;
    border: 2px solid #dcfce7;
  }

  .analytics-stat.rating {
    background-color: #fefce8;
    color: #ca8a04;
    border: 2px solid #fef3c7;
  }

  .analytics-stat.likes {
    background-color: #fdf2f8;
    color: #be185d;
    border: 2px solid #fce7f3;
  }

  .analytics-stat-value {
    margin: 10px 0 5px 0;
    font-size: 32px;
    font-weight: 800;
  }

  .analytics-stat p {
    margin: 0;
    font-weight: 600;
  }

  .analytics-bottom {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 25px;
    margin-top: 30px;
  }

  .recent-activity,
  .top-categories {
    background-color: #f8fafc;
    padding: 25px;
    border-radius: 15px;
    border: 2px solid #e2e8f0;
  }

  .recent-activity h3,
  .top-categories h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 700;
    color: #1a202c;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .activity-icon.sold {
    background-color: #10b981;
  }

  .activity-icon.liked {
    background-color: #3b82f6;
  }

  .activity-text {
    margin: 0 0 5px 0;
    font-weight: 600;
    color: #1a202c;
  }

  .activity-date {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .category-item {
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .category-name {
    font-weight: 600;
    color: #374151;
  }

  .category-percentage {
    color: #6b7280;
  }

  .category-bar {
    width: 100%;
    height: 8px;
    background-color: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .category-bar-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background-color: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .modal-title {
    margin: 0 0 25px 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
    text-align: center;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .image-uploads {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .image-upload-item {
    text-align: center;
  }

  .upload-label {
    display: block;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }

  .image-preview-wrapper {
    position: relative;
    display: inline-block;
  }

  .profile-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e2e8f0;
  }

  .cover-preview {
    width: 150px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid #e2e8f0;
  }

  .camera-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: #4f46e5;
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .camera-button:hover {
    background-color: #4338ca;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .field-label {
    display: block;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }

  .form-input,
  .form-textarea,
  .form-file-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    font-family: inherit;
    transition: border-color 0.3s ease;
  }

  .form-input:focus,
  .form-textarea:focus,
  .form-file-input:focus {
    outline: none;
    border-color: #4f46e5;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }

  .save-button,
  .cancel-button {
    flex: 1;
    padding: 15px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .save-button {
    background-color: #10b981;
    color: white;
  }

  .save-button:hover {
    background-color: #059669;
    transform: translateY(-2px);
  }

  .cancel-button {
    background-color: #6b7280;
    color: white;
  }

  .cancel-button:hover {
    background-color: #4b5563;
    transform: translateY(-2px);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .main-content {
      padding: 0 15px;
    }

    .profile-card {
      padding: 30px 20px;
    }

    .analytics-bottom {
      grid-template-columns: 1fr;
    }

    .analytics-stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
  }

  @media (max-width: 768px) {
    .cover-photo-section {
      height: 200px;
    }

    .main-content {
      margin-top: -60px;
    }

    .profile-card {
      padding: 25px 15px;
    }

    .profile-header {
      gap: 20px;
    }

    .profile-picture {
      width: 120px;
      height: 120px;
    }

    .profile-info {
      min-width: 100%;
    }

    .profile-name {
      font-size: 24px;
    }

    .business-name {
      font-size: 16px;
    }

    .profile-title-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .edit-profile-button {
      width: 100%;
      justify-content: center;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      padding: 15px;
    }

    .stat-value {
      font-size: 20px;
    }

    .stat-label {
      font-size: 12px;
    }

    .tabs-container {
      gap: 20px;
    }

    .tab-button {
      font-size: 12px;
      padding: 12px 8px;
      gap: 6px;
    }

    .tab-label {
      display: none;
    }

    .product-controls {
      padding: 20px 15px;
      flex-direction: column;
      align-items: stretch;
    }

    .filter-buttons {
      width: 100%;
      justify-content: center;
    }

    .filter-button {
      padding: 8px 16px;
      font-size: 13px;
    }

    .add-product-button {
      width: 100%;
      justify-content: center;
    }

    .products-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .product-image {
      height: 200px;
    }

    .analytics-card {
      padding: 20px 15px;
    }

    .analytics-title {
      font-size: 24px;
    }

    .analytics-stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .analytics-stat-value {
      font-size: 28px;
    }

    .modal-content {
      padding: 25px 20px;
      max-width: 100%;
    }

    .image-uploads {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .cover-photo-section {
      height: 150px;
    }

    .main-content {
      margin-top: -40px;
      padding: 0 10px;
    }

    .profile-card {
      padding: 20px 15px;
      border-radius: 15px;
    }

    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-picture {
      width: 100px;
      height: 100px;
    }

    .profile-name {
      font-size: 22px;
    }

    .business-name {
      font-size: 14px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 12px;
    }

    .contact-item {
      font-size: 14px;
      word-break: break-word;
    }

    .tabs-container {
      gap: 10px;
    }

    .tab-button {
      padding: 10px 8px;
      margin-top: -20px;
      padding-top: 20px;
    }

    .product-controls {
      padding: 15px 10px;
    }

    .filter-buttons {
      gap: 8px;
    }

    .filter-button {
      padding: 8px 12px;
      font-size: 12px;
    }

    .add-product-button {
      padding: 10px 20px;
      font-size: 14px;
    }

    .products-grid {
      gap: 15px;
    }

    .product-details {
      padding: 20px 15px;
    }

    .product-name {
      font-size: 18px;
    }

    .product-price {
      font-size: 20px;
    }

    .analytics-card {
      padding: 20px 12px;
    }

    .analytics-title {
      font-size: 20px;
    }

    .analytics-stats-grid {
    grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .analytics-stat {
      padding: 20px;
    }

    .analytics-stat-value {
      font-size: 24px;
    }

    .recent-activity,
    .top-categories {
      padding: 20px 15px;
    }

    .recent-activity h3,
    .top-categories h3 {
      font-size: 18px;
    }

    .activity-item {
      padding: 12px;
      gap: 12px;
    }

    .activity-icon {
      width: 35px;
      height: 35px;
    }

    .activity-text {
      font-size: 14px;
    }

    .activity-date {
      font-size: 12px;
    }

    .modal-overlay {
      padding: 10px;
    }

    .modal-content {
      padding: 20px 15px;
      border-radius: 15px;
    }

    .modal-title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .modal-form {
      gap: 15px;
    }

    .field-label {
      font-size: 14px;
    }

    .form-input,
    .form-textarea,
    .form-file-input {
      padding: 10px 12px;
      font-size: 14px;
    }

    .save-button,
    .cancel-button {
      padding: 12px;
      font-size: 14px;
    }

    .edit-text {
      display: none;
    }
  }

  @media (max-width: 360px) {
    .profile-name {
      font-size: 20px;
    }

    .stat-value {
      font-size: 18px;
    }

    .stat-label {
      font-size: 11px;
    }

    .product-name {
      font-size: 16px;
    }

    .product-price {
      font-size: 18px;
    }

    .filter-button {
      padding: 6px 10px;
      font-size: 11px;
    }
  }
`;

export default Dashboard;