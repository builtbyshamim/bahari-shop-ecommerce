import React from 'react';
import { Link } from 'react-router-dom';
import {
  MdShoppingCart,
  MdBarChart,
  MdTrendingUp,
  MdTrendingDown,
  MdInventory,
  MdSwapVert,
  MdArrowForward,
  MdCampaign,
} from 'react-icons/md';

interface ReportCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const REPORT_CARDS: ReportCard[] = [
  {
    title: 'Orders Report',
    description: 'Full order list with customer details, payment status, revenue breakdown, and status filter.',
    path: '/admin/reports/orders',
    icon: <MdShoppingCart className="text-3xl" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200 hover:border-orange-400',
  },
  {
    title: 'Sales Summary',
    description: 'Comprehensive sales overview: revenue by status, payment method, and monthly trend chart.',
    path: '/admin/reports/sales',
    icon: <MdBarChart className="text-3xl" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-400',
  },
  {
    title: 'Income Report',
    description: 'All income transactions grouped by category with progress bars and total summaries.',
    path: '/admin/reports/income',
    icon: <MdTrendingUp className="text-3xl" />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200 hover:border-green-400',
  },
  {
    title: 'Expense Report',
    description: 'All expense transactions grouped by category with budget breakdown and totals.',
    path: '/admin/reports/expense',
    icon: <MdTrendingDown className="text-3xl" />,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200 hover:border-red-400',
  },
  {
    title: 'Inventory Report',
    description: 'Current stock levels, reserved quantities, cost values, and low stock / out-of-stock alerts.',
    path: '/admin/reports/inventory',
    icon: <MdInventory className="text-3xl" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
  },
  {
    title: 'Stock Movements',
    description: 'Complete history of inventory movements: purchases, sales, returns, and adjustments.',
    path: '/admin/reports/stock-movements',
    icon: <MdSwapVert className="text-3xl" />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200 hover:border-indigo-400',
  },
  {
    title: 'Campaign Attribution',
    description: 'See which ad campaigns (Facebook, Google, etc.) drove the most orders and revenue via UTM tracking.',
    path: '/admin/reports/campaigns',
    icon: <MdCampaign className="text-3xl" />,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200 hover:border-pink-400',
  },
];

export default function ReportsHub() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a report to view detailed data, apply date filters, and export to Excel or PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORT_CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className={`group bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${card.border}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{card.description}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${card.color}`}>
              View Report
              <MdArrowForward className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Tip:</strong> All reports support date range filtering (Today, This Week, This Month, This Year, Custom) and can be exported as Excel (.xlsx) or PDF files.
      </div>
    </div>
  );
}
