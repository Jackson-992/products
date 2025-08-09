// product-data.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    stockCount: number;
    description: string;
    features: string[];
    specifications: Record<string, string>;
}

export interface Review {
    id: number;
    user: string;
    rating: number;
    date: string;
    comment: string;
}

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Premium Wireless Bluetooth Headphones',
        price: 790.99,
        originalPrice: 990.99,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop',
        ],
        category: 'Electronics',
        rating: 4.5,
        reviews: 128,
        inStock: true,
        stockCount: 15,
        description: 'Experience premium audio quality with these professional-grade wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and premium materials for all-day comfort.',
        features: [
            'Active Noise Cancellation',
            '30-Hour Battery Life',
            'Premium Leather Cushions',
            'Bluetooth 5.0 Technology',
            'Quick Charge (15min = 3hrs)',
            'Foldable Design',
        ],
        specifications: {
            'Driver Size': '40mm',
            'Frequency Response': '20Hz - 20kHz',
            'Impedance': '32 Ohm',
            'Weight': '250g',
            'Connectivity': 'Bluetooth 5.0, 3.5mm Jack',
            'Battery': '30 hours playback',
        }
    },
    {
        id: '2',
        name: 'Ultra HD 4K Smart TV 55"',
        price: 24999.99,
        originalPrice: 29999.99,
        images: [
            'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=600&h=600&fit=crop',
        ],
        category: 'Electronics',
        rating: 4.7,
        reviews: 342,

        inStock: true,
        stockCount: 8,
        description: 'Immerse yourself in stunning 4K Ultra HD picture quality with this 55-inch smart TV. Featuring HDR10+, Dolby Vision, and built-in Google Assistant for voice control.',
        features: [
            '55-inch 4K Ultra HD Display',
            'HDR10+ and Dolby Vision',
            'Smart TV with Built-in Apps',
            'Google Assistant Voice Control',
            '3 HDMI Ports & 2 USB Ports',
        ],
        specifications: {
            'Screen Size': '55 inch',
            'Resolution': '3840 x 2160 (4K)',
            'Refresh Rate': '120Hz',
            'Smart Platform': 'Google TV',
            'Connectivity': 'Wi-Fi, Bluetooth, Ethernet',
            'Dimensions': '48.5" x 28.1" x 3.9"',
        }
    },
    {
        id: '3',
        name: 'Classic Leather Biker Jacket',
        price: 4990.00,
        originalPrice: 5990.00,
        images: [
            'https://images.unsplash.com/photo-1618354691373-4857cf48b36f?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1593032465174-07e7c3bff03e?w=600&h=600&fit=crop',
        ],
        category: 'Fashion',
        rating: 4.6,
        reviews: 84,
        inStock: true,
        stockCount: 22,
        description: 'Stylish genuine leather biker jacket with a slim fit design and durable zippers. Perfect for both casual and edgy fashion.',
        features: [
            '100% Genuine Leather',
            'Slim Fit Design',
            'Inner Polyester Lining',
            'Durable Zippers & Pockets',
            'Available in Multiple Sizes',
        ],
        specifications: {
            'Material': 'Genuine Leather',
            'Lining': 'Polyester',
            'Fit': 'Slim',
            'Sizes': 'S, M, L, XL',
            'Color': 'Black',
            'Care': 'Dry Clean Only',
        }
    },
    {
        id: '4',
        name: 'Smart Digital Body Weighing Scale',
        price: 1290.00,
        originalPrice: 1890.00,
        images: [
            'https://images.unsplash.com/photo-1606813902784-0f4c25a226a3?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1609132718489-d450c6ba8d9a?w=600&h=600&fit=crop',
        ],
        category: 'Health',
        rating: 4.4,
        reviews: 112,
        inStock: true,
        stockCount: 40,
        description: 'Track your health goals with this smart scale. Measures weight, BMI, fat %, and syncs with mobile apps via Bluetooth.',
        features: [
            'Body Weight & BMI Analysis',
            'Bluetooth App Sync',
            'Tempered Glass Platform',
            'Supports up to 180kg',
            'Auto-On Technology',
        ],
        specifications: {
            'Max Weight': '180kg',
            'Display': 'LED',
            'Connectivity': 'Bluetooth 4.0',
            'Power': '2x AAA Batteries',
            'Dimensions': '28cm x 28cm',
        }
    },
    {
        id: '5',
        name: 'Modern Wooden Study Desk',
        price: 7999.00,
        originalPrice: 9500.00,
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
        ],
        category: 'Furniture',
        rating: 4.8,
        reviews: 67,
        inStock: true,
        stockCount: 10,
        description: 'Elegant study desk crafted from premium wood with a spacious tabletop and two storage drawers. Ideal for home or office.',
        features: [
            'Solid Wood Construction',
            'Spacious Desktop Area',
            '2 Soft-Close Drawers',
            'Smooth Matte Finish',
            'Modern Minimalist Design',
        ],
        specifications: {
            'Material': 'Oak Wood',
            'Dimensions': '120cm x 60cm x 75cm',
            'Color': 'Walnut Brown',
            'Drawers': '2',
            'Weight': '25kg',
            'Assembly': 'Required',
        }
    },
    {
        id: '6',
        name: 'Smartphone Gimbal Stabilizer 3-Axis',
        price: 5999.00,
        originalPrice: 7499.00,
        images: [
            'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1612281189943-616ee8408fd4?w=600&h=600&fit=crop',
        ],
        category: 'Gadgets',
        rating: 4.5,
        reviews: 151,
        inStock: true,
        stockCount: 18,
        description: 'Capture smooth cinematic videos with this 3-axis gimbal. Features gesture control, object tracking, and long battery life.',
        features: [
            '3-Axis Stabilization',
            'Gesture & Object Tracking',
            'Foldable Design',
            'Up to 12 Hour Battery Life',
            'Compatible with iOS & Android',
        ],
        specifications: {
            'Weight': '410g',
            'Battery Life': '12 hours',
            'Charging Time': '2.5 hours',
            'Bluetooth': 'Yes',
            'Compatibility': 'iOS / Android',
            'Modes': 'Pan, Follow, Lock',
        }
    },
    {
        id: '7',
        name: 'Scientific Graphing Calculator FX-991EX',
        price: 3200.00,
        originalPrice: 4200.00,
        images: [
            'https://images.unsplash.com/photo-1616627569687-8f92ed70cb39?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1597858374942-34b5f74e1cc0?w=600&h=600&fit=crop',
        ],
        category: 'Academics',
        rating: 4.9,
        reviews: 194,
        inStock: true,
        stockCount: 50,
        description: 'Advanced scientific calculator for engineering, statistics, and math students. High-resolution display with natural textbook input.',
        features: [
            '552 Functions',
            'Natural Textbook Display',
            'High-Speed Calculation',
            'Spreadsheet Mode',
            'Solar + Battery Power',
        ],
        specifications: {
            'Display': '192x63 pixels',
            'Functions': '552',
            'Power': 'Solar + Battery',
            'Weight': '90g',
            'Color': 'Black',
            'Extras': 'Hard Case Included',
        }
    }
    // Add more products as needed
];

export const mockReviews: Record<string, Review[]> = {
    '1': [
        {
            id: 1,
            user: 'John D.',
            rating: 5,
            date: '2024-01-15',
            comment: 'Excellent sound quality and comfortable for long listening sessions. The noise cancellation works great!',
        },
        {
            id: 2,
            user: 'Sarah M.',
            rating: 4,
            date: '2024-01-10',
            comment: 'Good headphones overall, but the bass could be a bit stronger. Still recommend for the price.',
        }
    ],
    '2': [
        {
            id: 1,
            user: 'Michael T.',
            rating: 5,
            date: '2024-02-01',
            comment: 'The picture quality is absolutely stunning! Best TV I\'ve ever owned.',
        }
    ]
};

export const getProductById = (id: string): Product | undefined => {
    return mockProducts.find(product => product.id === id);
};

export const getReviewsByProductId = (id: string): Review[] => {
    return mockReviews[id] || [];
};