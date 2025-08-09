import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://your-api-domain.com/api'
        : 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Product API endpoints
export const productAPI = {
    // Get all products with optional filters
    getProducts: (params?: {
        search?: string;
        category?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    }) => api.get('/products', { params }),

    // Get single product by ID
    getProduct: (id: string) => api.get(`/products/${id}`),

    // Create new product (seller only)
    createProduct: (productData: {
        name: string;
        price: number;
        description: string;
        category: string;
        image: string;
        stock: number;
    }) => api.post('/products', productData),

    // Update product (seller only)
    updateProduct: (id: string, productData: Partial<{
        name: string;
        price: number;
        description: string;
        category: string;
        image: string;
        stock: number;
    }>) => api.put(`/products/${id}`, productData),

    // Delete product (seller only)
    deleteProduct: (id: string) => api.delete(`/products/${id}`),

    // Get seller's products
    getSellerProducts: () => api.get('/products/seller/me'),
};

// User/Auth API endpoints
export const authAPI = {
    // Login
    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),

    // Register
    register: (userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        accountType: 'buyer' | 'seller';
        storeName?: string;
    }) => api.post('/auth/register', userData),

    // Get current user profile
    getProfile: () => api.get('/auth/profile'),

    // Update profile
    updateProfile: (profileData: {
        firstName?: string;
        lastName?: string;
        storeName?: string;
    }) => api.put('/auth/profile', profileData),

    // Logout (if using token blacklisting)
    logout: () => api.post('/auth/logout'),
};

// Order API endpoints
export const orderAPI = {
    // Create new order
    createOrder: (orderData: {
        items: Array<{
            productId: string;
            quantity: number;
            price: number;
        }>;
        shippingAddress: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    }) => api.post('/orders', orderData),

    // Get user's orders
    getOrders: () => api.get('/orders'),

    // Get single order
    getOrder: (id: string) => api.get(`/orders/${id}`),

    // Update order status (seller only)
    updateOrderStatus: (id: string, status: string) =>
        api.put(`/orders/${id}/status`, { status }),
};

// Seller dashboard API endpoints
export const sellerAPI = {
    // Get seller statistics
    getStats: () => api.get('/seller/stats'),

    // Get recent orders
    getRecentOrders: () => api.get('/seller/orders/recent'),

    // Get analytics data
    getAnalytics: (params?: {
        startDate?: string;
        endDate?: string;
        period?: 'day' | 'week' | 'month' | 'year';
    }) => api.get('/seller/analytics', { params }),
};

// Reviews API endpoints
export const reviewAPI = {
    // Get product reviews
    getProductReviews: (productId: string) =>
        api.get(`/reviews/product/${productId}`),

    // Create review
    createReview: (reviewData: {
        productId: string;
        rating: number;
        comment: string;
    }) => api.post('/reviews', reviewData),

    // Update review
    updateReview: (id: string, reviewData: {
        rating?: number;
        comment?: string;
    }) => api.put(`/reviews/${id}`, reviewData),

    // Delete review
    deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

// Utility functions
export const handleAPIError = (error: any) => {
    if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'An error occurred';
        const status = error.response.status;
        console.error(`API Error ${status}: ${message}`);
        return { message, status };
    } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error: No response received');
        return { message: 'Network error. Please check your connection.', status: 0 };
    } else {
        // Something else happened
        console.error('Error:', error.message);
        return { message: error.message, status: -1 };
    }
};

// Export the main api instance
export default api;
