import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        nav("/dashboard");
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-logo"></div>
      <div className="login-center">
        <div className="login-card">
          <h1 className="login-title">Log In to WearUp</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="johndoe@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {/* Eye Icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  onChange={(e) => setRememberMe(e.target.checked)} // ✅ Required
                  className="checkbox"
                />
                Remember Me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            <button type="submit" className="proceed-btn" disabled={loading}>
              {loading ? "Logging in..." : "PROCEED"}
            </button>

            <div className="divider">
              <span>OR USE</span>
            </div>

            <div className="social-login">
              {/* You can add Google/Facebook icons here if needed */}
            </div>

            <div className="signup-link">
              Don't have an Account?{" "}
              <span
                style={{ color: "#6366f1", cursor: "pointer", fontWeight: 500 }}
                onClick={() => nav("/signup")}
              >
                Signup
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
