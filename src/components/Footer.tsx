import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">254_Connect</h3>
                        <p className="text-gray-300 mb-4 max-w-md">
                            Your trusted marketplace for quality products. Connecting buyers and sellers
                            in a seamless e-commerce experience.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center text-gray-300">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>contact@254Connect.com</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>+254-798-922-827</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>Kilimani, Nairobi City, BC 1245</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/products" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Browse Products
                                </a>
                            </li>
                            <li>
                                <a href="/seller-dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Become an Affiliate Seller
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Shipping Info
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Returns
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Cookie Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                                    Refund Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-300 text-sm">
                        © 2025 254Connect. All rights reserved.
                    </p>
                    <div className="flex items-center mt-4 md:mt-0">
                        <span className="text-gray-300 text-sm mr-2">Made with</span>
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-gray-300 text-sm ml-2">for commerce</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
