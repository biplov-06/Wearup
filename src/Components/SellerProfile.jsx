import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import coverPhotoPlaceholder from "../assets/Elevatt.png";
import {
  MessageSquare ,
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Heart,
  Package,
  ShoppingBag,
  DollarSign,
  Eye,
  Star,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
function SellerProfile() {
  const navigate = useNavigate();
  const { id: sellerId } = useParams();
  const isSellerView = Boolean(sellerId);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  // Remove isSellerView state
  // const [isSellerView, setIsSellerView] = useState(false);

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

  const API_BASE = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access_token");

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
            navigate("/login");
            return;
          }
        } catch (error) {
          // Refresh failed, logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
      } else {
        // No refresh token, logout
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
    const isSellerView = Boolean(sellerId);
    if (!token && !isSellerView) {
      navigate("/login");
      return;
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
      const userData = profileData.user;
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
    } catch (err) {
      setError(err.message);
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

      // Success - close modal and refetch profile
      setShowEditModal(false);
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `${API_BASE}/products/`;
      const isSellerView = Boolean(sellerId);
      if (isSellerView) {
        url = `${API_BASE}/products/?seller=${sellerId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch seller products");
        }
        const productsData = await response.json();
        setProducts(productsData);
      } else if (token && user && user.id) {
        url = `${API_BASE}/products/?seller=${user.id}`;
        const response = await authFetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await response.json();
        setProducts(productsData);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove useEffect that sets isSellerView
  // useEffect(() => {
  //   if (sellerId) {
  //     setIsSellerView(true);
  //   }
  // }, [sellerId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProfile();
      await fetchProducts();
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
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    if (!token) {
      return;
    }

    // Find the product to delete for potential restoration
    const productToDelete = products.find((p) => p.id === productId);
    if (!productToDelete) {
      return;
    }

    // Optimistically remove from state
    setProducts(products.filter((p) => p.id !== productId));

    try {
      const response = await authFetch(`${API_BASE}/products/${productId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to delete product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      // No need to refresh, already removed
    } catch (err) {
      // Restore the product if delete failed
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
      // Refresh products after update
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

  const filteredProducts =
    filterStatus === "all"
      ? products
      : products.filter((p) => p.status === filterStatus);

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
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #4f46e5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ fontSize: "18px", color: "#6b7280" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#fee2e2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <span style={{ fontSize: "30px", color: "#dc2626" }}>⚠️</span>
          </div>
          <h2 style={{ color: "#dc2626", marginBottom: "10px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="seller-profile"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .seller-profile .cover-photo {
            height: 200px !important;
          }
          .seller-profile .profile-info {
            padding: 20px !important;
            margin-top: -60px !important;
          }
          .seller-profile .profile-flex {
            flex-direction: column !important;
            align-items: center !important;
            gap: 20px !important;
          }
          .seller-profile .profile-details {
            min-width: auto !important;
            text-align: center !important;
          }
          .seller-profile .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
          .seller-profile .tabs {
            gap: 20px !important;
            flex-wrap: wrap !important;
          }
          .seller-profile .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 20px !important;
          }

          .seller-profile .modal {
            max-width: 90vw !important;
            padding: 20px !important;
          }
          .seller-profile .modal-content {
            padding: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .seller-profile .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .seller-profile .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          }
          .seller-profile .profile-info {
            padding: 15px !important;
          }
          .seller-profile .cover-photo {
            height: 150px !important;
          }

        }
      `}</style>
      {/* Cover Photo Section */}
      <div
        className="cover-photo"
        style={{ position: "relative", height: "300px", overflow: "hidden" }}
      >
        <img
          src={coverImage}
          alt="Cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.8)",
          }}
        />
      </div>

      {/* Profile Info Section */}
      <div
        className="profile-info"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          marginTop: "-80px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            marginBottom: "30px",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Profile Picture and Basic Info */}
          <div
            className="profile-flex"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "40px",
              marginBottom: "40px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  border: "6px solid white",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  objectFit: "cover",
                }}
              />
              {/* {!isSellerView && (
                <label
                  style={{
                    position: "absolute",
                    bottom: "15px",
                    right: "15px",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "10px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    style={{ display: "none" }}
                  />
                </label>
              )} */}
            </div>

            <div className="profile-details" style={{ flex: 1, minWidth: "400px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "32px",
                      fontWeight: "700",
                      color: "#1a202c",
                      marginBottom: "5px",
                    }}
                  >
                    {displayName}
                  </h1>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "500",
                      color: "#4f46e5",
                    }}
                  >
                    {editFormData.business_name}
                  </h2>
                </div>
                {!isSellerView && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      backgroundColor: "#4f46e5",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(79, 70, 229, 0.2)",
                    }}
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Business Stats - Hide revenue for seller view */}
              <div
                className="stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "30px",
                  marginBottom: "25px",
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "15px",
                  border: "2px solid #e2e8f0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <Package size={20} color="#4f46e5" />
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1a202c",
                      }}
                    >
                      {stats.totalProducts}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    Total Products
                  </span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <TrendingUp size={20} color="#10b981" />
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1a202c",
                      }}
                    >
                      {stats.soldProducts}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    Sold Items
                  </span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <ShoppingBag size={20} color="#3b82f6" />
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1a202c",
                      }}
                    >
                      {stats.activeProducts}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    Active Listings
                  </span>
                </div>
                {!isSellerView && (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        marginBottom: "5px",
                      }}
                    >
                      <DollarSign size={20} color="#f59e0b" />
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#1a202c",
                        }}
                      >
                        ₹{(stats.totalRevenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      Total Revenue
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 20px 0",
                    lineHeight: "1.6",
                    color: "#374151",
                    fontSize: "16px",
                  }}
                >
                  {editFormData.bio}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#6b7280",
                    }}
                  >
                    <MapPin size={18} color="#4f46e5" />
                    <span style={{ fontSize: "16px" }}>
                      {editFormData.location}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#6b7280",
                    }}
                  >
                    <Mail size={18} color="#4f46e5" />
                    <span style={{ fontSize: "16px" }}>
                      {user?.email || ""}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#6b7280",
                    }}
                  >
                    <Phone size={18} color="#4f46e5" />
                    <span style={{ fontSize: "16px" }}>
                      {editFormData.phone}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#6b7280",
                    }}
                  >
                    <Calendar size={18} color="#4f46e5" />
                    <span style={{ fontSize: "16px" }}>
                      Seller since March 2023
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              borderTop: "2px solid #e2e8f0",
              paddingTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "50px",
                flexWrap: "wrap",
              }}
            >
              {[
                { key: "products", label: "MY PRODUCTS", icon: Package },
                // { key: "posts", label: "SOCIAL POSTS", icon: Grid },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "15px 10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    color: activeTab === key ? "#4f46e5" : "#6b7280",
                    borderTop:
                      activeTab === key
                        ? "3px solid #4f46e5"
                        : "3px solid transparent",
                    marginTop: "-30px",
                    paddingTop: "30px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "products" && (
          <div>
            {/* Product Controls */}
            <div
              style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "15px",
                marginBottom: "25px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {["all", "active", "sold_out", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "25px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor:
                        filterStatus === status ? "#4f46e5" : "#f1f5f9",
                      color: filterStatus === status ? "white" : "#64748b",
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div>
                {!isSellerView && (
                  <Link to="/add-product" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Plus size={18} />
                      Add New Product
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div
              className="products-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "25px",
                marginBottom: "40px",
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                    border: "2px solid #f1f5f9",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        backgroundColor: getStatusColor(product.status),
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      {getStatusLabel(product.status)}
                    </div>
                    {product.status === "sold_out" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "rgba(16, 185, 129, 0.95)",
                          color: "white",
                          padding: "20px 30px",
                          borderRadius: "15px",
                          fontSize: "18px",
                          fontWeight: "700",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                        }}
                      >
                        SOLD!
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "25px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "15px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#1a202c",
                          }}
                        >
                          {product.product_name}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "#4f46e5",
                          }}
                        >
                          ₹
                          {product.price ? product.price.toLocaleString() : "0"}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Star size={16} color="#f59e0b" fill="#f59e0b" />
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#374151",
                            }}
                          >
                            {product.rating}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#6b7280",
                          }}
                        >
                          <Eye size={14} />
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {product.views} views
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "12px",
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#6b7280",
                        }}
                      >
                        <Eye size={16} />
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          {product.views} views
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#6b7280",
                        }}
                      >
                        <Heart size={16} />
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          {product.likes} likes
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          backgroundColor: "#e2e8f0",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {product.category}
                      </div>
                    </div>

                    {product.status === "sold" && product.soldDate && (
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#10b981",
                          fontWeight: "600",
                          textAlign: "center",
                          marginTop: "10px",
                        }}
                      >
                        Sold on{" "}
                        {new Date(product.soldDate).toLocaleDateString()}
                      </div>
                    )}

                    {!isSellerView && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                        }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                          style={{
                            flex: 1,
                            padding: "12px",
                            backgroundColor: "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Edit Product
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                          style={{
                            flex: 1,
                            padding: "12px",
                            backgroundColor: "#dc2626", // Red background
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        

          {/* {activeTab === "posts" && (
          <div>
          </div>
        )} */}



        {/* Edit Profile Modal */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "30px",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 25px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a202c",
                  textAlign: "center",
                }}
              >
                Edit Profile
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Profile and Cover Image Uploads */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Profile Picture
                    </label>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={profileImagePreview || profileImage}
                        alt="Profile Preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #e2e8f0",
                        }}
                      />
                      <label
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "5px",
                          backgroundColor: "#4f46e5",
                          color: "white",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
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

                  <div style={{ textAlign: "center" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Cover Photo
                    </label>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={coverImagePreview || coverImage}
                        alt="Cover Preview"
                        style={{
                          width: "150px",
                          height: "60px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          border: "2px solid #e2e8f0",
                        }}
                      />
                      <label
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "5px",
                          backgroundColor: "#4f46e5",
                          color: "white",
                          borderRadius: "50%",
                          width: "25px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
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

                {/* Form Fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.first_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          first_name: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.last_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          last_name: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.business_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        business_name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bio: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: "80px",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          location: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      value={editFormData.website}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          website: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "15px", marginTop: "10px" }}
                >
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      flex: 1,
                      padding: "15px",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    style={{
                      flex: 1,
                      padding: "15px",
                      backgroundColor: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
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
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "30px",
                maxWidth: "500px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 25px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a202c",
                  textAlign: "center",
                }}
              >
                Edit Product
              </h2>

              <div
               
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: "100px",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, stock: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Product Image (Optional)
                  </label>
                  <input
                    type="file"
                    ref={editImageRef}
                    accept="image/*"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "15px", marginTop: "10px" }}
                >
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1,
                      padding: "15px",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditPopup(false);
                      setEditingProduct(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "15px",
                      backgroundColor: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
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
  );
}


export default SellerProfile;
