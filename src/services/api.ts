import type {
  User,
  ClientProfile,
  ContractorProfile,
  ServiceRequest,
  QuickServiceOrder,
  QuickService,
  Quotation,
  Contract,
  Project,
  Invoice,
  Payment,
  Settlement,
  Complaint,
  AuditLog,
  ChatThread,
  ChatMessage,
  Notification,
  ProjectReport,
  Milestone,
  SupportTicket,
  ServiceGroup,
  Category,
  Subcategory,
  PaymentMethod,
  Rating,
  PortfolioItem,
} from '../types';
import {
  mockUsers,
  mockContractors,
  mockRequests,
  mockQuickServiceOrders,
  mockQuickServices,
  mockQuotations,
  mockContracts,
  mockProjects,
  mockInvoices,
  mockPayments,
  mockSettlements,
  mockComplaints,
  mockAuditLogs,
  mockChatThreads,
  mockChatMessages,
  mockNotifications,
  mockProjectReports,
  mockMilestones,
  mockSupportTickets,
  mockTimelineEntries,
  mockServiceGroups,
  mockCategories,
  mockSubcategories,
  mockCities,
  mockDistricts,
  mockClients,
  mockPaymentMethods,
  mockRatings,
  mockPortfolioItems,
} from '../mock/data';
import type { TimelineEntry } from '../components/Timeline';

export const adminApi = {
  // Users
  listUsers: async (role?: string): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return role ? mockUsers.filter(u => u.role === role) : mockUsers;
  },

  getUser: async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(u => u.id === id) || null;
  },

  getClient: async (id: string): Promise<ClientProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients.find(c => c.id === id) || null;
  },

  getContractor: async (id: string): Promise<ContractorProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockContractors.find(c => c.id === id) || null;
  },

  getRequest: async (id: string): Promise<ServiceRequest | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRequests.find(r => r.id === id) || null;
  },

  getQuickServiceOrder: async (id: string): Promise<QuickServiceOrder | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockQuickServiceOrders.find(q => q.id === id) || null;
  },

  getClientPaymentMethods: async (clientId: string): Promise<PaymentMethod[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPaymentMethods.filter(pm => pm.userId === clientId);
  },

  getContractorRatings: async (contractorId: string): Promise<Rating[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRatings.filter(r => r.contractorId === contractorId);
  },

  getContractorPortfolio: async (contractorId: string): Promise<PortfolioItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Filter portfolio items by contractorId
    return mockPortfolioItems.filter(p => p.contractorId === contractorId);
  },

  // Contractors
  listContractors: async (): Promise<ContractorProfile[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockContractors;
  },

  // Requests
  listRequests: async (filters?: any): Promise<ServiceRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRequests;
  },

  // Quick Service Orders
  listQuickServiceOrders: async (): Promise<QuickServiceOrder[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockQuickServiceOrders;
  },

  // Quick Services
  listQuickServices: async (): Promise<QuickService[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockQuickServices;
  },

  // Quotations
  listQuotations: async (): Promise<Quotation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockQuotations;
  },

  // Contracts
  listContracts: async (): Promise<Contract[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockContracts;
  },

  // Projects
  listProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjects;
  },

  getProject: async (id: string): Promise<Project | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.find(p => p.id === id) || null;
  },

  // Timeline
  getTimelineEntries: async (projectId: string): Promise<TimelineEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTimelineEntries.filter(t => t.projectId === projectId);
  },

  // Invoices
  listInvoices: async (): Promise<Invoice[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockInvoices;
  },

  getInvoice: async (id: string): Promise<Invoice | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInvoices.find(i => i.id === id) || null;
  },

  // Payments
  listPayments: async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPayments;
  },

  getPayment: async (id: string): Promise<Payment | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPayments.find(p => p.id === id) || null;
  },

  // Settlements
  listSettlements: async (): Promise<Settlement[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSettlements;
  },

  updateSettlementStatus: async (id: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Complaints
  listComplaints: async (): Promise<Complaint[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockComplaints;
  },

  getComplaint: async (id: string): Promise<Complaint | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockComplaints.find(c => c.id === id) || null;
  },

  // Audit Logs
  listAuditLogs: async (filters?: any): Promise<AuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAuditLogs;
  },

  getAuditLog: async (id: string): Promise<AuditLog | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAuditLogs.find(log => log.id === id) || null;
  },

  // Verification
  verifyContractor: async (contractorId: string, status: 'VERIFIED' | 'REJECTED'): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Notifications
  broadcastNotification: async (payload: {
    title: string;
    body: string;
    category: string;
    type: string;
  }): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  // Chat Threads
  listChatThreads: async (): Promise<ChatThread[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChatThreads;
  },

  getChatThread: async (id: string): Promise<ChatThread | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockChatThreads.find(t => t.id === id) || null;
  },

  listChatMessages: async (threadId: string): Promise<ChatMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockChatMessages.filter(m => m.threadId === threadId);
  },

  // Notifications
  listNotifications: async (): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockNotifications;
  },

  getNotification: async (id: string): Promise<Notification | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotifications.find(n => n.id === id) || null;
  },

  // Project Reports
  listProjectReports: async (): Promise<ProjectReport[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjectReports;
  },

  getProjectReport: async (id: string): Promise<ProjectReport | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjectReports.find(r => r.id === id) || null;
  },

  // Milestones
  listMilestones: async (): Promise<Milestone[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMilestones;
  },

  getMilestone: async (id: string): Promise<Milestone | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Search in all contracts' milestones
    for (const contract of mockContracts) {
      const milestone = contract.milestones.find(m => m.id === id);
      if (milestone) return milestone;
    }
    return null;
  },

  getMilestoneContract: async (milestoneId: string): Promise<Contract | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockContracts.find(c => c.milestones.some(m => m.id === milestoneId)) || null;
  },

  // Support Tickets
  listSupportTickets: async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSupportTickets;
  },

  getSupportTicket: async (id: string): Promise<SupportTicket | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSupportTickets.find(t => t.id === id) || null;
  },

  // Service Groups
  listServiceGroups: async (): Promise<ServiceGroup[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockServiceGroups;
  },

  getServiceGroup: async (id: string): Promise<ServiceGroup | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const group = mockServiceGroups.find(g => g.id === id);
    if (!group) return null;
    // Attach categories
    return {
      ...group,
      categories: mockCategories.filter(c => c.groupId === id),
    };
  },

  // Categories
  listCategories: async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories.map(cat => ({
      ...cat,
      subcategories: mockSubcategories.filter(sub => sub.categoryId === cat.id),
    }));
  },

  getCategory: async (id: string): Promise<Category | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = mockCategories.find(c => c.id === id);
    if (!category) return null;
    return {
      ...category,
      subcategories: mockSubcategories.filter(sub => sub.categoryId === id),
    };
  },

  // Subcategories
  listSubcategories: async (): Promise<Subcategory[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSubcategories;
  },

  getSubcategory: async (id: string): Promise<Subcategory | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSubcategories.find(s => s.id === id) || null;
  },

  // Quick Services
  getQuickService: async (id: string): Promise<QuickService | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockQuickServices.find(qs => qs.id === id) || null;
  },

  // Settings
  getSettings: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      // System Settings
      appName: 'شيّد',
      appLogo: '/logo.png',
      appDescription: 'منصة ربط العملاء بالمقاولين',
      contactInfo: {
        phone: '0500000000',
        email: 'info@shayyed.com',
        address: 'الرياض، المملكة العربية السعودية',
      },
      workingHours: {
        from: '09:00',
        to: '18:00',
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
      },
      commissionFee: 120,
      vatPercentage: 15,
      paymentMethods: ['card', 'mada', 'apple_pay'],
      noonPayment: {
        apiKey: '',
        apiSecret: '',
        environment: 'sandbox',
      },
      zatca: {
        endpoint: '',
        credentials: '',
        autoIssue: false,
      },
      notifications: {
        enabled: true,
        pushEnabled: true,
      },
      // Content Settings
      termsAndConditions: {
        content: 'الشروط والأحكام...',
        lastUpdated: '2024-01-01T00:00:00',
      },
      privacyPolicy: {
        content: 'سياسة الخصوصية...',
        lastUpdated: '2024-01-01T00:00:00',
      },
    };
  },

  updateSettings: async (settings: any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Settings updated:', settings);
  },

  listCities: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCities.map(city => ({
      ...city,
      districtsCount: city.districts.length,
    }));
  },

  listDistricts: async (cityId?: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const districts = cityId
      ? mockDistricts.filter(d => d.cityId === cityId)
      : mockDistricts;
    return districts.map(district => ({
      ...district,
      cityName: mockCities.find(c => c.id === district.cityId)?.name || '',
    }));
  },
};
