import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    Heart,
    LogOut,
    History,
    HistoryIcon,
    CreditCard,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/services/supabase';
import './navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

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

                            {user ? (
                                <>
                                    <Link to="wishlist">
                                        <Button variant="ghost" size="sm" className="icon-button">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link to="/cart">
                                        <Button variant="ghost" size="sm" className="icon-button">
                                            <ShoppingCart className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                                                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {user.user_metadata?.first_name && user.user_metadata?.last_name
                                                            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                                            : user.email
                                                        }
                                                    </p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {/*<DropdownMenuItem asChild>*/}
                                            {/*    <Link to="/profile">Profile</Link>*/}
                                            {/*</DropdownMenuItem>*/}
                                            <DropdownMenuItem asChild>
                                                <Link to="/cart">Shopping Cart</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/wishlist">Wishlist</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/orders">Orders</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/history">History</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Log out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                </>
                            ) : (
                                <>
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
                                </>
                            )}
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
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 left-0 w-60 bg-white shadow-xl z-50 transform transition-transform duration-300 rounded-r-lg ${
                isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col min-h-0">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold text-blue-600">254_Connect</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeMobileMenu}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* User Section */}
                    {user && (
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">
                                        {user.user_metadata?.first_name && user.user_metadata?.last_name
                                            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                            : user.email
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="p-4 pb-6">
                        <div className="space-y-1">
                            {user ? (
                                <>
                                    {/* Action Buttons - Only show when logged in */}
                                    <Link to="/cart" onClick={closeMobileMenu}>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-10">
                                            <ShoppingCart className="mr-3 h-4 w-4" />
                                            Shopping Cart
                                        </Button>
                                    </Link>

                                    <Link to="/wishlist" onClick={closeMobileMenu}>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-10">
                                            <Heart className="mr-3 h-4 w-4" />
                                            Wishlist
                                        </Button>
                                    </Link>

                                    <div className="border-t pt-2 mt-2">
                                        <Link to="/orders" onClick={closeMobileMenu}>
                                            <Button variant="ghost" size="sm" className="w-full justify-start h-10">
                                                <Package className="mr-3 h-4 w-4" />
                                                Orders
                                            </Button>
                                        </Link>

                                        <Link to="/history" onClick={closeMobileMenu}>
                                            <Button variant="ghost" size="sm" className="w-full justify-start h-10">
                                                <CreditCard className="mr-3 h-4 w-4" />
                                                History
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="border-t pt-2 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <Link to="/signup" onClick={closeMobileMenu}>
                                        <Button variant="outline" size="sm" className="w-full h-10 mb-3">
                                            <User className="mr-2 h-4 w-4" />
                                            Sign Up
                                        </Button>
                                    </Link>
                                    <Link to="/login" onClick={closeMobileMenu}>
                                        <Button variant="default" size="sm" className="w-full h-10">
                                            <User className="mr-2 h-4 w-4" />
                                            Login
                                        </Button>
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