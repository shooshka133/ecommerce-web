import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { OrderItemRecord, OrderRecord } from '../types/database';

interface OrderWithItems extends OrderRecord {
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export const Orders = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [fetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        return;
      }

      setFetching(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items ( product_name, quantity, price_each )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setOrders([]);
      } else {
        setOrders(
          (data ?? []).map((order) => {
            const orderItems = (order.order_items ?? []) as OrderItemRecord[];
            return {
              ...(order as OrderRecord),
              items:
                orderItems.map((item) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  price: Number(item.price_each ?? 0),
                })) ?? [],
            };
          })
        );
      }

      setFetching(false);
    };

    void fetchOrders();
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Orders" description="View your past orders" />
        <p className="text-text-secondary">Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Orders" description="View your past orders" />
        <h1 className="mb-4 text-3xl font-bold">Please log in to view orders</h1>
        <Link to="/login">
          <Button variant="primary">Login</Button>
        </Link>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Orders" description="View your past orders" />
        <h1 className="mb-4 text-3xl font-bold text-error">Unable to load orders</h1>
        <p className="text-text-secondary">{errorMessage}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <SEO title="Orders" description="View your past orders" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          No orders yet
        </h1>
        <p className="mb-6 text-text-secondary">
          Once you complete a purchase, your orders will appear here.
        </p>
        <Link to="/shop">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <SEO title="Orders" description="View your past orders" />
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        Your Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="p-6">
              <div className="flex flex-col gap-4 justify-between border-b border-border pb-4 dark:border-gray-700 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Order #{order.id}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Placed on {new Date(order.created_at ?? '').toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {order.status}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${Number(order.total_amount ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Item details unavailable for this order.
                  </p>
                ) : (
                  order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex justify-between text-sm text-text-secondary"
                    >
                      <span>
                        {item.product_name} x{item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              {order.stripe_session_id && (
                <p className="mt-4 text-xs text-text-secondary">
                  Stripe Session ID: {order.stripe_session_id}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

