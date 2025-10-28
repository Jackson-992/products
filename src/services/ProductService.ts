import { supabase } from "./supabase";
import { Product } from "../types/Product";
import { Review } from "../types/Product";

// Enhanced Product type for details page
export interface ProductDetails extends Product {
    stockCount: number;
    description: string;
    features: string[];
    specifications: string[];
    variations?: ProductVariation[]; // Add variations array
}

// Add interface for product variations
export interface ProductVariation {
    id: number;
    color: string;
    size: string;
    quantity: number;
    price_adjustment?: number;
    sku?: string;
}

// Add interface for the details data structure
interface ProductDetailsData {
    description?: string;
    features?: string[];
    specifications?: string[];
}

// Fetch all products with category, images, review stats, and variations
export const getProducts = async (): Promise<Product[]> => {
    // Get base products with variations
    const { data: products, error } = await supabase
        .from("products")
        .select(`
      id, name, price, is_active, originalprice,
      category,
      product_images,
      reviews ( rating ),
      product_variations ( quantity )
    `);

    if (error) throw error;

    return (products || []).map((p: any) => {
        const images = p.product_images || [];
        const ratings = p.reviews?.map((r: any) => r.rating) || [];
        const avgRating =
            ratings.length > 0
                ? ratings.reduce((a: number, b: number) => a + Number(b), 0) /
                ratings.length
                : 0;

        // Calculate total stock from variations
        const variations = p.product_variations || [];
        const totalStock = variations.reduce((sum: number, variation: any) =>
            sum + (variation.quantity || 0), 0);

        console.log("Fetched product:", p);

        return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalprice ?? null,
            inStock: totalStock > 0 && p.is_active,
            stockCount: totalStock, // Calculated from variations
            category: p.category || "Uncategorized",
            images,
            rating: avgRating,
            reviews: ratings.length,
        } as Product;
    });
};

// Fetch detailed product information including reviews and variations
export const getProductDetails = async (productId: string): Promise<{
    product: ProductDetails | null;
    reviews: Review[];
}> => {
    try {
        // Get product with details and variations
        const { data: productData, error: productError } = await supabase
            .from("products")
            .select(`
        id, name, price, is_active, originalprice,
        category,
        product_images,
        details (
          description,
          features,
          specifications
        ),
        product_variations (
          id, color, size, quantity, price_adjustment, sku
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
        user_profiles (
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

        // Calculate total stock from variations
        const variations: ProductVariation[] = productData.product_variations || [];
        const totalStock = variations.reduce((sum: number, variation: any) =>
            sum + (variation.quantity || 0), 0);

        const product: ProductDetails = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            originalPrice: productData.originalprice ?? undefined,
            inStock: totalStock > 0 && productData.is_active,
            stockCount: totalStock, // Calculated from variations
            category: productData.category || "Uncategorized",
            images,
            rating: Math.round(avgRating * 10) / 10,
            reviews: ratings.length,
            description: details.description || "No description available",
            features: details.features || [],
            specifications: details.specifications || [],
            variations: variations.map((v: any) => ({
                id: v.id,
                color: v.color,
                size: v.size,
                quantity: v.quantity,
                price_adjustment: v.price_adjustment,
                sku: v.sku
            }))
        };

        // Process reviews data
        const reviews: Review[] = (reviewsData || []).map((review: any) => ({
            id: review.id,
            user: review.user_profiles?.name || "Anonymous",
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

// Additional helper functions for variations:

// Get available variations for a product
export const getProductVariations = async (productId: string): Promise<ProductVariation[]> => {
    const { data, error } = await supabase
        .from("product_variations")
        .select("id, color, size, quantity, price_adjustment, sku")
        .eq("product_id", productId)
        .gt("quantity", 0) // Only return variations with stock
        .order("color")
        .order("size");

    if (error) throw error;
    return data || [];
};

// Update variation quantity (for inventory management)
export const updateVariationQuantity = async (
    variationId: number,
    newQuantity: number
): Promise<void> => {
    const { error } = await supabase
        .from("product_variations")
        .update({ quantity: newQuantity })
        .eq("id", variationId);

    if (error) throw error;
};

// Get specific variation by attributes
export const getVariationByAttributes = async (
    productId: string,
    color: string,
    size: string
): Promise<ProductVariation | null> => {
    const { data, error } = await supabase
        .from("product_variations")
        .select("id, color, size, quantity, price_adjustment, sku")
        .eq("product_id", productId)
        .eq("color", color)
        .eq("size", size)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // No rows returned
            return null;
        }
        throw error;
    }
    return data;
};

export const submitReview = async (productId: string, reviewData: {
    rating: number;
    comment: string;
}): Promise<Review> => {
    try {
        // Get current user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // First, get the user's profile to get the user_id (bigint)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, name, auth_id')
            .eq('auth_id', user.id)
            .single();

        if (profileError || !profile) {
            throw new Error('User profile not found. Please complete your profile.');
        }

        // Insert review into Supabase using the profile id (bigint) as user_id
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                'user-id': profile.id, // Use the bigint ID from profiles table as user_id
                product_id: productId,
                rating: reviewData.rating,
                comment: reviewData.comment,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // Get user display name
        const userName = profile.name || user.email?.split('@')[0] || "Current User";

        const newReview: Review = {
            id: data.id.toString(),
            user: userName,
            rating: parseFloat(data.rating),
            comment: data.comment,
            date: new Date(data.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        return newReview;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
};