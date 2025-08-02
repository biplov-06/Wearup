import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Img1 from "../assets/google.svg";
import Img2 from "../assets/facebook.svg";
import '../App.css';


const Offers = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!termsAccepted) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);

    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        const errorMessages = [];
        if (data.username) errorMessages.push(`Username: ${data.username.join(", ")}`);
        if (data.email) errorMessages.push(`Email: ${data.email.join(", ")}`);
        if (data.password) errorMessages.push(`Password: ${data.password.join(", ")}`);
        if (data.first_name) errorMessages.push(`First Name: ${data.first_name.join(", ")}`);
        if (data.last_name) errorMessages.push(`Last Name: ${data.last_name.join(", ")}`);
        if (errorMessages.length === 0) errorMessages.push("Registration failed");
        setError(errorMessages.join("; "));
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup-section">
      <div className="signup-container">
        <div className="signup-benefits">
          <h2>Sign Up. Shop Smart. Save More.</h2>
          <p>Join WearUP & unlock:</p>
          <ul>
            <li>🧡 A FREE welcome gift just for signing up</li>
            <li>💎 2x Points on every purchase</li>
            <li>🎫 Monthly members-only discount vouchers</li>
            <li>🔥 Exclusive deals up to 50% off</li>
          </ul>
        </div>

        <div className="signup-form">
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="checkbox-container">
              <input type="checkbox" id="terms" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <label htmlFor="terms">
                I agree to all the Terms and Privacy Policy
              </label>
            </div>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "SIGN UP"}
            </button>
            <div className="social-signup">
              <p>Or</p>
              <div className="social-buttons">
                {" "}
                <img src={Img1} alt="Google" className="social-icon" />
                <div className="button-div">Sign in with Google</div>
              </div>{" "}
              <div className="social-buttons">
                {" "}
                <img src={Img2} alt="Facebook" className="social-icon" />
                <div className="button-div">Sign in with Facebook</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Offers;
