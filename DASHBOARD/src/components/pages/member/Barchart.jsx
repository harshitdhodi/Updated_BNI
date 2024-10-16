// src/components/BarChart.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const BarChart = () => {
  const [data, setData] = useState({ asks: 0, gives: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const asksResponse = await axios.get("/api/myAsk/getTotalAsks", {
          withCredentials: true,
        });
        const givesResponse = await axios.get("/api/myGives/totalGives", {
          withCredentials: true,
        });
        const matchesResponse = await axios.get("/api/match2/getTotalMatches", {
          withCredentials: true,
        });

        const asksData = asksResponse.data.TotalMyAsks || 0;
        const givesData = givesResponse.data.total || 0;
        const matchesData = matchesResponse.data.totalMatches || 0;

        setData({
          asks: asksData,
          gives: givesData,
          matches: matchesData,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const chartData = {
    labels: ["Asks", "Gives", "Matches"],
    datasets: [
      {
        label: "Total",
        data: [data.asks, data.gives, data.matches],
        backgroundColor: "#36A2EB",
        borderColor: "#36A2EB",
        borderWidth: 1,
        barThickness: 40, // Adjust the thickness here
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Categories",
        },
        ticks: {
          autoSkip: false, // Prevent skipping ticks
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Count",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="lg:w-1/2 mt-5 p-3">
      <h2>Total Asks, Gives, and Matches (Bar Chart)</h2>

      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
