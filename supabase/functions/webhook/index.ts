import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno&deno-std=0.192.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7?target=deno&deno-std=0.192.0';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !webhookSecret) {
  throw new Error('Missing Stripe environment variables.');
}

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service environment variables.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.warn('Session completed without user metadata.');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingOrder = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingOrder.error) {
      console.error('Failed to check existing order', existingOrder.error);
      return new Response('Database error', { status: 500 });
    }

    if (existingOrder.data) {
      console.info('Order already recorded for session', session.id);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const amountTotal = session.amount_total ?? 0;
    const status = session.payment_status === 'paid' ? 'paid' : session.status ?? 'pending';

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: amountTotal / 100,
        status,
        stripe_session_id: session.id,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Failed to create order', orderError);
      return new Response('Failed to create order', { status: 500 });
    }

    let cartItemsMetadata: Array<{
      cart_item_id: number;
      product_id: number;
      quantity: number;
      unit_amount: number;
    }> = [];

    if (session.metadata?.cart_items) {
      try {
        cartItemsMetadata = JSON.parse(session.metadata.cart_items);
      } catch (error) {
        console.warn('Failed to parse cart items metadata', error);
      }
    }

    const productIds = cartItemsMetadata.map((item) => item.product_id);
    let productsById = new Map<number, { name: string; price: number }>();

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .in('id', productIds);

      if (productsError) {
        console.error('Failed to fetch products for order items', productsError);
      } else {
        productsById = new Map(
          (products ?? []).map((product) => [
            product.id,
            { name: product.name, price: Number(product.price ?? 0) },
          ])
        );
      }
    }

    const orderItemsPayload = cartItemsMetadata.map((item) => {
      const product = productsById.get(item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product?.name ?? 'Product',
        quantity: item.quantity,
        price_each: product?.price ?? item.unit_amount ?? 0,
      };
    });

    if (orderItemsPayload.length > 0) {
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (orderItemsError) {
        console.error('Failed to insert order items', orderItemsError);
      }
    }

    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (clearError) {
      console.error('Failed to clear cart after payment', clearError);
    }

    console.info('Order processed successfully', order.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

