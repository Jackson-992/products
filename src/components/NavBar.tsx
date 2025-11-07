import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, LogOut, Package, Phone, Zap, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAffiliateStatus } from '@/hooks/checkAffiliateStatus.ts'; // Adjust path to your hook
import './navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Use custom hook to check affiliate status
    const { isAffiliate, loading: affiliateLoading } = useAffiliateStatus();

    const announcements = [
        { text: "🎉 Free Shipping on Orders Over KSh 5,000!", link: "/products" },
        { text: "⚡ Flash Sale: Up to 50% Off Selected Items", link: "/products" },
        { text: "🎁 New Arrivals Just Dropped - Shop Now!", link: "/products" },
    ];

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Rotate announcements
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await handleSignOut();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getUserInitials = () => {
        if (!user?.user_metadata?.first_name && !user?.user_metadata?.last_name) {
            return user?.email?.charAt(0).toUpperCase() || 'U';
        }
        return `${user.user_metadata.first_name?.charAt(0)}${user.user_metadata.last_name?.charAt(0)}`.toUpperCase();
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
    };

    if (loading) {
        return (
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-inner">
                        <Link to="/" className="navbar-logo">
                            <h1 className="navbar-logo-text">254_Connect</h1>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-inner">
                        {/* Logo */}
                        <Link to="/" className="navbar-logo">
                            <h1 className="navbar-logo-text">254_Connect</h1>
                        </Link>

                        {/* Announcement Banner - Desktop */}
                        <div className="announcement-banner-desktop">
                            <Link to={announcements[currentAnnouncementIndex].link} className="announcement-link">
                                <Zap className="announcement-icon" />
                                <span className="announcement-text">
                                    {announcements[currentAnnouncementIndex].text}
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="navbar-desktop-nav">
                            {user ? (
                                <>
                                    <Link to="/products">
                                        <button className="icon-button">
                                            <ChevronLeft className="icon" />
                                        </button>
                                    </Link>
                                    <Link to="/wishlist">
                                        <button className="icon-button">
                                            <Heart className="icon" />
                                        </button>
                                    </Link>
                                    <Link to="/cart">
                                        <button className="icon-button">
                                            <ShoppingCart className="icon" />
                                        </button>
                                    </Link>
                                    <div className="dropdown">
                                        <button className="avatar-button">
                                            <div className="avatar">
                                                {user.user_metadata?.avatar_url ? (
                                                    <img src={user.user_metadata.avatar_url} alt={user.email} className="avatar-image" />
                                                ) : (
                                                    <span className="avatar-fallback">{getUserInitials()}</span>
                                                )}
                                            </div>
                                        </button>
                                        <div className="dropdown-content">
                                            <div className="dropdown-header">
                                                <p className="dropdown-user-name">
                                                    {user.user_metadata?.first_name && user.user_metadata?.last_name
                                                        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                                        : user.email
                                                    }
                                                </p>
                                                <p className="dropdown-user-email">{user.email}</p>
                                            </div>
                                            <div className="dropdown-separator"></div>
                                            <Link to="/cart" className="dropdown-item">Shopping Cart</Link>
                                            <Link to="/wishlist" className="dropdown-item">Wishlist</Link>
                                            <Link to="/orders" className="dropdown-item">Orders</Link>
                                            {/* Show Dashboard link only if user is affiliate */}
                                            {isAffiliate && (
                                                <Link to="/seller-dashboard" className="dropdown-item">DashBoard</Link>
                                            )}
                                            <Link to="/contact_us" className="dropdown-item">Contact Us</Link>
                                            <div className="dropdown-separator"></div>
                                            <button onClick={handleSignOut} className="dropdown-item logout-item">
                                                <LogOut className="dropdown-icon" />
                                                <span>Log out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/signup">
                                        <button className="auth-button">
                                            <User className="auth-icon" />
                                            Sign Up
                                        </button>
                                    </Link>
                                    <Link to="/login">
                                        <button className="auth-button">
                                            <User className="auth-icon" />
                                            Login
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="navbar-mobile-menu-button">
                            <button
                                className="mobile-menu-toggle"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
                            </button>
                        </div>
                    </div>

                    {/* Announcement Banner - Mobile */}
                    <div className="announcement-banner-mobile">
                        <Link to={announcements[currentAnnouncementIndex].link} className="announcement-link">
                            <Zap className="announcement-icon" />
                            <span className="announcement-text">
                                {announcements[currentAnnouncementIndex].text}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`mobile-sidebar ${isMenuOpen ? 'mobile-sidebar-open' : ''}`}>
                <div className="mobile-sidebar-content">
                    {/* Sidebar Header */}
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">254_Connect</h2>
                        <button
                            className="sidebar-close-btn"
                            onClick={closeMobileMenu}
                        >
                            <X className="close-icon" />
                        </button>
                    </div>

                    {/* User Section */}
                    {user && (
                        <div className="sidebar-user-section">
                            <div className="sidebar-user-info">
                                <div className="avatar avatar-large">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt={user.email} className="avatar-image" />
                                    ) : (
                                        <span className="avatar-fallback">{getUserInitials()}</span>
                                    )}
                                </div>
                                <div className="user-details">
                                    <p className="user-name">
                                        {user.user_metadata?.first_name && user.user_metadata?.last_name
                                            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                            : user.email
                                        }
                                    </p>
                                    <p className="user-email">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="sidebar-menu">
                        <div className="menu-list">
                            {user ? (
                                <>
                                    <Link to="/cart" onClick={closeMobileMenu} className="menu-item">
                                        <ShoppingCart className="menu-item-icon" />
                                        Shopping Cart
                                    </Link>

                                    <Link to="/wishlist" onClick={closeMobileMenu} className="menu-item">
                                        <Heart className="menu-item-icon" />
                                        Wishlist
                                    </Link>

                                    <div className="menu-divider"></div>

                                    <Link to="/orders" onClick={closeMobileMenu} className="menu-item">
                                        <Package className="menu-item-icon" />
                                        Orders
                                    </Link>

                                    {/* Show Dashboard link only if user is affiliate */}
                                    {isAffiliate && (
                                        <Link to="/seller-dashboard" onClick={closeMobileMenu} className="menu-item">
                                            <LayoutDashboard className="menu-item-icon" />
                                            Dashboard
                                        </Link>
                                    )}

                                    <Link to="/products" onClick={closeMobileMenu} className="menu-item">
                                        <ChevronLeft className="menu-item-icon" />
                                        Back to Products
                                    </Link>

                                    <Link to="/contact_us" onClick={closeMobileMenu} className="menu-item">
                                        <Phone className="menu-item-icon" />
                                        Contact Us
                                    </Link>

                                    <div className="menu-divider"></div>

                                    <button
                                        className="menu-item logout-menu-item"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="menu-item-icon" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="auth-menu-items">
                                    <Link to="/signup" onClick={closeMobileMenu}>
                                        <button className="auth-menu-button signup-button">
                                            <User className="auth-menu-icon" />
                                            Sign Up
                                        </button>
                                    </Link>
                                    <Link to="/login" onClick={closeMobileMenu}>
                                        <button className="auth-menu-button login-button">
                                            <User className="auth-menu-icon" />
                                            Login
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;