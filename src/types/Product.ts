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
}

export interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}
