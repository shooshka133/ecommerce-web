import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const siteUrl = Deno.env.get("SITE_URL");

if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing environment variables");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function serve(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { userId, cartItems } = await req.json();

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId required" }), {
      status: 400,
    });
  }

  // Fetch user email
  const { data: userData } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!userData?.email) {
    return new Response(JSON.stringify({ error: "User email not found" }), {
      status: 400,
    });
  }

  // Create Stripe line items
  const lineItems = cartItems.map((item: any) => ({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(item.unit_price * 100),
      product_data: { name: item.name },
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userData.email,
    line_items: lineItems,
    success_url: `${siteUrl}/checkout?status=success`,
    cancel_url: `${siteUrl}/checkout?status=cancelled`,
  });

  return new Response(JSON.stringify({ url: session.url, id: session.id }), {
    headers: { "Content-Type": "application/json" },
  });
}
