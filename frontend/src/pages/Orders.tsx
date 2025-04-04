import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  SelectChangeEvent
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import OrderDetails from '../components/orders/OrderDetails';

interface Order {
  id: string;
  customer_id: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'partial';
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  data: Order[];
  total: number;
}

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchQuery,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const response = await orderService.getAllOrders(params);
      setOrders(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, statusFilter]);

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setOpenDialog(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('orders.title')}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('orders.search')}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('orders.status')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('orders.status')}
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">{t('orders.allStatus')}</MenuItem>
            <MenuItem value="pending">{t('orders.pending')}</MenuItem>
            <MenuItem value="processing">{t('orders.processing')}</MenuItem>
            <MenuItem value="completed">{t('orders.completed')}</MenuItem>
            <MenuItem value="cancelled">{t('orders.cancelled')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('orders.orderNumber')}</TableCell>
              <TableCell>{t('orders.date')}</TableCell>
              <TableCell>{t('orders.total')}</TableCell>
              <TableCell>{t('orders.status')}</TableCell>
              <TableCell>{t('orders.paymentStatus')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>${order.total_amount}</TableCell>
                <TableCell>
                  <Chip
                    label={t(`orders.${order.status}`)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`orders.${order.payment_status}`)}
                    color={order.payment_status === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(order)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('orders.orderDetails')}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onStatusChange={handleStatusChange}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 