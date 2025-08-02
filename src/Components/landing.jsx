import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {Link} from "react-router-dom";
import '../landing.css';

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Mock images for demonstration - replace with your actual imports
  const mobileSlides = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop"
  ];

  const features = [
    "Free Shipping",
    "Easy Returns",
    "24/7 Support",
    "SafePay"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mobileSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => {
    // Replace with your routing logic
    console.log("Navigate to shop");
  };

  return (
    <div className="hero-container">
      {/* Desktop Images - Hidden on mobile */}
      <div className="hero-images d-none d-md-flex">
        <img src="https://th.bing.com/th/id/OIP.REqAm1HkcSUcDbN5O3bEVgHaD7?w=284&h=180&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3" alt="Fashion Item 1" className="hero-item-image" />
        <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=250&fit=crop" alt="Fashion Item 2" className="hero-item-image" />
      </div>
      
      {/* Main Hero Content */}
      <div className="hero-overlay position-relative">
        {/* Mobile-only carousel */}
        <div className="mobile-carousel d-md-none mb-4">
          <div className="carousel-container">
            {mobileSlides.map((slide, index) => (
              <div 
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <img src={slide} alt={`Fashion ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="carousel-dots">
            {mobileSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        <p className="hero-title">WearUp</p>
        <p className="hero-subtitle">Find great fashion at affordable price.</p>
        
        {/* Mobile-only features showcase */}
        <div className="mobile-features d-md-none mb-4">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-badge">
                {feature}
              </div>
            ))}
          </div>
        </div>
        <Link to='/shop'>
          <button className="hero-button" onClick={handleShopNow}>
            Shop Now
          </button>
        </Link>

       

        {/* Mobile-only trending indicator */}
        
      </div>
      
      {/* Desktop Images - Hidden on mobile */}
      <div className="hero-images d-none d-md-flex">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=250&fit=crop" alt="Fashion Item 3" className="hero-item-image" />
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=250&fit=crop" alt="Fashion Item 4" className="hero-item-image" />
      </div>


    </div>
  );
}

export default HeroSection;