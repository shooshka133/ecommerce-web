import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SEO } from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, loading } = useCart();
  const { user, session, profile, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user || !session) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            cartItems: items.map((item) => ({
              cartItemId: item.id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error('Stripe session URL was not returned.');
      }
    } catch (error) {
      console.error('Stripe checkout error', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Checkout failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Checkout" description="Complete your purchase" />
        <p className="text-text-secondary">Preparing checkout...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Checkout" description="Complete your purchase" />
        <h1 className="mb-4 text-3xl font-bold">Please log in to continue</h1>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Checkout" description="Complete your purchase" />
        <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <SEO
        title="Checkout"
        description="Complete your purchase and place your order"
      />
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Checkout Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Review Your Order
              </h2>
              <p className="text-sm text-text-secondary">
                You will be redirected to Stripe Checkout to securely complete your payment.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                After payment, you will be returned to the store automatically and your order will appear in the orders page.
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Contact Information
              </h2>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Email: {profile?.email ?? user.email}</p>
                {(profile?.name ||
                  (user.user_metadata?.full_name as string | undefined) ||
                  (user.user_metadata?.name as string | undefined)) && (
                  <p>
                    Name:{' '}
                    {profile?.name ??
                      (user.user_metadata?.full_name as string | undefined) ??
                      (user.user_metadata?.name as string | undefined)}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="mb-4 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-2 border-t border-border pt-2 dark:border-gray-700">
                  <div className="mb-2 flex justify-between">
                    <span className="text-text-secondary">Subtotal:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-text-secondary">Shipping:</span>
                    <span>$10.00</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-xl font-bold dark:border-gray-700">
                    <span>Total:</span>
                    <span className="text-primary">
                      ${(totalPrice + 10).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {errorMessage && (
                <div className="mb-4 rounded border border-error bg-red-50 p-3 text-sm text-error dark:border-red-400 dark:bg-red-900/20">
                  {errorMessage}
                </div>
              )}
              <Button
                type="button"
                variant="primary"
                fullWidth
                size="lg"
                disabled={submitting}
                onClick={() => void handleCheckout()}
              >
                {submitting ? 'Redirecting...' : 'Pay with Stripe'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

