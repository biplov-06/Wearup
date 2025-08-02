import React from 'react';
import Img1 from "../assets/fb.svg";
import Img2 from "../assets/ig.svg";
import Img4 from "../assets/yt.svg";
import '../App.css';
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-columns">
                <div className="footer-column">
                    <h3>About Us</h3>
                    <ul>
                        <li><a href="#">News</a></li>
                        <li><a href="#">Official Store</a></li>
                        <li><a href="#">Company</a></li>
                        <li><a href="#">Careers</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Get Help</h3>
                    <ul>
                        <li><a href="# ">FAQ</a></li>
                        <li><a href="#">Shipping</a></li>
                        <li><a href="#">Payment</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/biplov11"><img src={Img1} alt="Facebook" /></a>
                        <a href="https://www.instagram.com/biplov___/"><img src={Img2} alt="Instagram" /></a>
                        <a href="https://www.linkedin.com/in/bip-lov-b7140928a/"><img src="https://img.freepik.com/premium-vector/linkedin-logo-icon_1273375-1174.jpg?semt=ais_hybrid&w=740&q=80" alt="LinkedIn" /></a>
                        <a href="https://github.com/biplov-06"><img src="https://cdn-1.webcatalog.io/catalog/github/github-icon-filled-256.png?v=1756687729671" alt="GitHub" /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2025 . All Rights Reserved.</p>
                <div className="footer-links">
                    <a href="#">Guide</a>
                    <a href="#">Terms & Conditions</a>
                    <a href="#">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
