import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import api from '../api';

const SubmitProductReview: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await api.post('/feedback/product-review', {
        product_id: Number(productId),
        rating,
        comment,
      });
      setSuccess('Review submitted successfully!');
      setProductId('');
      setRating(5);
      setComment('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="container mx-auto py-6">Please log in to submit a review.</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Submit Product Review</h2>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Product ID</label>
          <input type="number" value={productId} onChange={e => setProductId(e.target.value)} className="w-full border px-3 py-2 rounded" required min={1} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Rating</label>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full border px-3 py-2 rounded">
            {[5,4,3,2,1].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Comment</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border px-3 py-2 rounded" rows={3} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default SubmitProductReview; 