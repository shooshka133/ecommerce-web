import { supabase } from '../lib/supabaseClient.ts';
import { seedProducts } from '../data/products.ts';

async function seedProductsToSupabase() {
  console.log('Seeding products...');

  for (const product of seedProducts) {
    // Check if the product already exists
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('name', product.name)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking product:', product.name, fetchError);
      continue;
    }

    if (existing) {
      console.log('Product already exists, skipping:', product.name);
      continue;
    }

    // Insert the product
    const { error: insertError } = await supabase.from('products').insert({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.imageUrl,
      category: product.category,
      in_stock: product.inStock,
      rating: product.rating ?? null,
      reviews: product.reviews ?? null,
    });

    if (insertError) console.error('Error inserting product:', product.name, insertError);
    else console.log('Inserted product:', product.name);
  }

  console.log('Seeding finished!');
}

seedProductsToSupabase();
