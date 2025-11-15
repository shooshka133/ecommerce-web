import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from './Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { darkMode, toggleDarkMode } = useStore();
  const { totalItems } = useCart();
  const { user, profile, signOut, loading } = useAuth();

  const displayName =
    profile?.name ||
    user?.email ||
    (user?.user_metadata?.name as string | undefined) ||
    null;

  const avatarUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-border dark:border-gray-700 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">🛍️ Store</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Orders link */}
            {user && (
              <Link to="/orders" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Orders
                </Button>
              </Link>
            )}

            {/* Authentication */}
            {!loading && !user && (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
            )}

            {!loading && user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName ?? 'User avatar'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {displayName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:inline">
                    {displayName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void signOut().catch((error) =>
                      console.error('Failed to sign out', error)
                    );
                  }}
                >
                  Logout
                </Button>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-2xl">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

