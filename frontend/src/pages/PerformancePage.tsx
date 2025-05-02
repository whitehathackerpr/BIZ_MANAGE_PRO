import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getMetrics,
  getReviews,
  getSummary,
  getDashboard,
} from '../features/performance';
import { toast } from 'react-toastify';

const PerformancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { metrics, reviews, summary, dashboard, loading, error } = useSelector((state: RootState) => state.performance);
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [period, setPeriod] = useState<number>(3);

  useEffect(() => {
    if (employeeId) {
      dispatch(getMetrics({ employee_id: employeeId }));
      dispatch(getReviews({ employee_id: employeeId }));
      dispatch(getSummary({ employee_id: employeeId, period }));
      dispatch(getDashboard({ employee_id: employeeId, period: 12 }));
    }
  }, [dispatch, employeeId, period]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Employee Performance</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          value={employeeId}
          onChange={e => setEmployeeId(Number(e.target.value))}
          className="px-3 py-2 border rounded"
          placeholder="Employee ID"
        />
        <input
          type="number"
          value={period}
          onChange={e => setPeriod(Number(e.target.value))}
          className="px-3 py-2 border rounded"
          placeholder="Period (months)"
        />
      </div>
      {loading && <div>Loading...</div>}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Metrics</h3>
        <table className="min-w-full bg-white rounded shadow mb-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Value</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.id}>
                <td className="py-2 px-4 border-b">{m.metric_type}</td>
                <td className="py-2 px-4 border-b">{m.value}</td>
                <td className="py-2 px-4 border-b">{new Date(m.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Reviews</h3>
        <table className="min-w-full bg-white rounded shadow mb-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Reviewer</th>
              <th className="py-2 px-4 border-b">Review</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td className="py-2 px-4 border-b">{r.reviewer}</td>
                <td className="py-2 px-4 border-b">{r.review_text}</td>
                <td className="py-2 px-4 border-b">{new Date(r.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Summary</h3>
        {summary && <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(summary.summary, null, 2)}</pre>}
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Dashboard</h3>
        {dashboard && <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(dashboard.dashboard_data, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default PerformancePage; 