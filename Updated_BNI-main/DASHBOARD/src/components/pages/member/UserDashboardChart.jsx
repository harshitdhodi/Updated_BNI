import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const UserDashboardChart = ({ userId, asksCount, givesCount, matchesCount, businessCount }) => {
  const chartData = {
    labels: ["Asks", "Gives", "Matches", "Business"],
    datasets: [
      {
        data: [asksCount, givesCount, matchesCount, businessCount],
        backgroundColor: [
          "#3b82f6", // blue for asks
          "#8b5cf6", // purple for gives
          "#06b6d4", // cyan for matches
          "#ec4899", // pink for business
        ],
        borderColor: [
          "#1e40af",
          "#6d28d9",
          "#0891b2",
          "#be185d",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
          color: "#64748b",
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        padding: 12,
        titleFont: {
          size: 13,
          weight: "600",
        },
        bodyFont: {
          size: 12,
        },
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const total = asksCount + givesCount + matchesCount + businessCount;
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const total = asksCount + givesCount + matchesCount + businessCount;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-2">No data available yet</p>
          <p className="text-slate-400 text-sm">Start creating asks, gives, or business profiles to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default UserDashboardChart;
