import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Briefcase,
  FileText,
  Building2,
  Receipt,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Bell,
  Coins,
  Ticket,
  Wrench,
  Settings,
  LogOut,
  BarChart3,
  Percent,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/users', label: 'المستخدمون', icon: Users },
  { path: '/requests', label: 'الطلبات', icon: ClipboardList },
  { path: '/quotations', label: 'العروض', icon: Briefcase },
  { path: '/contracts', label: 'العقود', icon: FileText },
  { path: '/projects', label: 'المشاريع', icon: Building2 },
  { path: '/invoices', label: 'الفواتير', icon: Receipt },
  { path: '/payments', label: 'المدفوعات', icon: CreditCard },
  { path: '/complaints', label: 'الشكاوى', icon: AlertTriangle },
  { path: '/chats', label: 'المحادثات', icon: MessageSquare },
  { path: '/notifications', label: 'الإشعارات', icon: Bell },
  { path: '/milestones', label: 'الدفعات', icon: Coins },
  { path: '/support-tickets', label: 'تذاكر الدعم', icon: Ticket },
  { path: '/services', label: 'الخدمات', icon: Wrench },
  { path: '/promo-codes', label: 'العروض الترويجية', icon: Percent },
  { path: '/bi', label: 'ذكاء الأعمال', icon: BarChart3 },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-[#E5E5E5] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#E5E5E5] flex justify-center items-center">
          <img src={logo} alt="شيّد" className="h-10 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mb-1 rounded-md transition-all duration-150 ${
                location.pathname === item.path
                  ? 'bg-[#111111] text-white'
                  : 'text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              {React.createElement(item.icon, { className: 'w-5 h-5' })}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-[#E5E5E5] space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#111111]">فهد العجلان</p>
            <p className="text-xs text-[#666666]">fahad@shayyed.sa</p>
          </div>
          <button
            onClick={() => {
              // TODO: Implement logout functionality
              console.log('Logout clicked');
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#D34D72] hover:bg-[#D34D72]/10 rounded-md transition-colors border border-[#D34D72]/20"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
          <div className="text-xs text-[#666666] text-center pt-2">
            © 2026 شيّد
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>
      </main>
    </div>
  );
};
