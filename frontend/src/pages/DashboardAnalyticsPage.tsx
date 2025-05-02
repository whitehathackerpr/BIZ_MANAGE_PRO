import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  fetchSalesTrends,
  fetchTopProducts,
  fetchInventoryTrends,
  fetchKPIs,
} from '../features/dashboard/dashboardSlice';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardAnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salesTrends, topProducts, inventoryTrends, kpis, loading, error } = useSelector((state: RootState) => state.dashboard);
  const businessId = 1; // Replace with actual businessId

  useEffect(() => {
    dispatch(fetchSalesTrends(businessId));
    dispatch(fetchTopProducts(businessId));
    dispatch(fetchInventoryTrends(businessId));
    dispatch(fetchKPIs(businessId));
  }, [dispatch, businessId]);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Business Analytics Dashboard</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow text-center">
            <div className="text-3xl font-bold">{kpi.value}</div>
            <div className="text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Sales & Revenue Trends</h3>
          <Line
            data={{
              labels: salesTrends.map(s => s.date),
              datasets: [
                {
                  label: 'Sales',
                  data: salesTrends.map(s => s.sales),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                },
                {
                  label: 'Revenue',
                  data: salesTrends.map(s => s.revenue),
                  borderColor: 'rgb(16, 185, 129)',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Top Products</h3>
          <Bar
            data={{
              labels: topProducts.map(p => p.name),
              datasets: [
                {
                  label: 'Sales',
                  data: topProducts.map(p => p.sales),
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                },
                {
                  label: 'Revenue',
                  data: topProducts.map(p => p.revenue),
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Inventory Trends</h3>
          <Line
            data={{
              labels: inventoryTrends.map(i => i.date),
              datasets: [
                {
                  label: 'Stock',
                  data: inventoryTrends.map(i => i.stock),
                  borderColor: 'rgb(234, 179, 8)',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage; 