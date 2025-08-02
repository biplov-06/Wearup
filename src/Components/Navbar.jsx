import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdOutlineAddBox } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      <nav className="navbar navbar-light bg-transparent container">
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold"
            href="#"
            style={{ fontSize: "24px", color: "#333", paddingTop: location.pathname === '/add-product' ? "10px" : "20px", paddingBottom: location.pathname === '/add-product' ? "10px" : "20px" }}
          >
           WearUp
          </a>

          {/* Desktop menu */}
          <div className="d-none d-lg-flex align-items-center">
            <ul className="navbar-nav me-auto mb-0 d-flex flex-row">
              <li className="nav-item mx-3">
                <Link
                  className="nav-link fw-medium"
                  to="/"
                  style={{ color: "#333" }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item mx-3">
                {isLoggedIn ? (
                  <Link
                    className="nav-link fw-medium"
                    to="/explore"
                    style={{ color: "#333" }}
                  >
                    Explore
                  </Link>
                ) : (
                  <span
                    className="nav-link fw-medium"
                    style={{ color: "#333", cursor: "pointer" }}
                    onClick={() => navigate("/login")}
                  >
                    Explore
                  </span>
                )}
              </li>
              <li className="nav-item mx-3">
                <Link
                  className="nav-link fw-medium"
                  to="/Documentation"
                  style={{ color: "#333" }}
                >
                  Documentation
                </Link>
              </li>
              <li className="nav-item mx-3"></li>
            </ul>



            <div >
              <div  style={{ gap: "20px", display: "flex", alignItems: "center"}}>
                <div className="search-section ">
                  <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "20px",
                      padding: "8px 15px",
                      minWidth: "200px",
                    }}
                  />
                  <button
                    className="search-button"
                    onClick={() => {
                      if (searchKeyword.trim()) {
                        navigate(`/product?search=${encodeURIComponent(searchKeyword.trim())}`);
                      }
                    }}
                  >
                    <IoMdSearch
                      style={{
                        fontSize: "24px",
                        color: "#686161ff",
                        margin: "10px",
                      }}
                    />
                  </button>
                </div>
              <div>
                {isLoggedIn ? (
                  <Link
                    className="nav-link fw-medium"
                    to="/add-product"
                    style={{ color: "#333" }}
                  >
                    <MdOutlineAddBox
                      fontSize={24}
                      style={{ marginRight: "5px" }}
                    />
                    Product
                  </Link>
                ) : (
                  <span
                    className="nav-link fw-medium"
                    style={{ color: "#333", cursor: "pointer" }}
                    onClick={() => navigate("/login")}
                  >
                    <MdOutlineAddBox
                      fontSize={24}
                      style={{ marginRight: "5px" }}
                    />
                    Product
                  </span>
                )}
              </div>
              <Link
                to="/cart"
                className="nav-link fw-medium"
                style={{ color: "#333" }}
              >
                <FaCartShopping
                  style={{ fontSize: "16px", marginRight: "5px" }}
                />
                Cart
              </Link>
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/dashboard')}
                  >
                    {(user?.first_name || user?.username)?.charAt(0).toUpperCase()}
                  </div>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={handleLogout}
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      border: "none",
                      fontSize: "16px",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => navigate("/login")}
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    border: "none",
                    fontSize: "16px",
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </div>






          </div>

          {/* Mobile hamburger button */}
          <button
            className="navbar-toggler d-lg-none border-0"
            type="button"
            aria-label="Toggle navigation"
            onClick={toggleMenu}
            style={{
              background: "none",
              boxShadow: "none",
              padding: "4px",
            }}
          >
            <div className={`hamburger ${showMenu ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {showMenu && (
        <div className="mobile-overlay d-lg-none" onClick={closeMenu}></div>
      )}

      {/* Mobile side menu */}
      <div className={`side-menu d-lg-none ${showMenu ? "show" : ""}`}>
        <div className="side-menu-header">
          <h5 className="mb-0">Menu</h5>
          <button
            className="close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          ></button>
        </div>

        <ul className="side-menu-nav">
          <li>
            <Link to="/" onClick={closeMenu}>
              <span className="menu-icon">🏠</span>
              Home
            </Link>
          </li>
          <li>
            {isLoggedIn ? (
              <Link to="/explore" onClick={closeMenu}>
                <span className="menu-icon">🔍</span>
                Explore
              </Link>
            ) : (
              <span onClick={() => { navigate("/login"); closeMenu(); }}>
                <span className="menu-icon">🔍</span>
                Explore
              </span>
            )}
          </li>
          <li>
            <Link to="#" onClick={closeMenu}>
              <span className="menu-icon">📂</span>
              Category
            </Link>
          </li>
          <li>
            {isLoggedIn ? (
              <Link to="/add-product" onClick={closeMenu}>
                <span className="menu-icon">➕</span>
                Add Product
              </Link>
            ) : (
              <span onClick={() => { navigate("/login"); closeMenu(); }}>
                <span className="menu-icon">➕</span>
                Add Product
              </span>
            )}
          </li>
        </ul>
        <div className="side-menu-actions">
          <button className="mobile-cart-btn" onClick={() => { navigate('/cart'); closeMenu(); }}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Shopping Bag
          </button>
          {isLoggedIn ? (
            <div style={{ padding: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
                onClick={() => { navigate('/dashboard'); closeMenu(); }}
              >
                {(user?.first_name || user?.username)?.charAt(0).toUpperCase()}
              </div>
              <button
                className="mobile-login-btn"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="mobile-login-btn"
              onClick={() => {
                navigate("/login");
                closeMenu();
              }}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </>
  );
}
