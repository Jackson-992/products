import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import './navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-inner">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <h1 className="navbar-logo-text">254_Connect</h1>
                    </Link>
                    {/*<Link to="/MD">*/}
                    {/*    Master*/}
                    {/*</Link>*/}

                    {/* Search Bar - Desktop */}
                    <div className="navbar-search-desktop">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-input-container">
                                <div>
                                    <Search className="search-icon" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="navbar-desktop-nav">
                        {/*<Link to="/products" className="nav-link">*/}
                        {/*    Products*/}
                        {/*</Link>*/}
                        {/*<Link to="/seller-dashboard" className="nav-link">*/}
                        {/*    Sell*/}
                        {/*</Link>*/}
                        <Button variant="ghost" size="sm" className="icon-button">
                            <Heart className="h-5 w-5" />
                        </Button>
                        <Link to="/cart">
                            <Button variant="ghost" size="sm" className="icon-button">
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="outline" size="sm" className="login-button">
                                <User className="login-icon" />
                                Sign Up
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="sm" className="login-button">
                                <User className="login-icon" />
                                Login
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="navbar-mobile-menu-button">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="navbar-mobile-search">
                    <form onSubmit={handleSearch}>
                        <div className="search-input-container">
                            <Input
                                type="text"
                                placeholder="      Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <Search className="search-icon" />
                        </div>
                    </form>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="navbar-mobile-nav">
                        <div className="navbar-mobile-nav-inner">
                            {/*<Link*/}
                            {/*    to="/products"*/}
                            {/*    className="nav-link"*/}
                            {/*    onClick={() => setIsMenuOpen(false)}*/}
                            {/*>*/}
                            {/*    Products*/}
                            {/*</Link>*/}
                            {/*<Link*/}
                            {/*    to="/seller-dashboard"*/}
                            {/*    className="nav-link"*/}
                            {/*    onClick={() => setIsMenuOpen(false)}*/}
                            {/*>*/}
                            {/*    Sell*/}
                            {/*</Link>*/}
                            <div className="mobile-nav-buttons">
                                <Button variant="ghost" size="sm" className="icon-button">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Link to="/cart">
                                    <Button variant="ghost" size="sm" className="icon-button">
                                        <ShoppingCart className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="outline" size="sm" className="login-button">
                                        <User className="login-icon" />
                                        Sign Up
                                    </Button>
                                </Link>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" size="sm" className="login-button">
                                        <User className="login-icon" />
                                        Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;