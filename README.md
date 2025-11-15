# Ecommerce Website

A production-ready ecommerce frontend built with React, TailwindCSS, Supabase, and Stripe. Users can browse products, authenticate with Supabase Auth (email/password or Google), manage a persistent cart, check out with Stripe (test mode), and review their previous orders.

---

## Features

- 🔐 **Authentication** – Supabase email/password and Google sign-in, profile persistence, session handling.
- 🛒 **Persistent Cart** – Cart items are stored in Supabase, synced in real-time per user across sessions.
- 🧾 **Orders Dashboard** – Users can review their order history populated from Stripe webhooks.
- 💳 **Stripe Checkout** – Supabase Edge Function creates checkout sessions; webhook finalises orders and clears carts.
- 🗃️ **Supabase Seed & Schema** – Database schema, RLS policies, and a TypeScript seeding script for initial products.
- ⚡ **Modern UI/UX** – Responsive layout, dark mode, Framer Motion animations, SEO-ready pages.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router, TailwindCSS, Framer Motion
- **State & Data**: Supabase JavaScript client, custom hooks/context
- **Backend**: Supabase Database + Edge Functions (Deno)
- **Payments**: Stripe Checkout (test mode)
- **Tooling**: Vite, ESLint, TSX (for scripts)

---

## Prerequisites

- Node.js **18+**
- npm (ships with Node)
- Supabase account (free tier is sufficient)
- Stripe account (test mode)

---

## Environment Variables

Create a `.env` file (see `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

- `VITE_*` keys are exposed to the Vite client.
- `SUPABASE_SERVICE_ROLE_KEY` is required for the seed script and Edge Functions (never expose in the browser).
- `STRIPE_*` keys come from your Stripe dashboard/webhook configuration.

---

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project**  
   In the Supabase dashboard note the project URL and anon/service keys.

3. **Apply the database schema**  
   In Supabase SQL editor run `supabase/schema.sql`. This will create tables, indices, and RLS policies.

4. **Seed products**
   ```bash
   npm run supabase:seed
   ```
   The script reads from `src/data/products.ts` and inserts rows only if the table is empty.

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy webhook
   ```
   (Requires Supabase CLI configured with your project access token.)

6. **Configure Stripe**
   - Create a Stripe test mode account.
   - Add the webhook endpoint pointing to the Supabase function URL:  
     `https://<project>.supabase.co/functions/v1/webhook`
   - Select the `checkout.session.completed` event.
   - Use the generated signing secret for `STRIPE_WEBHOOK_SECRET`.

7. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` and sign up/log in to test.

> Detailed step-by-step guidance (including CLI commands and screenshots) is available in [`SETUP.md`](./SETUP.md).

---

## Project Structure

```
src/
  components/        UI components (Navbar, ProductCard, etc.)
  context/           Auth and Cart providers
  hooks/             Supabase-backed data hooks
  pages/             Route-level components
  data/              Seed product data
  lib/               Supabase client
  store/             Local UI state (dark mode)
  types/             Shared type definitions
supabase/
  schema.sql         Database schema & RLS policies
  functions/
    create-checkout-session/
    webhook/
scripts/
  seedProducts.ts    Supabase seeding script
```

---

## Available Scripts

- `npm run dev` – Start Vite dev server
- `npm run build` – Type-check and generate production build
- `npm run preview` – Preview production build locally
- `npm run lint` – Run ESLint
- `npm run supabase:seed` – Seed Supabase products (idempotent)
- `npm run setup` – Alias for `supabase:seed`

---

## Testing the Flow

1. Sign up with email/password or Google.
2. Add products to the cart (modal prompts login if anonymous).
3. Checkout triggers the Supabase Edge Function → Stripe checkout page.
4. Complete payment using Stripe test cards (e.g., `4242 4242 4242 4242`).
5. Webhook records the order, clears the cart, and the Orders page lists the purchase.

---

## Troubleshooting

- **Empty product list**: Ensure `npm run supabase:seed` completed and database policies allow public `select` on `products`.
- **Auth errors**: Double-check Supabase URL/keys and redirect URLs configured in the Supabase dashboard.
- **Stripe 401**: Confirm the Edge Function has `STRIPE_SECRET_KEY` set via Supabase function secrets.
- **Webhook 400**: Verify the Stripe endpoint is pointed to the deployed `webhook` function and the secret matches `STRIPE_WEBHOOK_SECRET`.

---

## License

MIT

