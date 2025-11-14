// src/components/PieChart.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = () => {
  const [data, setData] = useState({ asks: 0, gives: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token");
        // Fetch data from the endpoints
        const asksResponse = await axios.get("/api/myAsk/getTotalAsks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        const givesResponse = await axios.get("/api/myGives/totalGives", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        const matchesResponse = await axios.get("/api/match2/getTotalMatches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        // console.log(asksResponse.data.TotalMyAsks)
        // Extract data from responses
        const asksData = asksResponse.data.TotalMyAsks || 0;
        const givesData = givesResponse.data.total || 0;
        const matchesData = matchesResponse.data.totalMatches || 0;

        // Set state with the fetched data
        setData({
          asks: asksData,
          gives: givesData,
          matches: matchesData,
        });
      } catch (error) {
        // Set error state if fetching fails
        setError(error.message);
      } finally {
        // Set loading to false after data fetching is complete
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Prepare data for the pie chart
  const chartData = {
    labels: ["Asks", "Gives", "Matches"],
    datasets: [
      {
        data: [data.asks, data.gives, data.matches],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div>
      <h2 className="font-bold">Total Asks, Gives, and Matches</h2>
      <div className="w-[10cm]">
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default PieChart;
