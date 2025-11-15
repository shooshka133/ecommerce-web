export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category?: string | null;
  inStock?: boolean | null;
  rating?: number | null;
  reviews?: number | null;
}

export interface CartLineItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

