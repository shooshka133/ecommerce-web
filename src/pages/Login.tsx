import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SEO } from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signUpWithPassword({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }

      navigate('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Google login failed. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="container-custom flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <SEO
        title={isLogin ? 'Login' : 'Register'}
        description={isLogin ? 'Login to your account' : 'Create a new account'}
      />
      <Card className="w-full max-w-md">
        <div className="p-8">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Login' : 'Register'}
          </h1>

          <div className="mb-6 flex gap-2">
            <Button
              variant={isLogin ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setIsLogin(false)}
            >
              Register
            </Button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded border border-error bg-red-50 p-3 text-sm text-error dark:border-red-400 dark:bg-red-900/20">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            )}
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => void handleGoogleLogin()}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

