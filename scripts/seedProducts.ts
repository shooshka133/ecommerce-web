import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { seedProducts } from '../src/data/products';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required to seed products.');
}

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to seed products.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  console.info('Checking for existing products...');
  const { data: existing, error: existingError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (existing && existing.length > 0) {
    console.info('Products already exist. Skipping seed.');
    return;
  }

  console.info(`Seeding ${seedProducts.length} products...`);

  const { error: insertError } = await supabase.from('products').insert(
    seedProducts.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.imageUrl,
      category: product.category,
      in_stock: product.inStock,
      rating: product.rating ?? null,
      reviews: product.reviews ?? null,
    }))
  );

  if (insertError) {
    throw insertError;
  }

  console.info('Products seeded successfully.');
}

void main().catch((error) => {
  console.error('Failed to seed products:', error);
  process.exit(1);
});

