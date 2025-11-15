export interface SeedProduct {
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
}

// Using placeholder images from Unsplash
export const seedProducts: SeedProduct[] = [
  {
    name: 'Classic White T-Shirt',
    price: 29.99,
    category: 'Clothing',
    description:
      'Premium quality cotton t-shirt with a classic fit. Perfect for everyday wear.',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.5,
    reviews: 120,
  },
  {
    name: 'Wireless Headphones',
    price: 149.99,
    category: 'Electronics',
    description:
      'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.8,
    reviews: 89,
  },
  {
    name: 'Leather Backpack',
    price: 199.99,
    category: 'Accessories',
    description:
      'Handcrafted genuine leather backpack with multiple compartments and laptop sleeve.',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.7,
    reviews: 56,
  },
  {
    name: 'Smart Watch',
    price: 299.99,
    category: 'Electronics',
    description:
      'Feature-packed smartwatch with fitness tracking, heart rate monitor, and GPS.',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.6,
    reviews: 234,
  },
  {
    name: 'Running Shoes',
    price: 129.99,
    category: 'Footwear',
    description:
      'Lightweight running shoes with superior cushioning and breathable mesh upper.',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.9,
    reviews: 345,
  },
  {
    name: 'Designer Sunglasses',
    price: 159.99,
    category: 'Accessories',
    description:
      'Stylish designer sunglasses with UV protection and polarized lenses.',
    imageUrl:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.4,
    reviews: 78,
  },
  {
    name: 'Cotton Hoodie',
    price: 79.99,
    category: 'Clothing',
    description:
      'Comfortable cotton hoodie with drawstring hood and kangaroo pocket.',
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.5,
    reviews: 167,
  },
  {
    name: 'Bluetooth Speaker',
    price: 89.99,
    category: 'Electronics',
    description:
      'Portable Bluetooth speaker with 360-degree sound and waterproof design.',
    imageUrl:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.7,
    reviews: 203,
  },
  {
    name: 'Denim Jeans',
    price: 89.99,
    category: 'Clothing',
    description:
      'Classic fit denim jeans made from premium denim with a comfortable stretch.',
    imageUrl:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.6,
    reviews: 189,
  },
  {
    name: 'Leather Wallet',
    price: 49.99,
    category: 'Accessories',
    description:
      'Slim genuine leather wallet with RFID blocking technology and multiple card slots.',
    imageUrl:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.8,
    reviews: 112,
  },
  {
    name: 'Casual Sneakers',
    price: 99.99,
    category: 'Footwear',
    description:
      'Versatile casual sneakers perfect for everyday wear with comfortable cushioning.',
    imageUrl:
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.5,
    reviews: 256,
  },
  {
    name: 'Laptop Stand',
    price: 69.99,
    category: 'Electronics',
    description:
      'Ergonomic aluminum laptop stand with adjustable height and ventilation slots.',
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    inStock: true,
    rating: 4.7,
    reviews: 94,
  },
];

export const categories = [
  { id: '1', name: 'All Products', slug: 'all' },
  { id: '2', name: 'Electronics', slug: 'electronics' },
  { id: '3', name: 'Clothing', slug: 'clothing' },
  { id: '4', name: 'Footwear', slug: 'footwear' },
  { id: '5', name: 'Accessories', slug: 'accessories' },
];
