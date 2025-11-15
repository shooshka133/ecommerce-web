import { useMemo, useState } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { SEO } from '../components/SEO';
import { useProducts } from '../hooks/useProducts';
import { Card } from '../components/Card';

export const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { products, categories, loading, error, refresh } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="container-custom py-8">
      <SEO
        title="Shop"
        description="Browse our wide selection of products. Find the perfect item for you."
        keywords="shop, products, buy, online shopping"
      />
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        Shop
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white md:w-1/2"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {loading && (
        <Card className="p-8 text-center text-text-secondary">
          Loading products...
        </Card>
      )}
      {error && (
        <Card className="p-8 text-center">
          <p className="mb-4 text-error">Unable to load products.</p>
          <Button variant="outline" onClick={() => refresh()}>
            Retry
          </Button>
        </Card>
      )}

      {!loading && !error && <ProductGrid products={filteredProducts} />}
    </div>
  );
};

