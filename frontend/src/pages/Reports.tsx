import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { reportService, ReportParams } from '../services/reportService';
import type {
  SalesReportData,
  InventoryReportData,
  CustomerReportData,
  FinancialReportData,
  ProductPerformanceData,
  OrderAnalyticsData,
} from '../services/reportService';

type ReportType = 'sales' | 'inventory' | 'customers' | 'financial' | 'products' | 'orders';
type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ReportTypeOption {
  value: ReportType;
  label: string;
}

type ReportData = 
  | SalesReportData 
  | InventoryReportData 
  | CustomerReportData 
  | FinancialReportData 
  | ProductPerformanceData 
  | OrderAnalyticsData;

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reportTypes: ReportTypeOption[] = [
    { value: 'sales', label: t('reports.sales') },
    { value: 'inventory', label: t('reports.inventory') },
    { value: 'customers', label: t('reports.customers') },
    { value: 'financial', label: t('reports.financial') },
    { value: 'products', label: t('reports.products') },
    { value: 'orders', label: t('reports.orders') },
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: ReportParams = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      let data: ReportData;
      switch (reportType) {
        case 'sales':
          data = await reportService.getSalesReport(params);
          break;
        case 'inventory':
          data = await reportService.getInventoryReport(params);
          break;
        case 'customers':
          data = await reportService.getCustomerReport(params);
          break;
        case 'financial':
          data = await reportService.getFinancialReport(params);
          break;
        case 'products':
          data = await reportService.getProductPerformanceReport(params);
          break;
        case 'orders':
          data = await reportService.getOrderAnalyticsReport(params);
          break;
        default:
          throw new Error(t('reports.invalidReportType'));
      }

      setReportData(data);
    } catch (error) {
      setError((error as Error).message);
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params: ReportParams = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      const blob = await reportService.exportReport(reportType, exportFormat, params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError((error as Error).message);
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value as ReportType);
  };

  const handleExportFormatChange = (event: SelectChangeEvent) => {
    setExportFormat(event.target.value as ExportFormat);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('reports.title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>{t('reports.reportType')}</InputLabel>
            <Select
              value={reportType}
              onChange={handleReportTypeChange}
              label={t('reports.reportType')}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('reports.startDate')}
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('reports.endDate')}
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={fetchReport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {t('reports.generate')}
          </Button>
        </Grid>

        {reportData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('reports.results')}
              </Typography>
              {/* Render report data based on type */}
              <pre>{JSON.stringify(reportData, null, 2)}</pre>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>{t('reports.exportFormat')}</InputLabel>
            <Select
              value={exportFormat}
              onChange={handleExportFormatChange}
              label={t('reports.exportFormat')}
            >
              {exportFormats.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            disabled={loading || !reportData}
            startIcon={<DownloadIcon />}
          >
            {t('reports.export')}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Dialog open={!!error} onClose={() => setError(null)}>
          <DialogTitle>{t('common.error')}</DialogTitle>
          <DialogContent>
            <Typography>{error}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setError(null)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Reports; 