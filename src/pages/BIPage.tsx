import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { DatePicker } from '../components/DatePicker';
import { formatSar, formatDate } from '../utils/formatters';
import { adminApi } from '../services/api';
import {
  Users,
  ClipboardList,
  Briefcase,
  FileText,
  Receipt,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Ticket,
  Coins,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

interface BIStats {
  // Users
  totalUsers: number;
  totalClients: number;
  totalContractors: number;
  newUsers: number;
  
  // Requests
  totalRequests: number;
  totalRegularRequests: number;
  totalQuickServiceOrders: number;
  acceptedRequests: number;
  pendingRequests: number;
  
  // Quotations
  totalQuotations: number;
  acceptedQuotations: number;
  pendingQuotations: number;
  
  // Contracts
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  
  // Projects
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  
  // Financial
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalPayments: number;
  totalMilestones: number;
  paidMilestones: number;
  
  // Support & Communication
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  totalSupportTickets: number;
  openSupportTickets: number;
  resolvedSupportTickets: number;
  totalChats: number;
  
  // Notifications
  totalNotifications: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';
}> = ({ title, value, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[2]}`}>
            {typeof value === 'number' ? value.toLocaleString('en-US') : value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const BIPage: React.FC = () => {
  const [fromDate, setFromDate] = useState(() => {
    // Default to start of 2024 to include mock data
    return '2024-01-01';
  });
  const [toDate, setToDate] = useState(() => {
    // Default to end of 2024 to include mock data
    return '2024-12-31';
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BIStats>({
    totalUsers: 0,
    totalClients: 0,
    totalContractors: 0,
    newUsers: 0,
    totalRequests: 0,
    totalRegularRequests: 0,
    totalQuickServiceOrders: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    totalQuotations: 0,
    acceptedQuotations: 0,
    pendingQuotations: 0,
    totalContracts: 0,
    activeContracts: 0,
    completedContracts: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalPayments: 0,
    totalMilestones: 0,
    paidMilestones: 0,
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
    totalSupportTickets: 0,
    openSupportTickets: 0,
    resolvedSupportTickets: 0,
    totalChats: 0,
    totalNotifications: 0,
  });

  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // Handle YYYY-MM-DD format (from DatePicker and API/mock data)
    // Also handle dates with time (YYYY-MM-DDTHH:mm:ss)
    const dateOnly = dateStr.split('T')[0];
    const date = new Date(dateOnly + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  };

  const isDateInRange = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = parseDateString(dateString);
    const from = parseDateString(fromDate);
    const to = parseDateString(toDate);
    
    if (!date || !from || !to) return false;
    
    // Set time to end of day for 'to' date to include the entire day
    const toEndOfDay = new Date(to);
    toEndOfDay.setHours(23, 59, 59, 999);
    
    return date >= from && date <= toEndOfDay;
  };

  useEffect(() => {
    loadStats();
  }, [fromDate, toDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [
        users,
        requests,
        quickOrders,
        quotations,
        contracts,
        projects,
        invoices,
        payments,
        milestones,
        complaints,
        supportTickets,
        chats,
        notifications,
      ] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listRequests(),
        adminApi.listQuickServiceOrders(),
        adminApi.listQuotations(),
        adminApi.listContracts(),
        adminApi.listProjects(),
        adminApi.listInvoices(),
        adminApi.listPayments(),
        adminApi.listMilestones(),
        adminApi.listComplaints(),
        adminApi.listSupportTickets(),
        adminApi.listChatThreads(),
        adminApi.listNotifications(),
      ]);

      // Filter by date range
      const filteredUsers = users.filter(u => isDateInRange(u.createdAt));
      const filteredRequests = requests.filter(r => isDateInRange(r.createdAt));
      const filteredQuickOrders = quickOrders.filter(q => isDateInRange(q.createdAt));
      const filteredQuotations = quotations.filter(q => isDateInRange(q.createdAt));
      const filteredContracts = contracts.filter(c => isDateInRange(c.createdAt));
      const filteredProjects = projects.filter(p => isDateInRange(p.createdAt));
      const filteredInvoices = invoices.filter(i => isDateInRange(i.createdAt));
      // Payments might have createdAt with time, extract date part
      const filteredPayments = payments.filter(p => {
        const dateStr = p.createdAt?.split('T')[0] || p.createdAt;
        return isDateInRange(dateStr);
      });
      // Milestones use dueDate (they don't have createdAt)
      const filteredMilestones = milestones.filter(m => {
        return m.dueDate ? isDateInRange(m.dueDate) : false;
      });
      const filteredComplaints = complaints.filter(c => isDateInRange(c.createdAt));
      // Support tickets might have createdAt with time
      const filteredSupportTickets = supportTickets.filter(t => {
        const dateStr = t.createdAt?.split('T')[0] || t.createdAt;
        return isDateInRange(dateStr);
      });
      // Chats use updatedAt (they might not have createdAt)
      const filteredChats = chats.filter(c => {
        const dateStr = (c.updatedAt || c.createdAt || '').split('T')[0];
        return dateStr ? isDateInRange(dateStr) : false;
      });
      // Notifications might have createdAt with time
      const filteredNotifications = notifications.filter(n => {
        const dateStr = n.createdAt?.split('T')[0] || n.createdAt;
        return isDateInRange(dateStr);
      });

      // Calculate stats
      const clients = filteredUsers.filter(u => u.role === 'CLIENT');
      const contractors = filteredUsers.filter(u => u.role === 'CONTRACTOR');
      
      const acceptedRequests = filteredRequests.filter(r => r.status === 'ACCEPTED');
      const pendingRequests = filteredRequests.filter(r => r.status === 'PENDING' || r.status === 'IN_REVIEW');
      
      const acceptedQuotations = filteredQuotations.filter(q => q.status === 'ACCEPTED');
      const pendingQuotations = filteredQuotations.filter(q => q.status === 'PENDING' || q.status === 'SUBMITTED');
      
      const activeContracts = filteredContracts.filter(c => c.status === 'ACTIVE');
      const completedContracts = filteredContracts.filter(c => c.status === 'COMPLETED');
      
      const activeProjects = filteredProjects.filter(p => p.status === 'IN_PROGRESS');
      const completedProjects = filteredProjects.filter(p => p.status === 'COMPLETED');
      
      const paidInvoices = filteredInvoices.filter(i => i.status === 'PAID');
      const pendingInvoices = filteredInvoices.filter(i => i.status === 'SENT' || i.status === 'APPROVED');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      const paidMilestones = filteredMilestones.filter(m => m.status === 'PAID');
      
      const openComplaints = filteredComplaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW');
      const resolvedComplaints = filteredComplaints.filter(c => c.status === 'RESOLVED');
      
      const openSupportTickets = filteredSupportTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
      const resolvedSupportTickets = filteredSupportTickets.filter(t => t.status === 'closed');

      setStats({
        totalUsers: filteredUsers.length,
        totalClients: clients.length,
        totalContractors: contractors.length,
        newUsers: filteredUsers.length,
        totalRequests: filteredRequests.length + filteredQuickOrders.length,
        totalRegularRequests: filteredRequests.length,
        totalQuickServiceOrders: filteredQuickOrders.length,
        acceptedRequests: acceptedRequests.length,
        pendingRequests: pendingRequests.length,
        totalQuotations: filteredQuotations.length,
        acceptedQuotations: acceptedQuotations.length,
        pendingQuotations: pendingQuotations.length,
        totalContracts: filteredContracts.length,
        activeContracts: activeContracts.length,
        completedContracts: completedContracts.length,
        totalProjects: filteredProjects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalRevenue,
        totalInvoices: filteredInvoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        totalPayments: filteredPayments.length,
        totalMilestones: filteredMilestones.length,
        paidMilestones: paidMilestones.length,
        totalComplaints: filteredComplaints.length,
        openComplaints: openComplaints.length,
        resolvedComplaints: resolvedComplaints.length,
        totalSupportTickets: filteredSupportTickets.length,
        openSupportTickets: openSupportTickets.length,
        resolvedSupportTickets: resolvedSupportTickets.length,
        totalChats: filteredChats.length,
        totalNotifications: filteredNotifications.length,
      });
    } catch (error) {
      console.error('Load BI stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111111]">ذكاء الأعمال</h1>
      </div>

      {/* Date Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="من تاريخ"
            value={fromDate}
            onChange={setFromDate}
            placeholder="اختر تاريخ البداية"
          />
          <DatePicker
            label="إلى تاريخ"
            value={toDate}
            onChange={setToDate}
            placeholder="اختر تاريخ النهاية"
          />
        </div>
      </Card>

      {/* Totals Section */}
      <div>
        <h2 className="text-xl font-semibold text-[#111111] mb-4">الإجماليات</h2>
        
        {/* Users Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">المستخدمون</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المستخدمين"
              value={stats.totalUsers}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="إجمالي العملاء"
              value={stats.totalClients}
              icon={<Users className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="إجمالي المقاولين"
              value={stats.totalContractors}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="مستخدمين جدد"
              value={stats.newUsers}
              icon={<TrendingUp className="w-6 h-6" />}
              color="teal"
            />
          </div>
        </div>

        {/* Requests Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">الطلبات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الطلبات"
              value={stats.totalRequests}
              icon={<ClipboardList className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="الطلبات العادية"
              value={stats.totalRegularRequests}
              icon={<ClipboardList className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="الخدمات السريعة"
              value={stats.totalQuickServiceOrders}
              icon={<ClipboardList className="w-6 h-6" />}
              color="orange"
            />
            <StatCard
              title="الطلبات المقبولة"
              value={stats.acceptedRequests}
              icon={<TrendingUp className="w-6 h-6" />}
              color="teal"
            />
            <StatCard
              title="الطلبات المعلقة"
              value={stats.pendingRequests}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
          </div>
        </div>

        {/* Quotations Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">العروض</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="إجمالي العروض"
              value={stats.totalQuotations}
              icon={<Briefcase className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="العروض المقبولة"
              value={stats.acceptedQuotations}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="العروض المعلقة"
              value={stats.pendingQuotations}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="orange"
            />
          </div>
        </div>

        {/* Contracts & Projects Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">العقود والمشاريع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="إجمالي العقود"
              value={stats.totalContracts}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="العقود النشطة"
              value={stats.activeContracts}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="العقود المكتملة"
              value={stats.completedContracts}
              icon={<FileText className="w-6 h-6" />}
              color="teal"
            />
            <StatCard
              title="إجمالي المشاريع"
              value={stats.totalProjects}
              icon={<ClipboardList className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="المشاريع النشطة"
              value={stats.activeProjects}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="المشاريع المكتملة"
              value={stats.completedProjects}
              icon={<ClipboardList className="w-6 h-6" />}
              color="teal"
            />
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">المالية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الإيرادات"
              value={formatSar(stats.totalRevenue)}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="إجمالي الفواتير"
              value={stats.totalInvoices}
              icon={<Receipt className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="الفواتير المدفوعة"
              value={stats.paidInvoices}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="الفواتير المعلقة"
              value={stats.pendingInvoices}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="orange"
            />
            <StatCard
              title="إجمالي المدفوعات"
              value={stats.totalPayments}
              icon={<CreditCard className="w-6 h-6" />}
              color="teal"
            />
            <StatCard
              title="إجمالي الدفعات"
              value={stats.totalMilestones}
              icon={<Coins className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="الدفعات المدفوعة"
              value={stats.paidMilestones}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
          </div>
        </div>

        {/* Support & Communication Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#111111] mb-3">الدعم والتواصل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الشكاوى"
              value={stats.totalComplaints}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
            <StatCard
              title="الشكاوى المفتوحة"
              value={stats.openComplaints}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="orange"
            />
            <StatCard
              title="الشكاوى المحلولة"
              value={stats.resolvedComplaints}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="إجمالي تذاكر الدعم"
              value={stats.totalSupportTickets}
              icon={<Ticket className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="تذاكر الدعم المفتوحة"
              value={stats.openSupportTickets}
              icon={<Ticket className="w-6 h-6" />}
              color="orange"
            />
            <StatCard
              title="تذاكر الدعم المحلولة"
              value={stats.resolvedSupportTickets}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="إجمالي المحادثات"
              value={stats.totalChats}
              icon={<MessageSquare className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="إجمالي الإشعارات"
              value={stats.totalNotifications}
              icon={<MessageSquare className="w-6 h-6" />}
              color="teal"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
