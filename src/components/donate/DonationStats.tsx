'use client';

import { useEffect, useState } from 'react';
import { Heart, Ticket, Gift, TrendingUp } from 'lucide-react';

interface DonationStatsData {
  total_donated: number;
  total_tickets_donated: number;
  total_tickets_availed: number;
  available_tickets: number;
  timestamp: number;
}

export default function DonationStats() {
  const [stats, setStats] = useState<DonationStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/donate/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching donation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: Gift,
      label: 'Total Donated',
      value: `₹${stats.total_donated.toLocaleString('en-IN')}`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Ticket,
      label: 'Tickets Donated',
      value: stats.total_tickets_donated.toString(),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Heart,
      label: 'Tickets Availed',
      value: stats.total_tickets_availed.toString(),
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      icon: TrendingUp,
      label: 'Available Now',
      value: stats.available_tickets.toString(),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {card.label}
            </p>
            <p className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
