import { useState, useEffect } from 'react';
import { ShieldCheck, User, Globe, Search } from 'lucide-react';
import { useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({ limit: 50 });
      setLogs(res.logs || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredLogs = (logs || []).filter((log) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      (log.userName && log.userName.toLowerCase().includes(s)) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(s)) ||
      (log.action && log.action.toLowerCase().includes(s)) ||
      (log.entityType && log.entityType.toLowerCase().includes(s)) ||
      (log.entityId && log.entityId.toLowerCase().includes(s)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(s))
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            Security & Administration Audit Logs
          </h2>
          <p className="text-xs text-slate-500">
            Compliance record of all administrative actions, updates, status changes, and IP addresses.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit logs by admin, action, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Reading Audit Log Ledger...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Admin User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 font-mono bg-white">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-sans flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        {log.userName || log.userEmail || 'Admin'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-sans font-medium">{log.entityType}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[10px]">{log.entityId}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[10px] flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-sans text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans font-medium">
                      No security audit logs found matching query.
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
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} audit logs
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
    </div>
  );
}
