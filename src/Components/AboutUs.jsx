import React, { useState, useEffect } from "react";
import Img3 from "../assets/Rectangle 20.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import "../aboutus.css";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: "1000+", label: "Happy Users", icon: "👥" },
    { number: "5000+", label: "Items Sold", icon: "📦" },
    { number: "50+", label: "Cities", icon: "🏙️" },
    { number: "98%", label: "Satisfaction", icon: "⭐" },
  ];

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="about-us-section">
      <div className="about-us-container">
        <div className="about-us-title">
          <h2>About Us</h2>

          {/* Enhanced title decoration for both desktop and mobile */}
          <div className="title-decoration">
            <div className="decoration-line"></div>
            <span className="decoration-text">Our Story</span>
            <div className="decoration-line"></div>
          </div>
        </div>

        <div className="about-us-content">
          <div className="about-us-text">
            <div className="text-content">
              <p>
                <strong>WearUP</strong> is Nepal's leading platform for
                second-hand fashion — where style meets sustainability.
              </p>
              <p>
                At WearUP, our mission is to create a simple and trusted space
                where anyone in Nepal can buy or sell second-hand fashion.
                Whether it's clothes, shoes, or accessories, users can easily
                upload their own items, set a price, and connect with buyers
                directly through our platform.
              </p>
              <p>
                Every product listed is a step toward reducing waste and making
                fashion more affordable and accessible. By supporting local
                sellers and promoting reuse, WearUP empowers people to refresh
                their wardrobe while contributing to a more sustainable future.
              </p>
            </div>
          </div>

          <div className="about-us-image">
            <div className="image-container">
              <img src={Img3} alt="WearUP mission" />

              {/* Image overlays for both desktop and mobile */}
              <div className="image-overlay">
                <div className="overlay-content">
                  <h4>Sustainable Fashion</h4>
                  <p>Making a difference, one item at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="stats-and-tagline">
          <div className="stats-section">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`stat-item ${
                    currentStat === index ? "highlighted" : ""
                  }`}
                >
                  <span className="stat-icon">{stat.icon}</span>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tagline-section">
            <p className="about-tagline">Refresh. Reuse. Reinvent Fashion.</p>
            <p className="about-call">
              Join Nepal's sustainable style revolution today.
            </p>
          </div>
        </div>

        {/* Centered call-to-action buttons */}
        <div className="action-buttons">
          <button className="primary-btn"> <Link
                  to="/shopping"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Start Shopping
                </Link></button>
          <button className="secondary-btn"> <Link to="/documentation" style={{ color: "inherit", textDecoration: "none" }}> Learn About Project </Link></button>
        </div>
      </div>


    </section>
  );
};

export default AboutUs;
