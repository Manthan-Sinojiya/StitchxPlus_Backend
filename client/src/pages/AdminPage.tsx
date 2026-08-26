import { Package, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/ui';

export function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">Backoffice Portal</Badge>
            <span className="text-xs text-navy-500 font-mono">v1.0.0-Shell</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-navy-900 mt-1">
            Admin Management Backoffice
          </h1>
        </div>
        <Button variant="gold" size="sm">
          + Create New Garment Spec
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Gross Revenue
              </span>
              <h3 className="text-2xl font-bold font-heading text-navy-900 mt-1">$48,920.00</h3>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% this month
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Active Orders
              </span>
              <h3 className="text-2xl font-bold font-heading text-navy-900 mt-1">32 Orders</h3>
              <span className="text-xs text-navy-500 mt-1 block">In Tailoring Workshop</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Registered Clients
              </span>
              <h3 className="text-2xl font-bold font-heading text-navy-900 mt-1">142 Patrons</h3>
              <span className="text-xs text-navy-500 mt-1 block">With Digital Fit Profiles</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table Shell */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Custom Orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-navy-100 text-xs text-navy-500 uppercase font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              <tr>
                <td className="py-4 px-4 font-mono font-bold text-navy-900">#STITCHX-98241</td>
                <td className="py-4 px-4 font-medium text-navy-800">Lord Harrison Vance</td>
                <td className="py-4 px-4 text-navy-600">The Milano Navy Double-Breasted Suit</td>
                <td className="py-4 px-4 font-bold text-navy-900">$950.00</td>
                <td className="py-4 px-4">
                  <Badge variant="gold">In Tailoring Workshop</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-mono font-bold text-navy-900">#STITCHX-98240</td>
                <td className="py-4 px-4 font-medium text-navy-800">Alexander Sterling</td>
                <td className="py-4 px-4 text-navy-600">The Savoy Charcoal Tuxedo</td>
                <td className="py-4 px-4 font-bold text-navy-900">$1,250.00</td>
                <td className="py-4 px-4">
                  <Badge variant="success">Completed & Shipped</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
