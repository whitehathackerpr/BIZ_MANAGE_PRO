import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as SalesIcon,
  Inventory as InventoryIcon,
  People as EmployeesIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { BrowserProvider, formatEther } from 'ethers';
import useStore from '../store/useStore';
import apiClient from '../services/apiClient';
import { useTranslation } from 'react-i18next';

// Add Ethereum window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: string;
  trend: 'up' | 'down';
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, trend, progress = 75 }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          label={change}
          color={trend === 'up' ? 'success' : 'error'}
          size="small"
          sx={{ mr: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          vs last period
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mt: 2,
          height: 6,
          borderRadius: 3,
          backgroundColor: `${color}15`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </CardContent>
  </Card>
);

interface Transaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'credit' | 'debit';
}

interface SalesAnalytics {
  data: number[];
  labels: string[];
  totalSales: number;
  averageSale: number;
  salesGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

interface InventoryAnalytics {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalItems: number;
  totalValue: number;
  categories: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  reorderAlerts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    minStock: number;
  }>;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useStore();
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const { t } = useTranslation();

  const { data: salesData } = useQuery({
    queryKey: ['salesData'],
    queryFn: () => apiClient.get('/dashboard/sales').then((res) => res.data),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventoryData'],
    queryFn: () => apiClient.get('/dashboard/inventory').then((res) => res.data),
  });

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user?.cryptoWallet?.address && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(user.cryptoWallet.address);
          setWalletBalance(formatEther(balance));
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      }
    };

    fetchWalletBalance();
  }, [user?.cryptoWallet?.address]);

  const stats = [
    {
      title: 'Total Sales',
      value: '$12,345',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#00F5FF' }} />,
      color: '#00F5FF',
      progress: 75,
    },
    {
      title: 'Orders',
      value: '123',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <SalesIcon sx={{ fontSize: 40, color: '#FF2E63' }} />,
      color: '#FF2E63',
      progress: 60,
    },
    {
      title: 'Inventory Items',
      value: '456',
      change: '-3.1%',
      trend: 'down' as const,
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#00F5FF' }} />,
      color: '#00F5FF',
      progress: 45,
    },
    {
      title: 'Employees',
      value: '25',
      change: '+5.0%',
      trend: 'up' as const,
      icon: <EmployeesIcon sx={{ fontSize: 40, color: '#FF2E63' }} />,
      color: '#FF2E63',
      progress: 90,
    },
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: '#00F5FF',
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('dashboard.salesTrend'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  const doughnutData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#00F5FF', '#FF2E63', '#FFB800'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" className="gradient-text">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Connect Wallet">
            <Button
              variant="outlined"
              startIcon={<AccountBalanceIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => {/* Handle wallet connection */}}
            >
              {walletBalance} ETH
            </Button>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Sales Overview</Typography>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line options={chartOptions} data={chartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut options={doughnutOptions} data={doughnutData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {recentTransactions.map((tx, index) => (
                  <React.Fragment key={tx.id}>
                    <ListItem>
                      <ListItemIcon>
                        <SwapHorizIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={tx.description}
                        secondary={`${tx.amount} ETH - ${tx.date}`}
                      />
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 