export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export interface ProductRecord {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category?: string | null;
  in_stock?: boolean | null;
  rating?: number | null;
  reviews?: number | null;
}

export interface CartItemRecord {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string | null;
  product?: ProductRecord;
}

export interface OrderRecord {
  id: number;
  user_id: string;
  total_amount: number;
  status: string;
  stripe_session_id: string | null;
  created_at: string | null;
}

export interface OrderItemRecord {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  price_each: number;
  created_at: string | null;
}

