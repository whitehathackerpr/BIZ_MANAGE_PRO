import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import api from '../api';

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) return;
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        let res;
        if (user.role === 'customer') {
          res = await api.get(`/recommendations/customer/${user.id}`);
        } else if (user.role === 'supplier') {
          res = await api.get(`/recommendations/supplier/${user.id}`);
        } else {
          setRecommendations([]);
          setLoading(false);
          return;
        }
        setRecommendations(res.data.items || []);
      } catch (err: any) {
        setError('Failed to fetch recommendations');
      }
      setLoading(false);
    };
    fetchRecommendations();
  }, [user]);

  if (!user) {
    return <div className="container mx-auto py-6">Please log in to see recommendations.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">AI-Driven Product Recommendations</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-4">
        {recommendations.length === 0 && !loading && <li>No recommendations available.</li>}
        {recommendations.map((rec, idx) => (
          <li key={idx} className="bg-white p-4 rounded shadow">
            <div className="font-semibold text-lg">{rec.name}</div>
            {rec.avg_rating !== undefined && (
              <div className="text-yellow-600">Avg. Rating: {rec.avg_rating.toFixed(2)} / 5</div>
            )}
            {rec.recommendation_score !== undefined && (
              <div className="text-blue-600 text-sm">Recommendation Score: {rec.recommendation_score.toFixed(2)}</div>
            )}
            <div className="text-gray-600 text-sm mt-1">{rec.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsPage; 