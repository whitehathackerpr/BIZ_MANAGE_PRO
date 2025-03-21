import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './OrdersChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Orders',
        data: data.values,
        backgroundColor: 'var(--primary-blue)',
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'var(--light-background)',
        titleColor: 'var(--dark-text)',
        bodyColor: 'var(--dark-text)',
        borderColor: 'var(--border-gray)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} orders`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'var(--medium-text)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border-gray)',
          drawBorder: false,
        },
        ticks: {
          color: 'var(--medium-text)',
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="orders-chart">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default OrdersChart; 