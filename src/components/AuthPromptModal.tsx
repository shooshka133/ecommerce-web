import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const AuthPromptModal = () => {
  const { authModalOpen, authModalMessage, closeAuthModal } = useAuth();

  if (!authModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Authentication Required
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          {authModalMessage ?? 'Please log in to manage your cart.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeAuthModal}>
            Close
          </Button>
          <Link to="/login" onClick={closeAuthModal}>
            <Button variant="primary">Go to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

