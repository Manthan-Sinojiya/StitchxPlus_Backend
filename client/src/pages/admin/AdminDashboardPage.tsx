import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Package,
} from 'lucide-react';
import { adminService, AdminStats } from '../../services/adminService';
import { Loader } from '../../components/ui';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-xs text-amber-700 font-semibold tracking-wider uppercase">
          Loading Backoffice Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Dashboard Intelligence</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue monitoring, custom tailoring orders pipeline, and inventory status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-amber-400" /> Catalog Management
          </Link>
        </div>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-slate-900">
            ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0.00'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Verified Paid Commissions
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Total Commissions
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-slate-900">{stats?.totalOrders || 0}</p>
          <span className="text-[11px] text-slate-500 font-medium">Lifetime Orders Recorded</span>
        </div>

        {/* Pending Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              In Production
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-slate-900">{stats?.pendingOrdersCount || 0}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Active Tailoring Queue</span>
        </div>

        {/* Low Stock Items */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-slate-900">{stats?.lowStockProductsCount || 0}</p>
          <span className="text-[11px] text-red-600 font-semibold">Inventory Threshold Warnings</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Manage Products
              </h4>
              <p className="text-xs text-slate-500">Bespoke suits, blazers & tuxedos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/customizations"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Customization Options
              </h4>
              <p className="text-xs text-slate-500">Lapel styles, linings & button swatches</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Security Audit Logs
              </h4>
              <p className="text-xs text-slate-500">Full administrative activity trail</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Recent Customer Commissions</h3>
            <p className="text-xs text-slate-500">Latest tailor-made orders needing processing.</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 transition-colors"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <tr key={order._id || order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${order.totalAmount?.toFixed(2)} USD
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No recent orders registered in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
