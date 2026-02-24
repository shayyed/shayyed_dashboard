import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
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

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          {/* الصفحات الرئيسية */}
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

          {/* صفحات التفاصيل */}
          {/* Users */}
          <Route path="/users/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/users/contractors/:id" element={<ContractorDetailsPage />} />
          
          {/* Requests */}
          <Route path="/requests/regular/:id" element={<RegularRequestDetailsPage />} />
          <Route path="/requests/quick/:id" element={<QuickServiceOrderDetailsPage />} />
          
          {/* Quotations */}
          <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
          
          {/* Contracts */}
          <Route path="/contracts/:id" element={<ContractDetailsPage />} />
          
          {/* Projects */}
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          
          {/* Invoices */}
          <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
          
          {/* Payments */}
          <Route path="/payments/:id" element={<PaymentDetailsPage />} />
          
          {/* Complaints */}
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          
          {/* Chats */}
          <Route path="/chats/:id" element={<ChatDetailsPage />} />
          
          {/* Milestones */}
          <Route path="/milestones/:id" element={<MilestoneDetailsPage />} />
          
          {/* Support Tickets */}
          <Route path="/support-tickets/:id" element={<SupportTicketDetailsPage />} />
          
          {/* Notifications */}
          <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
          
          {/* Services */}
          <Route path="/services/groups/:id" element={<ServiceGroupDetailsPage />} />
          <Route path="/services/categories/:id" element={<CategoryDetailsPage />} />
          <Route path="/services/subcategories/:id" element={<SubcategoryDetailsPage />} />
          <Route path="/services/quick/:id" element={<QuickServiceDetailsPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
