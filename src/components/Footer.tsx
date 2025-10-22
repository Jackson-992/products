import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Company Info */}
                    <div className="footer-company">
                        <h3 className="footer-title">254_Connect</h3>
                        <p className="footer-description">
                            Your trusted marketplace for quality products. Connecting buyers and sellers
                            in a seamless e-commerce experience.
                        </p>
                        <div className="footer-contact">
                            <div className="contact-item">
                                <Mail className="icon" />
                                <span>contact@254Connect.com</span>
                            </div>
                            <div className="contact-item">
                                <Phone className="icon" />
                                <span>+254-798-922-827</span>
                            </div>
                            <div className="contact-item">
                                <MapPin className="icon" />
                                <span>Kilimani, Nairobi City, BC 1245</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4 className="footer-subtitle">Quick Links</h4>
                        <ul className="links-list">
                            <li><a href="/products">Browse Products</a></li>
                            <li><a href="/join">Become an Affiliate Seller</a></li>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">Returns</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="footer-links">
                        <h4 className="footer-subtitle">Legal</h4>
                        <ul className="links-list">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><a href="#">Refund Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">© 2025 254Connect. All rights reserved.</p>
                    <div className="made-with">
                        <span>Made with</span>
                        <Heart className="heart-icon" />
                        <span>for commerce</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;