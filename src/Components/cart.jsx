import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, MEDIA_BASE } from '../config';

const authFetch = async (url, options = {}) => {
  const currentToken = localStorage.getItem("access_token");
  try {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("access_token", refreshData.access);
            // Retry the original request with new token
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshData.access}`,
              },
            });
          } else {
            // Refresh failed, redirect to login
            window.location.href = "/WearUp/login";
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          window.location.href = "/WearUp/login";
        }
      } else {
        window.location.href = "/WearUp/login";
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await authFetch(`${API_BASE}/carts/`);
      if (response.ok) {
        const data = await response.json();
        const cart = data[0]; // Assuming one cart per user
        if (cart) {
          setCartItems(cart.items);
        }
      } else {
        setError('Failed to load cart');
      }
    } catch (err) {
      setError('Failed to load cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, delta) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    try {
      const response = await authFetch(`${API_BASE}/cart-items/${itemId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (response.ok) {
        setCartItems(items =>
          items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i)
        );
      }
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await authFetch(`${API_BASE}/cart-items/${itemId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCartItems(items => items.filter(i => i.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + ((parseFloat(item.product.price) || 0) * item.quantity), 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#d3e0f7ff',    
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
      color: 'white',
      flexWrap: 'wrap'
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 12px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      transition: 'all 0.3s'
    },
    title: {
      fontSize: 'clamp(24px, 5vw, 32px)',
      fontWeight: 'bold',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: isDesktop ? '1fr 380px' : '1fr',
      gap: '24px',
      alignItems: 'start'
    },
    cartSection: {
      background: 'white',
      borderRadius: '16px',
      padding: 'clamp(16px, 3vw, 24px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#999'
    },
    cartItem: {
      display: 'flex',
      gap: 'clamp(12px, 2vw, 16px)',
      padding: 'clamp(16px, 3vw, 20px)',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background 0.2s',
      flexWrap: 'wrap'
    },
    itemImage: {
      width: 'clamp(80px, 20vw, 100px)',
      height: 'clamp(80px, 20vw, 100px)',
      objectFit: 'cover',
      borderRadius: '8px',
      background: '#f5f5f5',
      flexShrink: 0
    },
    itemDetails: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    itemName: {
      fontSize: 'clamp(16px, 3vw, 18px)',
      fontWeight: '600',
      color: '#333',
      margin: 0
    },
    itemPrice: {
      fontSize: 'clamp(14px, 2.5vw, 16px)',
      color: '#667eea',
      fontWeight: '600'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginTop: '8px'
    },
    quantityButton: {
      width: '32px',
      height: '32px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    quantity: {
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '30px',
      textAlign: 'center'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#ff4444',
      cursor: 'pointer',
      padding: '8px',
      transition: 'transform 0.2s'
    },
    summaryCard: {
      background: 'white',
      borderRadius: '16px',
      padding: 'clamp(20px, 4vw, 24px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: isDesktop ? 'sticky' : 'static',
      top: '20px'
    },
    summaryTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '15px'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px 0',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      marginTop: '8px'
    },
    checkoutButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    shippingNotice: {
      fontSize: '13px',
      color: '#28a745',
      textAlign: 'center',
      marginTop: '12px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => navigate('/')}
            onMouseOver={e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
          <h1 style={styles.title}>
            <ShoppingCart size={36} />
            Shopping Cart
          </h1>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.cartSection}>
            {loading ? (
              <div style={styles.emptyCart}>
                <h2>Loading cart...</h2>
              </div>
            ) : error ? (
              <div style={styles.emptyCart}>
                <h2>Error loading cart</h2>
                <p>{error}</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <ShoppingCart size={64} />
                <h2>Your cart is empty</h2>
                <p>Add some items to get started!</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <img src={`${MEDIA_BASE}${item.product.image}`} alt={item.product.product_name} style={styles.itemImage} />
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.product.product_name}</h3>
                    <div style={styles.itemPrice}>NPR {(parseFloat(item.product.price) || 0).toFixed(2)}</div>
                    <div style={styles.quantityControls}>
                      <button
                        style={styles.quantityButton}
                        onClick={() => updateQuantity(item.id, -1)}
                        onMouseOver={e => e.target.style.background = '#f5f5f5'}
                        onMouseOut={e => e.target.style.background = 'white'}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        style={styles.quantityButton}
                        onClick={() => updateQuantity(item.id, 1)}
                        onMouseOver={e => e.target.style.background = '#f5f5f5'}
                        onMouseOut={e => e.target.style.background = 'white'}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>NPR {subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax (10%)</span>
              <span>NPR {tax.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `NPR ${shipping.toFixed(2)}`}</span>
            </div>
            <div style={styles.totalRow}>
              <span>Total</span>
              <span>NPR {total.toFixed(2)}</span>
            </div>
            <button
              style={styles.checkoutButton}
              disabled={cartItems.length === 0}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Proceed to Checkout
            </button>
            {subtotal < 100 && subtotal > 0 && (
              <div style={styles.shippingNotice}>
                Add NPR {(100 - subtotal).toFixed(2)} more for free shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}