import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { ProductRecord } from "../types/database";
import type { Product } from "../types/product";
import { normalizePostgrestError } from "../lib/errorUtils";

const mapProduct = (record: ProductRecord): Product => ({
  id: record.id,
  name: record.name,
  description: record.description ?? "",
  price: Number(record.price ?? 0),
  imageUrl: record.image_url ?? "",
  category: record.category ?? null,
  inStock: record.in_stock ?? null,
  rating: record.rating ?? null,
  reviews: record.reviews ?? null,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchProducts = useCallback(async () => {
    console.log("[Products] fetchProducts called, setting loading to true");
    setLoading(true);
    try {
      console.log("[Products] About to call Supabase...");

      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      const timeoutPromise = new Promise<{ data: null; error: any }>(
        (resolve) =>
          setTimeout(() => {
            console.error("[Products] Query timeout after 5 seconds");
            resolve({
              data: null,
              error: { message: "Query timeout", code: "TIMEOUT" },
            });
          }, 5000)
      );

      const { data, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

      console.log("[Products] Supabase call completed", {
        hasData: !!data,
        hasError: !!fetchError,
      });

      if (fetchError) {
        console.error("Products fetch error:", fetchError);
        setError(fetchError);
        setProducts([]);
        return;
      }

      console.log("Products raw data:", data);
      const mapped = (data ?? []).map((record: ProductRecord) =>
        mapProduct(record)
      );
      console.log("Products mapped:", mapped);
      setError(null);
      setProducts(mapped);
    } catch (unknownError) {
      console.error("Failed to fetch products", unknownError);
      setError(normalizePostgrestError(unknownError));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("[Products] useEffect triggered, fetching products...");
    void fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    unique.set("all", "All Products");

    products.forEach((product) => {
      if (product.category) {
        unique.set(product.category.toLowerCase(), product.category);
      }
    });

    return Array.from(unique.entries()).map(([slug, name], index) => ({
      id: `${index}-${slug}`,
      name,
      slug,
    }));
  }, [products]);

  return {
    products,
    categories,
    loading,
    error,
    refresh: fetchProducts,
  };
};

export const useProduct = (productId?: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError);
        setProduct(null);
      } else if (data) {
        setError(null);
        setProduct(mapProduct(data as ProductRecord));
      } else {
        setProduct(null);
      }
    } catch (unknownError) {
      console.error(`Failed to fetch product ${productId}`, unknownError);
      setError(normalizePostgrestError(unknownError));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refresh: fetchProduct,
  };
};
