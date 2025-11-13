import { useEffect, useState } from "react";
import { getProducts } from "../services/CommonServices/ProductService.ts";
import { Product } from "../types/Product";

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (e) {
                console.error("Error loading products:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { products, loading };
};
