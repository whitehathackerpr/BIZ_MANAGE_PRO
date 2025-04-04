import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import apiClient from '../../services/apiClient';

interface Branch {
  id: string;
  name: string;
}

interface FinancialReport {
  id: string;
  branch_id: string;
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface ReportFormData {
  branch_id: string;
  start_date: Date | null;
  end_date: Date | null;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const FinancialAnalysis: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<ReportFormData['report_type']>('monthly');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchReports();
    }
  }, [selectedBranch]);

  const fetchBranches = async (): Promise<void> => {
    try {
      const response = await apiClient.get<Branch[]>('/branches');
      setBranches(response);
      const firstBranch = response?.[0];
      if (firstBranch && firstBranch.id) {
        setSelectedBranch(firstBranch.id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchReports = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.get<FinancialReport[]>(`/analytics/financial/reports`, {
        params: { branch_id: selectedBranch }
      });
      setReports(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (): Promise<void> => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      await apiClient.post('/analytics/financial/report', {
        branch_id: selectedBranch,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        report_type: reportType
      });
      fetchReports();
      setOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (event: SelectChangeEvent): void => {
    setSelectedBranch(event.target.value);
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setStartDate(null);
    setEndDate(null);
    setReportType('monthly');
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Financial Analysis</Typography>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={selectedBranch}
              onChange={handleBranchChange}
              label="Branch"
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Financial Summary Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="start_date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="total_expenses" fill="#82ca9d" name="Expenses" />
                <Bar dataKey="net_profit" fill="#ffc658" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Reports Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Expenses</TableCell>
                  <TableCell align="right">Net Profit</TableCell>
                  <TableCell>Report Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {new Date(report.start_date).toLocaleDateString()} - 
                      {new Date(report.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      ${report.total_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${report.total_expenses.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${report.net_profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No financial reports available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Generate Financial Report</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 400, p: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e: SelectChangeEvent) => setReportType(e.target.value as ReportFormData['report_type'])}
                label="Report Type"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ my: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                />
              </Box>
              <Box sx={{ my: 2 }}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            color="primary"
            disabled={!startDate || !endDate}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialAnalysis; 