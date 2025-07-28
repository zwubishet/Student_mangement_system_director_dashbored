import React from "react";
import { Line } from "react-chartjs-2"; // Import Line chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"; // Import necessary chart.js modules

// Register necessary components for the chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
  // Sample data for the Line chart
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"], // X-axis labels
    datasets: [
      {
        label: "Students Enrolled", // Label for the line
        data: [65, 59, 80, 81, 56, 55, 40], // Data points for the line chart
        fill: false, // No fill under the line
        borderColor: "rgb(75, 192, 192)", // Line color
        tension: 0.1, // Line smoothness
      },
    ],
  };

  // Chart options (customize as needed)
  const options = {
    responsive: true, // Make the chart responsive
    plugins: {
      title: {
        display: true,
        text: "Student Enrollment Over Time", // Title of the chart
      },
    },
  };

  return (
    <div>
      <h2>Student Enrollment Chart</h2>
      <Line data={data} options={options} /> {/* Render the Line chart */}
    </div>
  );
};

export default LineChart;
