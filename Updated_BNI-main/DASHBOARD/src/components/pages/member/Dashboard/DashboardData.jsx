import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { HelpCircle, Gift, Briefcase, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

function DashboardContent() {
  const {id:userId} = useParams()// Assuming userId is stored in cookies
  console.log("User ID in DashboardContent:", userId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/counters?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const getCardConfig = (name) => {
    const configs = {
      asks: {
        title: 'Asks',
        icon: HelpCircle,
        color: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-600',
        path: 'my-asks'
      },
      gives: {
        title: 'Gives',
        icon: Gift,
        color: 'bg-green-500',
        bgLight: 'bg-green-50',
        textColor: 'text-green-600',
        path: 'my-gives'
      },
      business: {
        title: 'Business',
        icon: Briefcase,
        color: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        textColor: 'text-purple-600',
        path: 'bussiness'
      },
      matches: {
        title: 'Matches',
        icon: Users,
        color: 'bg-orange-500',
        bgLight: 'bg-orange-50',
        textColor: 'text-orange-600',
        path: 'my-matches'
      }
    };
    return configs[name] || configs.asks;
  };

  const pieChartData = data ? {
    labels: ['Asks', 'Gives', 'Business', 'Matches'],
    datasets: [
      {
        label: 'Count',
        data: [data.asks, data.gives, data.business, data.matches],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(16, 185, 129, 0.8)',  // Green
          'rgba(168, 85, 247, 0.8)',  // Purple
          'rgba(249, 115, 22, 0.8)'   // Orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)'
        ],
        borderWidth: 2,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {data && Object.entries(data).map(([key, value]) => {
          const config = getCardConfig(key);
          const Icon = config.icon;
          
          return (
            <Link to={`/member/${userId}/${config.path}`} key={key}>
              <div
                
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">{config.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                    <p className="text-xs text-gray-400">Total Count</p>
                  </div>
                  <div className={`${config.bgLight} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Distribution</h3>
        <div className="h-96">
          {pieChartData && <Pie data={pieChartData} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;