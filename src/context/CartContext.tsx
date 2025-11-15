/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { normalizePostgrestError } from "../lib/errorUtils";
import { useAuth } from "./AuthContext";
import type { CartItemRecord, ProductRecord } from "../types/database";
import type { CartLineItem, Product } from "../types/product";

interface CartContextValue {
  items: CartLineItem[];
  loading: boolean;
  error: PostgrestError | null;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartQueryResult = CartItemRecord & {
  product?: ProductRecord | null;
};

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

const mapCartItem = (record: CartQueryResult): CartLineItem | null => {
  if (!record.product) {
    return null;
  }
  return {
    id: record.id,
    productId: record.product_id,
    quantity: record.quantity,
    product: mapProduct(record.product as ProductRecord),
  };
};

export const CartProvider = ({ children }: PropsWithChildren) => {
  const { user, openAuthModal, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchCart = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      if (!user) {
        setItems([]);
        setError(null);
        if (showLoader) {
          setLoading(false);
        }
        return;
      }

      try {
        console.log("[Cart] About to call Supabase for cart items...");
        const { data, error: fetchError } = await supabase
          .from("cart_items")
          .select(
            "id, quantity, product_id, user_id, product:products ( id, name, description, price, image_url, category, in_stock, rating, reviews )"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        console.log("[Cart] Supabase call completed");

        if (fetchError) {
          console.error("Cart fetch error:", fetchError);
          setError(fetchError);
        } else {
          setError(null);
        }

        console.log("Cart raw data:", data);
        const normalized =
          (data as CartQueryResult[] | null)
            ?.map((record) => mapCartItem(record))
            .filter((value): value is CartLineItem => Boolean(value)) ?? [];
        console.log("Cart normalized items:", normalized);

        setItems(normalized);
      } catch (unknownError) {
        console.error("Failed to fetch cart", unknownError);
        setError(normalizePostgrestError(unknownError));
        setItems([]);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    // Wait for auth to finish loading before attempting to fetch cart
    if (authLoading) {
      console.log("[Cart] Waiting for auth to finish loading...");
      return;
    }

    console.log(
      "[Cart] Auth loaded, fetching cart for user:",
      user?.id || "none"
    );
    void fetchCart(true);

    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`cart-items-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await fetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCart, authLoading]);

  const requireAuth = useCallback((): boolean => {
    if (!user) {
      openAuthModal("Please log in to manage your cart.");
      return false;
    }
    return true;
  }, [user, openAuthModal]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!requireAuth()) {
        return;
      }

      const existingItem = items.find((item) => item.productId === productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)
          .eq("user_id", user!.id);

        if (updateError) {
          setError(updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user!.id,
            product_id: productId,
            quantity,
          });

        if (insertError) {
          setError(insertError);
          throw insertError;
        }
      }
      setError(null);
      await fetchCart();
    },
    [requireAuth, items, user, fetchCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      if (!requireAuth()) {
        return;
      }

      if (quantity <= 0) {
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId)
          .eq("user_id", user!.id);

        if (deleteError) {
          setError(deleteError);
          throw deleteError;
        }
      } else {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", cartItemId)
          .eq("user_id", user!.id);

        if (updateError) {
          setError(updateError);
          throw updateError;
        }
      }
      setError(null);
      await fetchCart();
    },
    [requireAuth, user, fetchCart]
  );

  const removeItem = useCallback(
    async (cartItemId: number) => {
      if (!requireAuth()) {
        return;
      }
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
        .eq("user_id", user!.id);

      if (deleteError) {
        setError(deleteError);
        throw deleteError;
      }

      setError(null);
      await fetchCart();
    },
    [requireAuth, user, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (!requireAuth()) {
      return;
    }
    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user!.id);

    if (clearError) {
      setError(clearError);
      throw clearError;
    }
    setError(null);
    await fetchCart();
  }, [requireAuth, user, fetchCart]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      items,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refresh: () => fetchCart(true),
      totalItems,
      totalPrice,
    };
  }, [
    items,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  ]);

  // MAKE SURE THIS RETURN STATEMENT EXISTS AND RETURNS JSX
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
