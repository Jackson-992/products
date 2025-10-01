import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import SellerDashboard from "./pages/SellerDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import CartPage from "@/pages/UserProfile/CartPage.tsx";
import MasterDashboard from "@/components/admin/MasterDashBoard.tsx";
import AuthCallback from "@/pages/AuthCallBack.tsx";
import ResetPassword from "@/pages/ResetPassword.tsx";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import WishList  from "@/pages/UserProfile/WishList.tsx";
import Orders from "@/pages/UserProfile/Orders.tsx";
import ContactUs from "@/pages/UserProfile/ContactUs.tsx"

const queryClient = new QueryClient();

// Main layout with navbar and footer
const MainLayout = () => (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
            <Outlet /> {/* This renders the child routes */}
        </main>
        <Footer />
    </div>
);

// Minimal layout without navbar and footer
const MinimalLayout = () => (
    <div className="min-h-screen">
        <Outlet /> {/* This renders the child routes */}
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    {/* Routes with main layout (navbar + footer) */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home product={undefined} />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/seller-dashboard" element={<SellerDashboard />} />
                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <CartPage />
                            </ProtectedRoute>} />
                        <Route path="/wishlist" element={
                            <ProtectedRoute>
                                <WishList />
                            </ProtectedRoute>} />
                        <Route path="/orders" element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>} />
                        <Route path="/contact_us" element={
                            <ProtectedRoute>
                                <ContactUs/>
                            </ProtectedRoute>} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                    </Route>

                    {/* Routes with minimal layout (no navbar/footer) */}
                    <Route element={<MinimalLayout />}>
                        <Route path="/MD" element={
                            <ProtectedRoute>
                                <MasterDashboard/>
                                </ProtectedRoute>
                        } />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;