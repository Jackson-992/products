export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
    category: string;
    images: string[];
    description?: string;
    rating: number;
    reviews: number;
    stockCount: number;
    features:string[];
    specifications: string[];
}

export interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}
