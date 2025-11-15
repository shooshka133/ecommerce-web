import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../types/product';
import { Card } from './Card';
import { Button } from './Button';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const isInStock = product.inStock !== false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Unable to add to cart', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card hover className="flex h-full flex-col">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-64 w-full object-cover transition-transform duration-300 hover:scale-110"
            />
            {!isInStock && (
              <div className="absolute right-2 top-2 rounded bg-error px-2 py-1 text-sm font-bold text-white">
                Out of Stock
              </div>
            )}
          </div>
          <div className="flex flex-grow flex-col p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <p className="text-text-secondary mb-3 flex-grow text-sm line-clamp-2">
              {product.description}
            </p>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.rating && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-text-secondary">
                    {product.rating} ({product.reviews ?? 0})
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

