import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommentModal from "./CommentModal";
import { API_BASE, MEDIA_BASE } from "../config";
import "../product.css"

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE}/products/${id}/`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const addToCart = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/cart-items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product: id, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`);
      }

      alert('Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${id}`;
    const shareData = {
      title: product.product_name,
      text: `Check out this product: ${product.product_name}`,
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
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #4f46e5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }} />
          <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#fee2e2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <span style={{ fontSize: "30px", color: "#dc2626" }}>⚠️</span>
          </div>
          <h2 style={{ color: "#dc2626", marginBottom: "10px" }}>Product Not Found</h2>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img =>
        img.image.startsWith("http")
          ? img.image
          : (() => {
              const normalized = img.image.replace(/^\/+/, "").replace(/^media\//, "");
              return `${MEDIA_BASE}/media/${normalized}`;
            })()
      )
    : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC41ZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='];

  return (
    <div className="containerA">
      <div className="product-page container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
          {/* Product Images */}
          <div>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <img
                src={images[currentImageIndex]}
                alt={product.product_name}
                style={{
                  width: "100%",
                  height: "500px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC41ZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "18px"
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "18px"
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.product_name} ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: index === currentImageIndex ? "2px solid #4f46e5" : "2px solid transparent",
                      opacity: index === currentImageIndex ? 1 : 0.7
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNmI3MjgwIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5ObyBJbWc8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1a202c",
              marginBottom: "10px"
            }}>
              {product.product_name}
            </h1>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px"
            }}>
              <span style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#4f46e5"
              }}>
                ₹{parseFloat(product.price).toLocaleString()}
              </span>
              {product.original_price && (
                <span style={{
                  fontSize: "20px",
                  color: "#6b7280",
                  textDecoration: "line-through"
                }}>
                  ₹{parseFloat(product.original_price).toLocaleString()}
                </span>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "10px"
              }}>
                Description
              </h3>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                lineHeight: "1.6"
              }}>
                {product.description || "No description available."}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "10px"
              }}>
                Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong>Gender:</strong> {product.gender || "Unisex"}
                </div>
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <strong>Sizes:</strong> {product.sizes.join(", ")}
                  </div>
                )}
                {product.categories && product.categories.length > 0 && (
                  <div>
                    <strong>Categories:</strong> {product.categories.map(cat => cat.name).join(", ")}
                  </div>
                )}
                <div>
                  <strong>Stock:</strong> {product.stock_quantity || 0} available
                </div>
                <div>
                  <strong>Views:</strong> {product.views || 0}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
              <button
                onClick={addToCart}
                style={{
                  flex: 1,
                  padding: "15px 30px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(79, 70, 229, 0.2)"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Add to Cart
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "15px 30px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Buy Now
              </button>
            </div>

            {/* Comment Button */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsCommentModalOpen(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Comments
              </button>
              <button
                onClick={handleShare}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        productId={id}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />
    </div>
  );
}
