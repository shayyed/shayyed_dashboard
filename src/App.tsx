import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { RequestsPage } from './pages/RequestsPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { QuotationDetailsPage } from './pages/QuotationDetailsPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractDetailsPage } from './pages/ContractDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PaymentDetailsPage } from './pages/PaymentDetailsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { ChatsPage } from './pages/ChatsPage';
import { ChatDetailsPage } from './pages/ChatDetailsPage';
import { ChatSettingsPage } from './pages/ChatSettingsPage';
import { ChatBansPage } from './pages/ChatBansPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationDetailsPage } from './pages/NotificationDetailsPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { MilestoneDetailsPage } from './pages/MilestoneDetailsPage';
import { SupportTicketsPage } from './pages/SupportTicketsPage';
import { SupportTicketDetailsPage } from './pages/SupportTicketDetailsPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceGroupDetailsPage } from './pages/ServiceGroupDetailsPage';
import { CategoryDetailsPage } from './pages/CategoryDetailsPage';
import { SubcategoryDetailsPage } from './pages/SubcategoryDetailsPage';
import { QuickServiceDetailsPage } from './pages/QuickServiceDetailsPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { ContractorDetailsPage } from './pages/ContractorDetailsPage';
import { RegularRequestDetailsPage } from './pages/RegularRequestDetailsPage';
import { QuickServiceOrderDetailsPage } from './pages/QuickServiceOrderDetailsPage';
import { BIPage } from './pages/BIPage';
import { PromoCodesPage } from './pages/PromoCodesPage';
import './App.css';

function ProtectedLayout() {
  const { admin, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white text-[#666666] text-sm"
        dir="rtl"
      >
        جاري التحميل…
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chats/settings" element={<ChatSettingsPage />} />
        <Route path="/chats/bans" element={<ChatBansPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/support-tickets" element={<SupportTicketsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/promo-codes" element={<PromoCodesPage />} />
        <Route path="/bi" element={<BIPage />} />

        <Route path="/users/clients/:id" element={<ClientDetailsPage />} />
        <Route path="/users/contractors/:id" element={<ContractorDetailsPage />} />
        <Route path="/requests/regular/:id" element={<RegularRequestDetailsPage />} />
        <Route path="/requests/quick/:id" element={<QuickServiceOrderDetailsPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
        <Route path="/contracts/:id" element={<ContractDetailsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
        <Route path="/payments/:id" element={<PaymentDetailsPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
        <Route path="/chats/:id" element={<ChatDetailsPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetailsPage />} />
        <Route path="/support-tickets/:id" element={<SupportTicketDetailsPage />} />
        <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
        <Route path="/services/groups/:id" element={<ServiceGroupDetailsPage />} />
        <Route path="/services/categories/:id" element={<CategoryDetailsPage />} />
        <Route path="/services/subcategories/:id" element={<SubcategoryDetailsPage />} />
        <Route path="/services/quick/:id" element={<QuickServiceDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
