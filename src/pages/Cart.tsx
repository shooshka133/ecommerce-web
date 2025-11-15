import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, loading } =
    useCart();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Cart" description="View your shopping cart and proceed to checkout" />
        <p className="text-text-secondary">Loading your cart...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Cart" description="View your shopping cart and proceed to checkout" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Please log in to view your cart
        </h1>
        <Link to="/login">
          <Button variant="primary" size="lg">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Cart" description="View your shopping cart and proceed to checkout" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Your Cart is Empty
        </h1>
        <p className="mb-6 text-text-secondary">
          Add some products to get started!
        </p>
        <Link to="/shop">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <SEO
        title="Cart"
        description="View your shopping cart and proceed to checkout"
      />
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-24 w-full rounded object-cover sm:w-24"
                    />
                    <div className="flex-grow">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="mb-2 text-sm text-text-secondary">
                        ${item.product.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void updateQuantity(item.id, item.quantity - 1).catch(
                                (err) => console.error('Failed to update cart item', err)
                              )
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void updateQuantity(item.id, item.quantity + 1).catch(
                                (err) => console.error('Failed to update cart item', err)
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-bold text-primary">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void removeItem(item.id).catch((err) =>
                          console.error('Failed to remove cart item', err)
                        )
                      }
                      className="text-error hover:text-error"
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            variant="outline"
            onClick={() =>
              void clearCart().catch((err) =>
                console.error('Failed to clear cart', err)
              )
            }
            className="w-full sm:w-auto"
          >
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal:</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping:</span>
                  <span className="font-semibold">$10.00</span>
                </div>
                <div className="mt-2 border-t border-border pt-2 dark:border-gray-700">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      ${(totalPrice + 10).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Link to="/checkout">
                <Button variant="primary" fullWidth size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/shop" className="mt-4 block">
                <Button variant="outline" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

