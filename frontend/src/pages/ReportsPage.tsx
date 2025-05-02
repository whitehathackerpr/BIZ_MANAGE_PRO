import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getSalesReport,
  getInventoryReport,
  getFinancialReport,
} from '../features/reports';
import { toast } from 'react-toastify';

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salesReport, inventoryReport, financialReport, loading, error } = useSelector((state: RootState) => state.reports);

  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const handleFetch = () => {
    if (reportType === 'sales') {
      dispatch(getSalesReport({ business_id: 1, start_date: startDate, end_date: endDate }));
    } else if (reportType === 'inventory') {
      dispatch(getInventoryReport({ business_id: 1, start_date: startDate, end_date: endDate }));
    } else if (reportType === 'financial') {
      dispatch(getFinancialReport({ business_id: 1, start_date: startDate, end_date: endDate }));
    }
  };

  React.useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  let reportData = null;
  if (reportType === 'sales') reportData = salesReport;
  if (reportType === 'inventory') reportData = inventoryReport;
  if (reportType === 'financial') reportData = financialReport;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="financial">Financial Report</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleFetch}>Fetch Report</button>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {reportData && (
        <div className="bg-white rounded shadow p-4 mt-4">
          <h2 className="text-lg font-bold mb-2">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(reportData.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 