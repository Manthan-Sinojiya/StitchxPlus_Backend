import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button, Modal, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({ search, limit: 50 });
      setCustomers(res.customers || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil((customers || []).length / itemsPerPage) || 1;
  const paginatedCustomers = (customers || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const openCustomerDetail = async (cust: any) => {
    setSelectedCustomer(cust);
    try {
      setLoadingDetail(true);
      const res = await adminService.getCustomerDetail(cust.id || cust._id);
      setCustomerDetail(res);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load customer profile details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Customer Account Directory</h2>
          <p className="text-xs text-slate-500">
            View registered clients, order counts, and lifetime bespoke commission values.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Directory...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Commissions Placed</th>
                  <th className="py-3.5 px-4">Lifetime Value</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c) => (
                    <tr key={c.id || c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-xs border border-amber-200 shrink-0">
                          {c.name ? c.name[0] : 'C'}
                        </div>
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono">{c.email}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.orderCount || 0} Orders</td>
                      <td className="py-3.5 px-4 font-bold text-amber-800">
                        ${(c.totalSpent || 0).toFixed(2)} USD
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDetail(c)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No customers found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-600 mt-4 shadow-2xs">
              <span className="font-medium">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, customers.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, customers.length)} of {customers.length} clients
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Client Profile — ${selectedCustomer?.name}`}
        maxWidth="xl"
      >
        {loadingDetail ? (
          <div className="py-12 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-6 text-xs text-slate-900 font-sans">
            {/* Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Email Address</span>
                <span className="font-semibold text-slate-900">{customerDetail?.customer?.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Role</span>
                <span className="font-bold text-amber-800">{customerDetail?.customer?.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Orders</span>
                <span className="font-bold text-slate-900">
                  {customerDetail?.orders?.length || 0} Commissions
                </span>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h5 className="font-serif font-bold text-sm text-slate-900">Commission History</h5>
              {customerDetail?.orders && customerDetail.orders.length > 0 ? (
                <div className="space-y-2">
                  {(customerDetail.orders || []).map((o: any) => (
                    <div
                      key={o._id || o.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                        <span className="block text-[11px] text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {o.status}
                      </span>
                      <span className="font-bold text-slate-900">${o.totalAmount?.toFixed(2)} USD</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 py-4 text-center">No orders recorded for this client yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
