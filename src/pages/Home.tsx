import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { SEO } from '../components/SEO';
import { useProducts } from '../hooks/useProducts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Home = () => {
  const { products, loading, error, refresh } = useProducts();
  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      <SEO
        title="Home"
        description="Discover amazing products at unbeatable prices. Shop the latest trends and elevate your style."
        keywords="ecommerce, shopping, online store, products, deals"
      />
      <Hero />
      <section className="container-custom py-12">
        <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Featured Products
        </h2>
        {loading && (
          <Card className="p-8 text-center text-text-secondary">
            Loading products...
          </Card>
        )}
        {error && (
          <Card className="p-8 text-center">
            <p className="mb-4 text-error">
              We couldn&apos;t load products right now.
            </p>
            <Button variant="outline" onClick={() => refresh()}>
              Retry
            </Button>
          </Card>
        )}
        {!loading && !error && (
          <ProductGrid products={featuredProducts} />
        )}
      </section>
    </div>
  );
};

