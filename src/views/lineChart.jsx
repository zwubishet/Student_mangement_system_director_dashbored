import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SchoolBudgetChart = ({ year = new Date().getFullYear() }) => {
  // In real app, fetch dynamic data based on year
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Budget',
        data: [50000, 60000, 55000, 65000, 70000, 75000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: [40000, 50000, 45000, 55000, 60000, 62000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Net Balance',
        data: [10000, 10000, 10000, 10000, 10000, 13000],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: `School Budget Overview - ${year}` },
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } } },
  };

  return (
    <div className="bg-white !p-6 rounded-lg shadow-md" style={{ height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SchoolBudgetChart;