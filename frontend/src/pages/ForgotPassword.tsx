import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../providers/StoreProvider';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement password reset logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Password reset email sent',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to send password reset email',
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-primary hover:text-primary-dark"
            >
              sign in to your account
            </button>
          </p>
        </div>
        <Card>
          <form className="mt-8 space-y-6 p-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Password reset email sent. Please check your inbox.
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-md shadow-sm">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || success}
              >
                {isLoading ? 'Sending reset email...' : 'Send reset email'}
              </Button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Back to login
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}; 