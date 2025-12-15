import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { CURRENCY } from '../../constants';
import { Users, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, totalOrders: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dbService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`${CURRENCY} ${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="h-6 w-6 text-green-600" />} 
          color="bg-green-100"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="h-6 w-6 text-blue-600" />} 
          color="bg-blue-100"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-6 w-6 text-purple-600" />} 
          color="bg-purple-100"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-sm">System running smoothly. PayU integration active in Test Mode.</p>
      </div>
    </div>
  );
};

export default Dashboard;