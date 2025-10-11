import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CommentModal from "./CommentModal";
import { API_BASE, MEDIA_BASE } from "../config";

export default function App() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCommentProductId, setSelectedCommentProductId] =
    useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [follows, setFollows] = useState({});
  const [saved, setSaved] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});



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

  const addToCart = async (productId) => {
    try {
      const response = await authFetch(`${API_BASE}/cart-items/`, {
        method: "POST",
        body: JSON.stringify({ product: productId, quantity: 1 }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`);
      }
      alert("Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  useEffect(() => {
    // Get current path to determine gender filter
    const location = window.location.pathname.toLowerCase();
    let genderFilter = null;
    if (location.includes("menwear")) {
      genderFilter = "Men";
    } else if (location.includes("ladieswear")) {
      genderFilter = "Women";
    } else if (location.includes("unisex")) {
      genderFilter = "Unisex";
    }

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");

    // Always fetch all products
    let fetchUrl = `${API_BASE}/products/`;

    authFetch(fetchUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Filter products by gender if filter is set
        let filteredData = data;
        if (genderFilter) {
          filteredData = data.filter((product) => {
            // Normalize gender string for comparison
            const productGender = product.gender
              ? product.gender.toLowerCase()
              : "";
            return productGender === genderFilter.toLowerCase();
          });
        }

        // Filter products by search query if present
        if (searchQuery) {
          filteredData = filteredData.filter((product) => {
            const nameMatch = product.product_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const categoryMatch =
              product.categories &&
              product.categories.some((cat) =>
                cat.toLowerCase().includes(searchQuery.toLowerCase())
              );
            return nameMatch || categoryMatch;
          });
        }

        const transformedData = filteredData.map((product) => ({
          id: product.id,
          user: product.seller
            ? {
                id: product.seller.id,
                avatar:
                  product.seller.avatar ||
                  "https://ui-avatars.com/api/?name=Shop&size=40&background=667eea&color=fff",
                name: product.seller.name || "WearUp Shop",
                handle: product.seller.handle || "@user",
                verified: product.seller.verified || true,
              }
            : {
                avatar:
                  "https://ui-avatars.com/api/?name=Shop&size=40&background=667eea&color=fff",
                name: "WearUp Shop",
                handle: "@user",
                verified: true,
              },
          images:
            product.images && product.images.length > 0
              ? product.images.map((img) =>
                  img.image.startsWith("http")
                    ? img.image
                    : `${MEDIA_BASE}${img.image}`
                )
              : [
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC41ZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=",
                ],
          product: {
            title: product.product_name,
            price: `NPR. ${parseFloat(product.price).toFixed(2)}`,
            originalPrice: product.originalPrice
              ? `NPR. ${parseFloat(product.originalPrice).toFixed(2)}`
              : "",
            discount: product.originalPrice
              ? `${Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}% Off`
              : "",
            rating: 4, // Default rating since not in API
            reviews: "25 reviews", // Default reviews since not in API
            description: product.description || "No description available.",
            inStock: product.inStock,
            fastDelivery: product.fastDelivery,
            gender: product.gender,
            sizes: product.sizes,
            categories: product.categories,
          },
          caption: product.caption || `Check out our ${product.product_name}!`,
          likes: product.likes || 0,
          comments: product.comments || 0,
          shares: product.shares || 0,
          user_liked: product.user_liked || false,
          // timeAgo: 'Just now',
          type: "image",
        }));
        setPosts(transformedData);

        // Initialize image index for each post
        const initialIndexes = {};
        transformedData.forEach((post) => {
          initialIndexes[post.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, [window.location.search]);

  const handleProductClick = (post) => {
    setSelectedProduct(post);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleCommentClick = (post) => {
    setSelectedCommentProductId(post.id);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setSelectedCommentProductId(null);
    setIsCommentModalOpen(false);
  };

  const handleLike = async (id) => {
    try {
      const response = await authFetch(
        `${API_BASE}/products/${id}/toggle-like/`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update the posts state with the new likes count and user_liked status
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === id
              ? { ...post, likes: data.likes_count, user_liked: data.liked }
              : post
          )
        );
      } else {
        console.error("Failed to toggle like");
        alert("Failed to like/unlike product. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to like/unlike product. Please try again.");
    }
  };

  const handleFollow = (userId) => {
    setFollows((prevFollows) => ({
      ...prevFollows,
      [userId]: !prevFollows[userId],
    }));
  };

  const handleSave = (id) => {
    setSaved((prevSaved) => ({
      ...prevSaved,
      [id]: !prevSaved[id],
    }));
  };

  const handleShare = async (productId) => {
    try {
      // First, call the share API to increment count
      const response = await authFetch(`${API_BASE}/products/${productId}/share/`, {
        method: "POST",
        body: JSON.stringify({ platform: 'copy_link' }), // Default platform
      });

      if (response.ok) {
        const data = await response.json();
        // Update the shares count in state
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === productId
              ? { ...post, shares: data.shares_count }
              : post
          )
        );
      } else {
        console.error("Failed to share product");
      }

      // Then, create and share the link
      const shareUrl = `${window.location.origin}/product/${productId}`;
      const product = posts.find(p => p.id === productId);
      const shareData = {
        title: product.product.title,
        text: `Check out this product: ${product.product.title}`,
        url: shareUrl,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Product link copied to clipboard!');
        } catch (error) {
          console.error('Error copying to clipboard:', error);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Product link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error("Error sharing product:", error);
      alert("Failed to share product. Please try again.");
    }
  };

  const nextImage = (postId, e) => {
    e.stopPropagation();
    const post = posts.find((p) => p.id === postId);
    if (post && post.images.length > 1) {
      setCurrentImageIndex((prev) => ({
        ...prev,
        [postId]: (prev[postId] + 1) % post.images.length,
      }));
    }
  };

  const prevImage = (postId, e) => {
    e.stopPropagation();
    const post = posts.find((p) => p.id === postId);
    if (post && post.images.length > 1) {
      setCurrentImageIndex((prev) => ({
        ...prev,
        [postId]:
          prev[postId] === 0 ? post.images.length - 1 : prev[postId] - 1,
      }));
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .hover-lift {
          transition: all 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .heart-animation {
          transition: all 0.2s ease;
        }

        .heart-animation:hover {
          transform: scale(1.1);
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .slide-up {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .feed {
          display: grid;
          gap: 1.5rem;
          margin-top: 32px;
        }

        @media (max-width: 767px) {
          .feed {
            grid-template-columns: 1fr;
            gap: 1rem;
            max-width: 100%;
            padding: 0 0.5rem;
            margin-top: 24px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .feed {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem ;
            max-width: 700px;
            margin: 32px auto 0 auto;
          }
        }

        @media (min-width: 1024px) {
          .feed {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            max-width: 1200px;
            margin: 40px auto 0 auto;
          }
        }

        .navbar-spacer {
          width: 100%;
          height: 32px;
          background: linear-gradient(135deg, rgb(245, 247, 250) 0%, #F1F4F8) 100%);
        }

        @media (max-width: 767px) {
          .navbar-spacer {
            height: 24px;
          }
        }

        @media (min-width: 1024px) {
          .navbar-spacer {
            height: 40px;
          }
        }

        .image-navigation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }

        .media-container:hover .image-navigation {
          opacity: 1;
        }

        .image-navigation.prev {
          left: 8px;
        }

        .image-navigation.next {
          right: 8px;
        }

        .image-indicators {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 10;
        }

        .indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transition: background 0.2s ease;
        }

        .indicator.active {
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>

      <div className="navbar-spacer"></div>

      {/* Feed */}
      <main className="feed">
        {posts.length === 0 ? (
          <div style={styles.noProductsMessage}>No products found.</div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              style={styles.postCard}
              className="hover-lift"
            >
              {/* User Header */}
              <div style={styles.userHeader}>
                <div style={styles.userInfo}>
                  <div style={styles.avatarContainer}>
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      style={styles.avatar}
                    />
                    <div style={styles.shopBadge}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      </svg>
                    </div>
                  </div>
                  <div style={styles.userDetails}>
                    <div style={styles.userName}>
                      <span
                        style={{ ...styles.name, cursor: "pointer" }}
                        onClick={() => navigate(`/seller/${post.user.id}`)}
                      >
                        {post.user.name}
                      </span>
                      {/* {post.user.verified && (
                        <div style={styles.verifiedBadge}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )} */}
                    </div>
                    <div style={styles.userMeta}>
                      <span>{post.user.handle}</span>
                    </div>
                  </div>
                </div>
                {/* <button
                    onClick={() => handleFollow(post.user.id)}
                    style={{
                      ...styles.followButton,
                      ...(follows[post.user.id] ? styles.followingButton : {})
                    }}
                    className="hover-lift"
                  >
                    {follows[post.user.id] ? 'Following' : 'Follow'}
                  </button> */}
              </div>

              {/* Media */}
              <div style={styles.mediaContainer} className="media-container">
                <img
                  src={post.images[currentImageIndex[post.id] || 0]}
                  alt={post.product.title}
                  style={styles.postImage}
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC41ZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                  }}
                />

                {/* Image Navigation */}
                {post.images.length > 1 && (
                  <>
                    <button
                      className="image-navigation prev"
                      onClick={(e) => prevImage(post.id, e)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <button
                      className="image-navigation next"
                      onClick={(e) => nextImage(post.id, e)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9,18 15,12 9,6"></polyline>
                      </svg>
                    </button>

                    {/* Image Indicators */}
                    <div className="image-indicators">
                      {post.images.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${
                            index === (currentImageIndex[post.id] || 0)
                              ? "active"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Product Tag Overlay */}
                <div style={styles.productOverlay}>
                  <div style={styles.productTag} className="glass-morphism">
                    <div style={styles.productInfo}>
                      <div style={styles.productDetails}>
                        <h3 style={styles.productTitle}>
                          {post.product.title}
                        </h3>
                        <div style={styles.priceContainer}>
                          <span style={styles.price}>{post.product.price}</span>
                          {post.product.originalPrice && (
                            <>
                              <span style={styles.originalPrice}>
                                {post.product.originalPrice}
                              </span>
                              <span style={styles.discount}>
                                {post.product.discount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleProductClick(post)}
                        style={styles.shopButton}
                        className="hover-lift"
                      >
                        Shop
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      ...styles.actionButton,
                      color: post.user_liked ? "#ef4444" : "#374151",
                    }}
                    className="heart-animation"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={post.user_liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span style={styles.actionCount}>
                      {formatNumber(post.likes)}
                    </span>
                  </button>

                  <button
                    style={styles.actionButton}
                    onClick={() => handleCommentClick(post)}
                    aria-label="Open comments"
                    title="Comments"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span style={styles.actionCount}>{post.comments}</span>
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    style={styles.actionButton}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16,6 12,2 8,6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span style={styles.actionCount}>{post.shares}</span>
                  </button>
                </div>

                {/* <button
                  onClick={() => handleSave(post.id)}
                  style={{
                    ...styles.saveButton,
                    color: saved[post.id] ? "#f59e0b" : "#374151",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={saved[post.id] ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3.5L19 21z" />
                  </svg>
                </button> */}
              </div>

              {/* Caption */}
              <div style={styles.captionContainer}>
                <p style={styles.caption}>
                  <span style={styles.captionUser}>{post.user.name}</span>{" "}
                  {post.caption}
                </p>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div
            style={styles.modal}
            className="slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Product Details</h2>
              <button onClick={closeModal} style={styles.closeButton}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div style={styles.modalContent}>
              {/* Image Gallery in Modal */}
              <div style={styles.modalImageContainer}>
                <img
                  src={
                    selectedProduct.images[
                      currentImageIndex[selectedProduct.id] || 0
                    ]
                  }
                  alt={selectedProduct.product.title}
                  style={styles.modalImage}
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC41ZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                  }}
                />

                {selectedProduct.images.length > 1 && (
                  <div style={styles.imageGallery}>
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.product.title} ${index + 1}`}
                        style={{
                          ...styles.thumbnailImage,
                          border:
                            index ===
                            (currentImageIndex[selectedProduct.id] || 0)
                              ? "2px solid #667eea"
                              : "2px solid transparent",
                        }}
                        onClick={() =>
                          setCurrentImageIndex((prev) => ({
                            ...prev,
                            [selectedProduct.id]: index,
                          }))
                        }
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5ObyBJbWc8L3RleHQ+Cjwvc3ZnPg==";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.modalProductInfo}>
                <h3 style={styles.modalProductTitle}>
                  {selectedProduct.product.title}
                </h3>

                <div style={styles.modalPricing}>
                  <span style={styles.modalPrice}>
                    {selectedProduct.product.price}
                  </span>
                  {selectedProduct.product.originalPrice && (
                    <>
                      <span style={styles.modalOriginalPrice}>
                        {selectedProduct.product.originalPrice}
                      </span>
                      <span style={styles.modalDiscount}>
                        {selectedProduct.product.discount}
                      </span>
                    </>
                  )}
                </div>

                <div style={styles.ratingContainer}>
                  <div style={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={
                          i < Math.floor(selectedProduct.product.rating)
                            ? "#f59e0b"
                            : "#e5e7eb"
                        }
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span style={styles.ratingText}>
                      {selectedProduct.product.rating} (
                      {selectedProduct.product.reviews})
                    </span>
                  </div>
                </div>

                <p style={styles.modalDescription}>
                  {selectedProduct.product.description}
                </p>

                <div style={styles.productMeta}>
                  <div style={styles.metaItem}>
                    <strong>Gender:</strong> {selectedProduct.product.gender}
                  </div>
                  {selectedProduct.product.sizes &&
                    selectedProduct.product.sizes.length > 0 && (
                      <div style={styles.metaItem}>
                        <strong>Sizes:</strong>{" "}
                        {selectedProduct.product.sizes.join(", ")}
                      </div>
                    )}
                  {selectedProduct.product.categories &&
                    selectedProduct.product.categories.length > 0 && (
                      <div style={styles.metaItem}>
                        <strong>Categories:</strong>{" "}
                        {selectedProduct.product.categories.join(", ")}
                      </div>
                    )}
                </div>

                <div style={styles.badges}>
                  {selectedProduct.product.inStock && (
                    <span style={styles.badge}>✓ In Stock</span>
                  )}
                  {selectedProduct.product.fastDelivery && (
                    <span style={styles.badge}>⚡ Fast Delivery</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={styles.modalActions}>
              <button
                onClick={() => addToCart(selectedProduct.id)}
                style={styles.addToCartButton}
                className="hover-lift"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Add to Cart
              </button>
              <button
                onClick={closeModal}
                style={styles.buyNowButton}
                className="hover-lift"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      <CommentModal
        productId={selectedCommentProductId}
        isOpen={isCommentModalOpen}
        onClose={closeCommentModal}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  postCard: {
    background: "white",
    marginBottom: "24px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },

  userHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fce7f3",
  },

  shopBadge: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "16px",
    height: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  userName: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  name: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111827",
  },

  verifiedBadge: {
    width: "16px",
    height: "16px",
    background: "#3b82f6",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  userMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#6b7280",
  },

  dot: {
    color: "#d1d5db",
  },

  sponsored: {
    color: "#ec4899",
    fontWeight: "500",
  },

  followButton: {
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },

  followingButton: {
    background: "#f3f4f6",
    color: "#374151",
  },

  mediaContainer: {
    position: "relative",
  },

  postImage: {
    width: "100%",
    aspectRatio: "4/5",
    objectFit: "cover",
  },

  productOverlay: {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
  },

  productTag: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "12px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  productInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productDetails: {
    flex: 1,
    minWidth: 0,
  },

  productTitle: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  priceContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },

  price: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ec4899",
  },

  originalPrice: {
    fontSize: "12px",
    color: "#6b7280",
    textDecoration: "line-through",
  },

  discount: {
    fontSize: "10px",
    background: "#fee2e2",
    color: "#dc2626",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: "500",
  },

  shopButton: {
    marginLeft: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },

  actions: {
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#374151",
    transition: "all 0.2s ease",
  },

  actionCount: {
    fontWeight: "500",
    fontSize: "14px",
  },

  saveButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#374151",
    transition: "all 0.2s ease",
  },

  captionContainer: {
    padding: "0 16px 16px 16px",
  },

  caption: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#111827",
  },

  captionUser: {
    fontWeight: "600",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
    zIndex: 50,
    padding: "16px",
  },

  modal: {
    background: "white",
    borderRadius: "24px 24px 0 0",
    width: "100%",
    maxWidth: "448px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },

  modalHeader: {
    position: "sticky",
    top: 0,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #f3f4f6",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "24px 24px 0 0",
  },

  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },

  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    transition: "color 0.2s ease",
    padding: "4px",
    borderRadius: "8px",
  },

  modalContent: {
    padding: "16px",
  },

  modalImageContainer: {
    marginBottom: "16px",
  },

  modalImage: {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    marginBottom: "12px",
    aspectRatio: "4/5",
    objectFit: "cover",
  },

  imageGallery: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px",
  },

  thumbnailImage: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
    cursor: "pointer",
    transition: "border 0.2s ease",
    flexShrink: 0,
  },

  modalProductInfo: {
    marginBottom: "24px",
  },

  modalProductTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },

  modalPricing: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  modalPrice: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ec4899",
  },

  modalOriginalPrice: {
    fontSize: "16px",
    color: "#6b7280",
    textDecoration: "line-through",
  },

  modalDiscount: {
    fontSize: "12px",
    background: "#fee2e2",
    color: "#dc2626",
    padding: "4px 12px",
    borderRadius: "12px",
    fontWeight: "600",
  },

  ratingContainer: {
    marginBottom: "16px",
  },

  stars: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  ratingText: {
    fontSize: "14px",
    color: "#6b7280",
  },

  modalDescription: {
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "16px",
  },

  productMeta: {
    marginBottom: "16px",
  },

  metaItem: {
    fontSize: "14px",
    color: "#4b5563",
    marginBottom: "8px",
  },

  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  badge: {
    fontSize: "12px",
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "4px 12px",
    borderRadius: "12px",
    fontWeight: "500",
  },

  modalActions: {
    position: "sticky",
    bottom: 0,
    background: "white",
    padding: "16px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    gap: "12px",
  },

  addToCartButton: {
    flex: 1,
    background: "#f3f4f6",
    color: "#374151",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  buyNowButton: {
    flex: 1,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  noProductsMessage: {
    textAlign: "center",
    padding: "40px 20px",
    fontSize: "18px",
    color: "#6b7280",
    background: "white",
    borderRadius: "16px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "24px",
    gridColumn: "1 / -1",
  },
};
