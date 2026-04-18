import React from 'react';
import { Card } from '../components/Card';
import { adminApi, type AdminDashboardSummary } from '../services/api';
import { formatSar, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, Receipt, AlertTriangle, Ticket } from 'lucide-react';

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function formatYearMonthAr(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return ym;
  return `${AR_MONTHS[m - 1]} ${y}`;
}

const emptySummary: AdminDashboardSummary = {
  users: { totalClients: 0, totalContractors: 0, total: 0 },
  requests: { regularTotal: 0, quickTotal: 0, total: 0, acceptedApprox: 0 },
  requestStatusCombined: { draft: 0, submitted: 0, accepted: 0, completed: 0, cancelled: 0 },
  invoices: { paid: 0, pending: 0, total: 0 },
  complaints: { open: 0 },
  supportTickets: { open: 0 },
  charts: { requestsByMonth: [], revenueByMonth: [] },
  recent: { requests: [], complaints: [], supportTickets: [], paidInvoices: [] },
};

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<AdminDashboardSummary>(emptySummary);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const summary = await adminApi.getDashboardSummary();
        if (!cancelled) setData(summary ?? emptySummary);
      } catch {
        if (!cancelled) setData(emptySummary);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxRequestsMonth = Math.max(1, ...data.charts.requestsByMonth.map((x) => x.count));
  const maxRevenueMonth = Math.max(1, ...data.charts.revenueByMonth.map((x) => x.totalSar));

  const statusRows = [
    { label: 'مسودة', count: data.requestStatusCombined.draft, color: 'bg-gray-500' },
    { label: 'مرسلة', count: data.requestStatusCombined.submitted, color: 'bg-blue-500' },
    { label: 'مقبولة', count: data.requestStatusCombined.accepted, color: 'bg-[#05C4AF]' },
    { label: 'مكتملة', count: data.requestStatusCombined.completed, color: 'bg-emerald-600' },
    { label: 'ملغاة', count: data.requestStatusCombined.cancelled, color: 'bg-[#D34D72]' },
  ];

  if (loading) {
    return (
      <div
        className="min-h-[320px] flex items-center justify-center bg-white text-[#666666] text-sm"
        dir="rtl"
      >
        جاري تحميل لوحة التحكم…
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <h1 className="text-2xl font-semibold text-[#111111]">لوحة التحكم</h1>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">إجمالي المستخدمين</h3>
              <p className="text-2xl font-semibold text-[#111111]">{data.users.total}</p>
              <p className="text-xs text-[#666666] mt-1">
                {data.users.totalClients} عميل • {data.users.totalContractors} مقاول
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">إجمالي الطلبات</h3>
              <p className="text-2xl font-semibold text-[#111111]">{data.requests.total}</p>
              <p className="text-xs text-[#666666] mt-1">
                {data.requests.regularTotal} عادية • {data.requests.quickTotal} سريعة
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">الفواتير</h3>
              <p className="text-2xl font-semibold text-[#111111]">{data.invoices.total}</p>
              <p className="text-xs text-[#666666] mt-1">
                {data.invoices.paid} مدفوعة • {data.invoices.pending} بانتظار / مسودة
              </p>
            </div>
            <Receipt className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">الشكاوى المفتوحة</h3>
              <p className="text-2xl font-semibold text-[#111111]">{data.complaints.open}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#666666] mb-2">تذاكر الدعم المفتوحة</h3>
              <p className="text-2xl font-semibold text-[#111111]">{data.supportTickets.open}</p>
            </div>
            <Ticket className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* رسوم بيانية من الخادم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">عدد الطلبات حسب الشهر</h3>
          <div className="space-y-2">
            {data.charts.requestsByMonth.length === 0 ? (
              <p className="text-sm text-[#666666]">لا بيانات للفترة الحالية</p>
            ) : (
              data.charts.requestsByMonth.map((row) => (
                <div key={row.yearMonth} className="flex items-center gap-3">
                  <span className="text-sm text-[#666666] w-28 shrink-0">
                    {formatYearMonthAr(row.yearMonth)}
                  </span>
                  <div className="flex-1 bg-blue-500/10 rounded-full h-6 relative overflow-hidden min-w-0">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${(row.count / maxRequestsMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#111111] w-8 text-left">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">الطلبات حسب الحالة</h3>
          <div className="space-y-3">
            {statusRows.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-[#666666]">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-[#111111]">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">إيرادات الفواتير (مدفوعة)</h3>
          <div className="space-y-2">
            {data.charts.revenueByMonth.length === 0 ? (
              <p className="text-sm text-[#666666]">لا بيانات للفترة الحالية</p>
            ) : (
              data.charts.revenueByMonth.map((item) => (
                <div key={item.yearMonth} className="flex items-center gap-3">
                  <span className="text-sm text-[#666666] w-28 shrink-0">
                    {formatYearMonthAr(item.yearMonth)}
                  </span>
                  <div className="flex-1 bg-[#05C4AF]/10 rounded-full h-6 relative overflow-hidden min-w-0">
                    <div
                      className="bg-[#05C4AF] h-full rounded-full transition-all"
                      style={{ width: `${(item.totalSar / maxRevenueMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#111111] w-24 text-left shrink-0">
                    {formatSar(item.totalSar)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* آخر الأنشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر الطلبات</h3>
            <Link to="/requests" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent.requests.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد مناقصات أو خدمات سريعة</p>
            ) : (
              data.recent.requests.map((request) => (
                <Link
                  key={`${request.type}-${request.id}`}
                  to={
                    request.type === 'quick'
                      ? `/requests/quick/${request.id}`
                      : `/requests/regular/${request.id}`
                  }
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-md hover:bg-blue-500/10 transition-colors border border-blue-500/10">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#111111]">
                        {request.title || request.serviceTitle || '—'}
                      </p>
                      <p className="text-xs text-[#666666] mt-1">{formatDate(request.createdAt)}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر الشكاوى</h3>
            <Link to="/complaints" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent.complaints.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد شكاوى</p>
            ) : (
              data.recent.complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 bg-red-500/5 rounded-md hover:bg-red-500/10 transition-colors border border-red-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111111] line-clamp-2">
                      {complaint.description}
                    </p>
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

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">آخر تذاكر الدعم</h3>
            <Link to="/support-tickets" className="text-sm text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent.supportTickets.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-4">لا توجد تذاكر دعم</p>
            ) : (
              data.recent.supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-purple-500/5 rounded-md hover:bg-purple-500/10 transition-colors border border-purple-500/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111111]">{ticket.title}</p>
                    <p className="text-xs text-[#666666] mt-1">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <StatusBadge
                    status={ticket.status === 'closed' ? 'REPLIED' : 'AWAITING_REPLY'}
                    customLabel={ticket.status === 'closed' ? 'مغلقة' : 'جديدة'}
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
