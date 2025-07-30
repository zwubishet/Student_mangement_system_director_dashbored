// SchoolBudgetChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SchoolBudgetChart = () => {
  // Data for the bar chart
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'], // Months
    datasets: [
      {
        label: 'Budget',
        data: [50000, 60000, 55000, 65000, 70000, 75000], // Budget data
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Light green for Budget
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: [40000, 50000, 45000, 55000, 60000, 62000], // Expenses data
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Light red for Expenses
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Net Balance',
        data: [10000, 10000, 10000, 10000, 10000, 13000], // Net Balance data
        backgroundColor: 'rgba(153, 102, 255, 0.5)', // Light purple for Net Balance
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Options for the bar chart
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'School Budget, Expenses, and Net Balance',
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensure the y-axis starts from zero
      },
    },
  };

  return (
    <div>
      <h2>School Budget Overview</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SchoolBudgetChart;
