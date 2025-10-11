import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './Components/Navbar';
import HeroSection from './Components/landing';
import Categories from './Components/categories';
import AboutUs from './Components/AboutUs';
import Offers from './Components/Offers.jsx';
import Footer from './Components/Footer.jsx';
import Login from './Components/login.jsx';
import Signup from './Components/signup.jsx';
import AddProduct from './Components/Add-product';
import Product from './Components/product';
import Ladies from './Components/ladiespage.jsx';
// import Unisex from './Components/unisex.jsx';
import Dashboard from './Components/dashboard.jsx';
import ProtectedRoute from './Components/ProtectedRoute';
import SellerProfile from './Components/SellerProfile';
import CartPage from './Components/cart';
import Documentation from './Components/Documentation.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <HeroSection />
            <Categories />
            <AboutUs />
            <Offers />
            <Footer />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/menwear" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/ladieswear" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/unisex" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/dashboard/:id?" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/product" element={<ProtectedRoute><Ladies /></ProtectedRoute>} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/seller/:id" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/shopping" element={<Ladies />} />
        <Route path="/Documentation" element={<Documentation />} />

      </Routes>
    </>
  );
}

// Main App component that includes the Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
