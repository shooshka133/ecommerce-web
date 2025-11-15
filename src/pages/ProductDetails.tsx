import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);
  const { product, loading, error } = useProduct(Number.isNaN(numericId) ? undefined : numericId);
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Loading..." description="Loading product details" />
        <p className="text-text-secondary">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Product Not Found" description="The product you are looking for does not exist" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Product Not Found</h1>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const isInStock = product.inStock !== false;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      console.error('Unable to add to cart', err);
    }
  };

  return (
    <div className="container-custom py-8">
      <SEO
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category ?? 'product'}, ${product.description}`}
      />
      <Link to="/shop" className="mb-4 inline-block text-primary hover:underline">
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-auto w-full rounded-lg"
            />
          </Card>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>
          <p className="mb-4 text-3xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
          <p className="mb-4 text-text-secondary">{product.description}</p>

          {product.rating && (
            <div className="mb-4 flex items-center space-x-2">
              <span className="text-xl text-yellow-500">⭐</span>
              <span className="text-lg">
                {product.rating} ({product.reviews ?? 0} reviews)
              </span>
            </div>
          )}

          {product.category && (
            <div className="mb-4">
              <span className="text-sm text-text-secondary">Category: </span>
              <span className="font-semibold">{product.category}</span>
            </div>
          )}

          <div className="mb-6">
            <span className="text-sm text-text-secondary">Availability: </span>
            {isInStock ? (
              <span className="font-semibold text-success">In Stock</span>
            ) : (
              <span className="font-semibold text-error">Out of Stock</span>
            )}
          </div>

          <div className="mt-auto flex gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="flex-1"
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/cart')}>
              View Cart
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

