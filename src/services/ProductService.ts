import { supabase } from "./supabase";
import { Product } from "../types/Product";
import { Review } from "../types/Product";

// Enhanced Product type for details page
export interface ProductDetails extends Product {
    stockCount: number;
    description: string;
    features: string[];
    specifications: Record<string, string>;
}

// Add interface for the details data structure
interface ProductDetailsData {
    description?: string;
    features?: string[];
    specifications?: Record<string, string>;
}

// Fetch all products with category, images, and review stats
export const getProducts = async (): Promise<Product[]> => {
    // Get base products
    const { data: products, error } = await supabase
        .from("products")
        .select(`
      id, name, price, stock_number, is_active, originalprice,
      category,
      product_images,
      reviews ( rating )
    `);

    if (error) throw error;

    return (products || []).map((p: any) => {
        const images = p.product_images || []; // array
        const ratings = p.reviews?.map((r: any) => r.rating) || [];
        const avgRating =
            ratings.length > 0
                ? ratings.reduce((a: number, b: number) => a + Number(b), 0) /
                ratings.length
                : 0;
        console.log("Fetched product:", p);

        return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalprice ?? null,
            inStock: p.stock_number > 0 && p.is_active,
            category: p.category || "Uncategorized",
            images,
            rating: avgRating,
            reviews: ratings.length,
        } as Product;
    });
};

// Fetch detailed product information including reviews
export const getProductDetails = async (productId: string): Promise<{
    product: ProductDetails | null;
    reviews: Review[];
}> => {
    try {
        // Get product with details - use left join instead of inner join
        const { data: productData, error: productError } = await supabase
            .from("products")
            .select(`
        id, name, price, stock_number, is_active, originalprice,
        category,
        product_images,
        details (
          description,
          features,
          specifications
        )
      `)
            .eq("id", productId)
            .maybeSingle();

        if (productError) {
            console.error("Product fetch error:", productError);
            return { product: null, reviews: [] };
        }

        // If no product found, return early
        if (!productData) {
            return { product: null, reviews: [] };
        }

        // Get reviews with user information
        const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select(`
        id,
        rating,
        comment,
        created_at,
        users (
          name
        )
      `)
            .eq("product_id", productId)
            .order("created_at", { ascending: false });

        if (reviewsError) {
            console.error("Reviews fetch error:", reviewsError);
        }

        // Process product data
        const images = productData.product_images || [];
        const ratings = reviewsData?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + Number(b), 0) / ratings.length
            : 0;

        // Handle null details gracefully with proper typing
        const details: ProductDetailsData = productData.details || {};

        const product: ProductDetails = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            originalPrice: productData.originalprice ?? undefined,
            inStock: productData.stock_number > 0 && productData.is_active,
            stockCount: productData.stock_number,
            category: productData.category || "Uncategorized",
            images,
            rating: Math.round(avgRating * 10) / 10,
            reviews: ratings.length,
            description: details.description || "No description available",
            features: details.features || [],
            specifications: details.specifications || {}
        };

        // Process reviews data
        const reviews: Review[] = (reviewsData || []).map((review: any) => ({
            id: review.id,
            user: review.users?.name || "Anonymous",
            rating: review.rating,
            comment: review.comment || "",
            date: new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
        }));

        return { product, reviews };

    } catch (error) {
        console.error("Error fetching product details:", error);
        return { product: null, reviews: [] };
    }
};

// Alternative function if you want to fetch product and reviews separately
export const getProductById = async (productId: string): Promise<ProductDetails | null> => {
    const { product } = await getProductDetails(productId);
    return product;
};

export const getReviewsByProductId = async (productId: string): Promise<Review[]> => {
    const { reviews } = await getProductDetails(productId);
    return reviews;
};