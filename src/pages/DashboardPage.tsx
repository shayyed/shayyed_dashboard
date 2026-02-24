import React from 'react';
import { Card } from '../components/Card';
import { adminApi } from '../services/api';
import { formatSar, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, Receipt, AlertTriangle, Ticket } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalClients: 0,
    totalContractors: 0,
    totalRequests: 0,
    totalRegularRequests: 0,
    totalQuickServiceOrders: 0,
    totalAcceptedRequests: 0,
    totalPaidInvoices: 0,
    totalPendingInvoices: 0,
    totalOpenComplaints: 0,
    totalOpenSupportTickets: 0,
  });

  const [recentRequests, setRecentRequests] = React.useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = React.useState<any[]>([]);
  const [recentSupportTickets, setRecentSupportTickets] = React.useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [users, requests, quickOrders, invoices, complaints, supportTickets] = await Promise.all([
      adminApi.listUsers(),
      adminApi.listRequests(),
      adminApi.listQuickServiceOrders(),
      adminApi.listInvoices(),
      adminApi.listComplaints(),
      adminApi.listSupportTickets(),
    ]);

    const clients = users.filter((u) => u.role === 'CLIENT');
    const contractors = users.filter((u) => u.role === 'CONTRACTOR');
    const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');
    const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === 'SENT' || inv.status === 'APPROVED'
    );
    const openComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_REVIEW');
    const openSupportTickets = supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress');

    setStats({
      totalUsers: users.length,
      totalClients: clients.length,
      totalContractors: contractors.length,
      totalRequests: requests.length + quickOrders.length,
      totalRegularRequests: requests.length,
      totalQuickServiceOrders: quickOrders.length,
      totalAcceptedRequests: acceptedRequests.length,
      totalPaidInvoices: paidInvoices.length,
      totalPendingInvoices: pendingInvoices.length,
      totalOpenComplaints: openComplaints.length,
      totalOpenSupportTickets: openSupportTickets.length,
    });

    // آخر 5 طلبات
    const allRequests = [
      ...requests.map((r) => ({ ...r, type: 'regular' })),
      ...quickOrders.map((q) => ({ ...q, type: 'quick' })),
    ];
    setRecentRequests(
      allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    );

    // آخر 5 شكاوى
    setRecentComplaints(
      complaints
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );

    // آخر 5 تذاكر دعم
    setRecentSupportTickets(
      supportTickets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );

    // آخر 5 فواتير مدفوعة
    setRecentInvoices(
      paidInvoices
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );
  };

  return (
    <div className="space-y-6 bg-white">
      <h1 className="text-2xl font-semibold text-[#111111]">لوحة التحكم</h1>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">إجمالي المستخدمين</h3>
              <p className="text-2xl font-semibold text-[#111111]">{stats.totalUsers}</p>
              <p className="text-xs text-[#666666] mt-1">
                {stats.totalClients} عميل • {stats.totalContractors} مقاول
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">إجمالي الطلبات</h3>
              <p className="text-2xl font-semibold text-[#111111]">{stats.totalRequests}</p>
              <p className="text-xs text-[#666666] mt-1">
                {stats.totalRegularRequests} عادية • {stats.totalQuickServiceOrders} سريعة
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">الفواتير</h3>
              <p className="text-2xl font-semibold text-[#111111]">
                {stats.totalPaidInvoices + stats.totalPendingInvoices}
              </p>
              <p className="text-xs text-[#666666] mt-1">
                {stats.totalPaidInvoices} مدفوعة • {stats.totalPendingInvoices} بانتظار
              </p>
            </div>
            <Receipt className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">الشكاوى المفتوحة</h3>
              <p className="text-2xl font-semibold text-[#111111]">{stats.totalOpenComplaints}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">تذاكر الدعم المفتوحة</h3>
              <p className="text-2xl font-semibold text-[#111111]">{stats.totalOpenSupportTickets}</p>
            </div>
            <Ticket className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* رسوم بيانية بسيطة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* عدد الطلبات حسب الشهر */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">عدد الطلبات حسب الشهر</h3>
          <div className="space-y-2">
            {['يناير', 'فبراير', 'مارس', 'أبريل'].map((month, idx) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-sm text-[#666666] w-20">{month}</span>
                <div className="flex-1 bg-blue-500/10 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${(idx + 1) * 25}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#111111] w-8">{(idx + 1) * 5}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* الطلبات حسب الحالة */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">الطلبات حسب الحالة</h3>
          <div className="space-y-3">
            {[
              { status: 'مسودة', count: 2, color: 'bg-gray-500' },
              { status: 'مرسلة', count: 5, color: 'bg-blue-500' },
              { status: 'مقبولة', count: 8, color: 'bg-[#05C4AF]' },
              { status: 'مكتملة', count: 3, color: 'bg-[#05C4AF]' },
              { status: 'ملغاة', count: 1, color: 'bg-[#D34D72]' },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-[#666666]">{item.status}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-[#111111]">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* إيرادات الفواتير حسب الشهر */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">إيرادات الفواتير</h3>
          <div className="space-y-2">
            {[
              { month: 'يناير', amount: 50000 },
              { month: 'فبراير', amount: 75000 },
              { month: 'مارس', amount: 60000 },
              { month: 'أبريل', amount: 90000 },
            ].map((item) => (
              <div key={item.month} className="flex items-center gap-3">
                <span className="text-sm text-[#666666] w-20">{item.month}</span>
                <div className="flex-1 bg-[#05C4AF]/10 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-[#05C4AF] h-full rounded-full transition-all"
                    style={{ width: `${(item.amount / 100000) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#111111] w-20 text-left">
                  {formatSar(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* آخر الأنشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* آخر الطلبات */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر الطلبات</h3>
            <Link to="/requests" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد مناقصات أو خدمات سريعة</p>
            ) : (
              recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-blue-500/5 rounded-md hover:bg-blue-500/10 transition-colors border border-blue-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111111]">{request.title || request.serviceTitle}</p>
                    <p className="text-xs text-[#666666] mt-1">{formatDate(request.createdAt)}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* آخر الشكاوى */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر الشكاوى</h3>
            <Link to="/complaints" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد شكاوى</p>
            ) : (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 bg-red-500/5 rounded-md hover:bg-red-500/10 transition-colors border border-red-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111111] line-clamp-2">{complaint.description}</p>
                    <p className="text-xs text-[#666666] mt-1">{formatDate(complaint.createdAt)}</p>
                  </div>
                  <StatusBadge 
                    status={complaint.response ? 'REPLIED' : 'AWAITING_REPLY'} 
                    customLabel={complaint.response ? 'تم الرد' : 'بانتظار الرد'}
                  />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* آخر تذاكر الدعم */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر تذاكر الدعم</h3>
            <Link to="/support-tickets" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {recentSupportTickets.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد تذاكر دعم</p>
            ) : (
              recentSupportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-purple-500/5 rounded-md hover:bg-purple-500/10 transition-colors border border-purple-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111111]">{ticket.title}</p>
                    <p className="text-xs text-[#666666] mt-1">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <StatusBadge 
                    status={ticket.replies && ticket.replies.length > 0 ? 'REPLIED' : 'AWAITING_REPLY'} 
                    customLabel={ticket.replies && ticket.replies.length > 0 ? 'تم الرد' : 'بانتظار الرد'}
                  />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
