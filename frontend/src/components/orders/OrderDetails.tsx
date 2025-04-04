import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/orderService';

interface OrderDetailsProps {
  order: {
    id: string;
    customer_id: string;
    date: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    payment_status: 'paid' | 'unpaid' | 'partial';
    created_at: string;
    updated_at: string;
  };
  onStatusChange: (orderId: string, newStatus: string) => void;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onStatusChange, onClose }) => {
  const { t } = useTranslation();
  const [orderItems, setOrderItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const items = await orderService.getOrderItems(order.id);
        setOrderItems(items);
      } catch (error) {
        console.error('Error fetching order items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [order.id]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(order.id, event.target.value);
  };

  const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'error',
  };

  const paymentStatusColors: Record<string, 'success' | 'error' | 'warning'> = {
    paid: 'success',
    unpaid: 'error',
    partial: 'warning',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {t('orders.orderDetails')} #{order.id}
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            label={t(`orders.${order.status}`)}
            color={statusColors[order.status]}
            size="small"
          />
          <Chip
            label={t(`orders.${order.payment_status}`)}
            color={paymentStatusColors[order.payment_status]}
            size="small"
          />
        </Box>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {t('orders.orderDate')}
        </Typography>
        <Typography>{new Date(order.date).toLocaleDateString()}</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('orders.product')}</TableCell>
              <TableCell align="right">{t('orders.quantity')}</TableCell>
              <TableCell align="right">{t('orders.price')}</TableCell>
              <TableCell align="right">{t('orders.total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_id}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6">{t('orders.total')}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">${order.total_amount.toFixed(2)}</Typography>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('orders.updateStatus')}</InputLabel>
          <Select
            value={order.status}
            onChange={handleStatusChange}
            label={t('orders.updateStatus')}
          >
            <MenuItem value="pending">{t('orders.pending')}</MenuItem>
            <MenuItem value="processing">{t('orders.processing')}</MenuItem>
            <MenuItem value="completed">{t('orders.completed')}</MenuItem>
            <MenuItem value="cancelled">{t('orders.cancelled')}</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={onClose}>
          {t('common.close')}
        </Button>
      </Box>
    </Box>
  );
};

export default OrderDetails; 