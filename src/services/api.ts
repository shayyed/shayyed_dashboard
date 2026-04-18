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
  ChatPlatformSettings,
  ChatPairBlock,
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
  UserRole,
  VerificationStatus,
  RequestStatus,
  QuickServiceOrderStatus,
  QuotationStatus,
  InvoiceStatus,
  PaymentStatus,
  ComplaintType,
  ComplaintStatus,
  ProjectStatus,
  ZATCAStatus,
} from '../types';
import { API_BASE_URL, API_KEY } from '../config/env';
import { adminFetchJson } from './adminHttp';
import {
  mockUsers,
  mockContractors,
  mockSettlements,
  mockAuditLogs,
  mockTimelineEntries,
  mockCities,
  mockDistricts,
  mockClients,
  mockPaymentMethods,
  mockRatings,
} from '../mock/data';
import type { TimelineEntry } from '../components/Timeline';

function mapAdminServiceRequest(r: Record<string, unknown>): ServiceRequest {
  const loc = (r.location as Record<string, unknown> | undefined) || {};
  const urgency = r.urgency === 'urgent' ? 'urgent' : 'normal';
  return {
    id: String(r.id),
    clientId: String(r.clientId ?? ''),
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorId: r.contractorId != null ? String(r.contractorId) : undefined,
    serviceId: String(r.serviceId ?? ''),
    serviceName: String(r.serviceName ?? ''),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    urgency,
    hasDesign: r.hasDesign === true,
    requirements: Array.isArray(r.requirements) ? (r.requirements as string[]) : [],
    location: {
      city: String(loc.city ?? ''),
      district: String(loc.district ?? ''),
      detailed: loc.detailed != null ? String(loc.detailed) : undefined,
    },
    budgetRange: String(r.budgetRange ?? ''),
    materialsIncluded: r.materialsIncluded === true,
    startDate: r.startDate != null ? String(r.startDate) : undefined,
    expectedDuration: r.expectedDuration != null ? String(r.expectedDuration) : undefined,
    allowSiteVisits: r.allowSiteVisits === true,
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : [],
    notes: r.notes != null ? String(r.notes) : undefined,
    status: (r.status || RequestStatus.DRAFT) as ServiceRequest['status'],
    rating: typeof r.rating === 'number' ? r.rating : r.rating != null ? Number(r.rating) : undefined,
    offersCount: typeof r.offersCount === 'number' ? r.offersCount : undefined,
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? r.createdAt ?? ''),
  };
}

/** `GET /admin/dashboard/summary` payload (`data` after success wrapper). */
export type AdminDashboardSummary = {
  users: { totalClients: number; totalContractors: number; total: number };
  requests: { regularTotal: number; quickTotal: number; total: number; acceptedApprox: number };
  requestStatusCombined: {
    draft: number;
    submitted: number;
    accepted: number;
    completed: number;
    cancelled: number;
  };
  invoices: { paid: number; pending: number; total: number };
  complaints: { open: number };
  supportTickets: { open: number };
  charts: {
    requestsByMonth: { yearMonth: string; count: number }[];
    revenueByMonth: { yearMonth: string; totalSar: number }[];
  };
  recent: {
    requests: Array<{
      id: string;
      type: string;
      title?: string;
      serviceTitle?: string;
      status: string;
      createdAt: string;
    }>;
    complaints: Array<{
      id: string;
      description: string;
      createdAt: string;
      status: string;
      response?: string;
    }>;
    supportTickets: Array<{ id: string; title: string; createdAt: string; status: string }>;
    paidInvoices: Array<{
      id: string;
      title: string;
      totalAmount: number;
      createdAt: string;
      status: string;
    }>;
  };
};

function mapAdminQuickOrder(r: Record<string, unknown>): QuickServiceOrder {
  const loc = (r.location as Record<string, unknown> | undefined) || {};
  return {
    id: String(r.id),
    clientId: String(r.clientId ?? ''),
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    serviceId: String(r.serviceId ?? ''),
    serviceTitle: String(r.serviceTitle ?? ''),
    title: r.title != null ? String(r.title) : undefined,
    description: r.description != null ? String(r.description) : undefined,
    urgency: r.urgency === 'urgent' || r.urgency === 'normal' ? r.urgency : undefined,
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : undefined,
    price: typeof r.price === 'number' ? r.price : Number(r.price) || 0,
    duration: String(r.duration ?? ''),
    location: {
      city: String(loc.city ?? ''),
      district: String(loc.district ?? ''),
      detailed: loc.detailed != null ? String(loc.detailed) : undefined,
    },
    materialsIncluded: r.materialsIncluded === true,
    scheduledDate: r.scheduledDate != null ? String(r.scheduledDate) : undefined,
    status: (r.status || QuickServiceOrderStatus.DRAFT) as QuickServiceOrder['status'],
    contractorId: r.contractorId != null ? String(r.contractorId) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    rating: typeof r.rating === 'number' ? r.rating : undefined,
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? r.createdAt ?? ''),
  };
}

function mapMiniUser(u: unknown): Quotation['client'] {
  if (!u || typeof u !== 'object') return undefined;
  const o = u as Record<string, unknown>;
  const id = String(o.id ?? '');
  if (!id) return undefined;
  return {
    id,
    name: String(o.name ?? ''),
    phone: String(o.phone ?? ''),
    email: o.email != null ? String(o.email) : undefined,
  };
}

function mapAdminQuotation(r: Record<string, unknown>): Quotation {
  const installments = Array.isArray(r.installments)
    ? (r.installments as Record<string, unknown>[]).map((o, i) => ({
        id: String(o.id ?? `inst-${i}`),
        title: String(o.title ?? ''),
        amount: typeof o.amount === 'number' ? o.amount : Number(o.amount) || 0,
        description: String(o.description ?? ''),
        dueDate: o.dueDate != null ? String(o.dueDate) : undefined,
      }))
    : undefined;
  const executionPhases = Array.isArray(r.executionPhases)
    ? (r.executionPhases as Record<string, unknown>[]).map((o, i) => ({
        id: String(o.id ?? `phase-${i}`),
        title: String(o.title ?? ''),
        duration: typeof o.duration === 'number' ? o.duration : Number(o.duration) || 0,
        description: String(o.description ?? ''),
        linkedInstallmentId:
          o.linkedInstallmentId != null ? String(o.linkedInstallmentId) : undefined,
      }))
    : undefined;

  const rk = r.requestKind;
  return {
    id: String(r.id),
    quotationNumber: r.quotationNumber != null ? String(r.quotationNumber) : undefined,
    requestId: String(r.requestId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    contractorName: String(r.contractorName ?? ''),
    contractorRating:
      typeof r.contractorRating === 'number' ? r.contractorRating : Number(r.contractorRating) || 0,
    price: typeof r.price === 'number' ? r.price : Number(r.price) || 0,
    duration:
      typeof r.duration === 'number' || typeof r.duration === 'string'
        ? (r.duration as number | string)
        : Number(r.duration) || 0,
    materialsIncluded: r.materialsIncluded === true,
    materialsDetails: r.materialsDetails != null ? String(r.materialsDetails) : undefined,
    notes: r.notes != null ? String(r.notes) : undefined,
    additionalTerms: r.additionalTerms != null ? String(r.additionalTerms) : undefined,
    installments,
    executionPhases,
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : [],
    status: (r.status || QuotationStatus.PENDING) as Quotation['status'],
    createdAt: String(r.createdAt ?? ''),
    requestKind:
      rk === 'regular' || rk === 'quick' || rk === 'unknown' ? rk : undefined,
    requestTitle: r.requestTitle != null ? String(r.requestTitle) : undefined,
    clientId: r.clientId != null ? String(r.clientId) : undefined,
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    relatedContractId: r.relatedContractId != null ? String(r.relatedContractId) : undefined,
    relatedProjectId: r.relatedProjectId != null ? String(r.relatedProjectId) : undefined,
    client: mapMiniUser(r.client),
    contractor: mapMiniUser(r.contractor),
  };
}

function mapAdminMilestones(arr: unknown): Milestone[] {
  if (!Array.isArray(arr)) return [];
  return (arr as Record<string, unknown>[]).map((m, i) => {
    const dueRaw = m.dueDate ?? m.due_date;
    const paidRaw = m.paidAt ?? m.paid_at;
    return {
      id: String(m.id ?? `m-${i}`),
      name: String(m.name ?? ''),
      percentage: Number(m.percentage) || 0,
      amount: Number(m.amount) || 0,
      status: (m.status as Milestone['status']) || 'NotDue',
      dueDate: dueRaw != null && String(dueRaw).trim() !== '' ? String(dueRaw) : undefined,
      paidAt: paidRaw != null && String(paidRaw).trim() !== '' ? String(paidRaw) : undefined,
      description: m.description != null ? String(m.description) : undefined,
    };
  });
}

function mapAdminContract(r: Record<string, unknown>): Contract {
  return {
    id: String(r.id),
    requestId: String(r.requestId ?? ''),
    quotationId: String(r.quotationId ?? ''),
    clientId: String(r.clientId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    scope: String(r.scope ?? ''),
    totalPrice: Number(r.totalPrice) || 0,
    duration: Number(r.duration) || 0,
    milestones: mapAdminMilestones(r.milestones),
    createdAt: String(r.createdAt ?? ''),
    contractNumber: r.contractNumber != null ? String(r.contractNumber) : undefined,
    status: r.status != null ? String(r.status) : undefined,
    activatedAt: r.activatedAt != null ? String(r.activatedAt) : undefined,
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
  };
}

function mapAdminProject(r: Record<string, unknown>): Project {
  return {
    id: String(r.id),
    projectNumber: r.projectNumber != null ? String(r.projectNumber) : undefined,
    contractId: String(r.contractId ?? ''),
    requestId: String(r.requestId ?? ''),
    clientId: String(r.clientId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    title: String(r.title ?? ''),
    status: (r.status || ProjectStatus.NOT_STARTED) as Project['status'],
    progress: typeof r.progress === 'number' ? r.progress : Number(r.progress) || 0,
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? r.createdAt ?? ''),
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    clientPhone: r.clientPhone != null ? String(r.clientPhone) : undefined,
    rating: typeof r.rating === 'number' ? r.rating : r.rating != null ? Number(r.rating) : undefined,
  };
}

function mapAdminInvoice(r: Record<string, unknown>): Invoice {
  return {
    id: String(r.id),
    invoiceNumber: r.invoiceNumber != null ? String(r.invoiceNumber) : undefined,
    projectId: String(r.projectId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    clientId: String(r.clientId ?? ''),
    milestoneId: r.milestoneId != null ? String(r.milestoneId) : undefined,
    title: String(r.title ?? ''),
    description: r.description != null ? String(r.description) : undefined,
    amount: Number(r.amount) || 0,
    vatAmount: Number(r.vatAmount) || 0,
    totalAmount: Number(r.totalAmount) || 0,
    dueDate: String(r.dueDate ?? ''),
    status: (r.status || InvoiceStatus.DRAFT) as Invoice['status'],
    zatcaStatus: (r.zatcaStatus || ZATCAStatus.NOT_ISSUED) as Invoice['zatcaStatus'],
    zatcaUUID: r.zatcaUUID != null ? String(r.zatcaUUID) : undefined,
    zohoId: r.zohoId != null ? String(r.zohoId) : undefined,
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : [],
    createdAt: String(r.createdAt ?? ''),
    paidAt: r.paidAt != null ? String(r.paidAt) : undefined,
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    milestoneLabel: r.milestoneLabel != null ? String(r.milestoneLabel) : undefined,
    projectTitle: r.projectTitle != null ? String(r.projectTitle) : undefined,
    hasPdf: r.hasPdf === true,
    pdfUrl: r.pdfUrl != null ? String(r.pdfUrl) : undefined,
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : undefined,
  };
}

function mapAdminPayment(r: Record<string, unknown>): Payment {
  const noon =
    r.noonReference != null && String(r.noonReference).trim()
      ? String(r.noonReference).trim()
      : undefined;
  const pub =
    r.publicReference != null && String(r.publicReference).trim()
      ? String(r.publicReference).trim()
      : undefined;
  return {
    id: String(r.id),
    invoiceId: String(r.invoiceId ?? ''),
    amount: Number(r.amount) || 0,
    status: (r.status || PaymentStatus.PENDING) as Payment['status'],
    paymentMethod: String(r.paymentMethod ?? ''),
    referenceNumber: pub ?? noon,
    noonPaymentId: r.noonPaymentId != null ? String(r.noonPaymentId) : undefined,
    noonReference: noon,
    processedAt: r.updatedAt != null ? String(r.updatedAt) : undefined,
    createdAt: String(r.createdAt ?? ''),
    clientId: r.clientId != null ? String(r.clientId) : undefined,
    contractorId: r.contractorId != null ? String(r.contractorId) : undefined,
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    invoiceNumber: r.invoiceNumber != null ? String(r.invoiceNumber) : undefined,
    invoiceTitle: r.invoiceTitle != null ? String(r.invoiceTitle) : undefined,
    milestoneLabel: r.milestoneLabel != null ? String(r.milestoneLabel) : undefined,
  };
}

function mapAdminComplaint(r: Record<string, unknown>): Complaint {
  const t = String(r.type || 'OTHER').toUpperCase();
  const type = (Object.values(ComplaintType) as string[]).includes(t)
    ? (t as ComplaintType)
    : ComplaintType.OTHER;
  return {
    id: String(r.id),
    projectId: String(r.projectId ?? ''),
    clientId: String(r.clientId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    raisedBy: 'CLIENT',
    type,
    description: String(r.description ?? ''),
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : [],
    status: (r.status || ComplaintStatus.OPEN) as Complaint['status'],
    response: r.response != null ? String(r.response) : undefined,
    respondedAt: r.respondedAt != null ? String(r.respondedAt) : undefined,
    respondedBy: r.respondedBy != null ? String(r.respondedBy) : undefined,
    createdAt: String(r.createdAt ?? ''),
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    projectTitle: r.projectTitle != null ? String(r.projectTitle) : undefined,
    requestId: r.requestId != null ? String(r.requestId) : undefined,
    requestTitle: r.requestTitle != null ? String(r.requestTitle) : undefined,
    publicReference:
      r.publicReference != null && String(r.publicReference).trim()
        ? String(r.publicReference).trim()
        : undefined,
    complaintNumber: r.complaintNumber != null ? String(r.complaintNumber) : undefined,
    requestReference: r.requestReference != null ? String(r.requestReference) : undefined,
    projectReference: r.projectReference != null ? String(r.projectReference) : undefined,
    clientReference: r.clientReference != null ? String(r.clientReference) : undefined,
    contractorReference: r.contractorReference != null ? String(r.contractorReference) : undefined,
    respondedByName: r.respondedByName != null ? String(r.respondedByName) : undefined,
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : undefined,
  };
}

function mapNotifType(t: string): Notification['type'] {
  const s = String(t).toLowerCase();
  if (s.includes('payment') || s.includes('invoice') || s.includes('financial')) return 'payment';
  if (s.includes('offer') || s.includes('quot')) return 'offer';
  if (s.includes('complaint')) return 'complaint';
  if (s === 'operational') return 'general';
  return 'general';
}

function mapAdminNotification(r: Record<string, unknown>): Notification {
  return {
    id: String(r.id),
    userId: String(r.userId ?? ''),
    title: String(r.title ?? ''),
    body: String(r.body ?? ''),
    type: mapNotifType(String(r.type ?? 'general')),
    relatedId: r.relatedId != null ? String(r.relatedId) : undefined,
    read: r.read === true,
    createdAt: String(r.createdAt ?? ''),
    code: r.code != null ? String(r.code) : undefined,
    userName: r.userName != null ? String(r.userName) : undefined,
    userRole: r.userRole != null ? String(r.userRole) : undefined,
  };
}

function mapChatRelatedType(rt: unknown): ChatThread['relatedType'] {
  const x = String(rt ?? '').toLowerCase();
  if (x === 'project') return 'project';
  if (x === 'invoice') return 'invoice';
  return 'request';
}

function mapAdminChatThread(r: Record<string, unknown>): ChatThread {
  const id = String(r.id);
  const last = r.lastMessage;
  let lastMessage: ChatMessage | undefined;
  if (last && typeof last === 'object') {
    const o = last as Record<string, unknown>;
    lastMessage = {
      id: String(o._id ?? 'last'),
      threadId: id,
      senderId: String(o.senderId ?? ''),
      senderRole: o.senderRole === 'CONTRACTOR' ? UserRole.CONTRACTOR : UserRole.CLIENT,
      content: String(o.content ?? ''),
      attachments: Array.isArray(o.attachments) ? (o.attachments as string[]) : undefined,
      createdAt: String(o.createdAt ?? ''),
    };
  }
  const rk = r.requestKind;
  const requestKind = rk === 'quick' ? 'quick' : rk === 'regular' ? 'regular' : undefined;
  return {
    id,
    clientId: String(r.clientId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    relatedType: mapChatRelatedType(r.relatedType),
    relatedId: String(r.relatedId ?? ''),
    lastMessage,
    unreadCount: typeof r.unreadCount === 'number' ? r.unreadCount : Number(r.unreadCount) || 0,
    updatedAt: String(r.updatedAt ?? ''),
    clientName: r.clientName != null ? String(r.clientName) : undefined,
    contractorName: r.contractorName != null ? String(r.contractorName) : undefined,
    clientPhone: r.clientPhone != null ? String(r.clientPhone) : undefined,
    contractorPhone: r.contractorPhone != null ? String(r.contractorPhone) : undefined,
    relatedTitle: r.relatedTitle != null ? String(r.relatedTitle) : undefined,
    filterRequestId: r.filterRequestId != null ? String(r.filterRequestId) : undefined,
    requestKind,
  };
}

function mapAdminChatMessage(r: Record<string, unknown>): ChatMessage {
  return {
    id: String(r.id),
    threadId: String(r.threadId ?? ''),
    senderId: String(r.senderId ?? ''),
    senderRole: r.senderRole === 'CONTRACTOR' ? UserRole.CONTRACTOR : UserRole.CLIENT,
    content: String(r.content ?? ''),
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : undefined,
    createdAt: String(r.createdAt ?? ''),
  };
}

function mapAdminProjectReport(r: Record<string, unknown>): ProjectReport {
  return {
    id: String(r.id),
    projectId: String(r.projectId ?? ''),
    contractorId: String(r.contractorId ?? ''),
    title: String(r.title ?? ''),
    type: (r.type || 'PROGRESS') as ProjectReport['type'],
    description: String(r.description ?? ''),
    progress: typeof r.progress === 'number' ? r.progress : r.progress != null ? Number(r.progress) : undefined,
    attachments: Array.isArray(r.attachments) ? (r.attachments as string[]) : [],
    createdAt: String(r.createdAt ?? ''),
  };
}

function mapAppSupportTicketRow(r: Record<string, unknown>): SupportTicket {
  const id = String(r.id);
  const message = String(r.message ?? '');
  const responseRaw = r.response != null ? String(r.response) : '';
  const response = responseRaw.trim();
  const respondedAt =
    r.respondedAt != null ? String(r.respondedAt) : r.responseAt != null ? String(r.responseAt) : '';
  const statusRaw = String(r.status ?? 'PENDING');
  const replies: SupportTicket['replies'] = response
    ? [
        {
          id: `${id}-reply`,
          ticketId: id,
          senderId: 'support',
          senderRole: 'support',
          content: response,
          createdAt: respondedAt || String(r.createdAt ?? ''),
        },
      ]
    : [];
  let st: SupportTicket['status'] = 'open';
  if (statusRaw === 'RESOLVED' || statusRaw === 'CLOSED') st = 'closed';
  else if (statusRaw !== 'PENDING' && statusRaw !== 'OPEN') st = 'in_progress';
  const role =
    r.userRole === 'CONTRACTOR' || r.userRole === UserRole.CONTRACTOR
      ? UserRole.CONTRACTOR
      : UserRole.CLIENT;
  return {
    id,
    userId: String(r.userId ?? ''),
    role,
    title: message.slice(0, 100) || 'تذكرة دعم',
    description: message,
    attachments: [],
    status: st,
    replies,
    createdAt: String(r.createdAt ?? ''),
    updatedAt: respondedAt || String(r.createdAt ?? ''),
    userName: r.userName != null ? String(r.userName) : undefined,
  };
}

function mapCatalogToServiceGroups(raw: Record<string, unknown>[]): ServiceGroup[] {
  return raw.map((g) => {
    const gid = String(g.id ?? '');
    const cats = Array.isArray(g.categories) ? (g.categories as Record<string, unknown>[]) : [];
    return {
      id: gid,
      name: String(g.name ?? ''),
      description: String(g.description ?? ''),
      icon: g.icon != null ? String(g.icon) : undefined,
      isActive: g.isActive !== false,
      displayOrder: typeof g.displayOrder === 'number' ? g.displayOrder : undefined,
      createdAt: g.createdAt != null ? String(g.createdAt) : undefined,
      updatedAt: g.updatedAt != null ? String(g.updatedAt) : undefined,
      categories: cats.map((c, idx) => {
        const cid = String(c.id ?? `cat-${idx}`);
        const subs = Array.isArray(c.subcategories) ? (c.subcategories as Record<string, unknown>[]) : [];
        return {
          id: cid,
          name: String(c.name ?? ''),
          groupId: gid,
          icon: c.icon != null ? String(c.icon) : undefined,
          isActive: c.isActive !== false,
          displayOrder: typeof c.displayOrder === 'number' ? c.displayOrder : idx,
          createdAt: c.createdAt != null ? String(c.createdAt) : undefined,
          updatedAt: c.updatedAt != null ? String(c.updatedAt) : undefined,
          subcategories: subs.map((s, j) => ({
            id: String(s.id ?? `sub-${j}`),
            name: String(s.name ?? ''),
            categoryId: cid,
            description: s.description != null ? String(s.description) : undefined,
            icon: s.icon != null ? String(s.icon) : undefined,
            isActive: s.isActive !== false,
            displayOrder: typeof s.displayOrder === 'number' ? s.displayOrder : j,
            createdAt: s.createdAt != null ? String(s.createdAt) : undefined,
            updatedAt: s.updatedAt != null ? String(s.updatedAt) : undefined,
          })),
        };
      }),
    };
  });
}

export const adminApi = {
  /** Home dashboard KPIs + charts + recent lists (`dashboard` role). */
  getDashboardSummary: async (): Promise<AdminDashboardSummary | null> => {
    try {
      return (await adminFetchJson('/admin/dashboard/summary')) as AdminDashboardSummary;
    } catch {
      return null;
    }
  },

  // Users — wired to engine `GET /admin/app-users` (JWT + users role)
  listUsers: async (role?: string): Promise<User[]> => {
    if (!role) return [];
    try {
      const data = (await adminFetchJson(
        `/admin/app-users?role=${encodeURIComponent(role)}&limit=500`
      )) as { items?: Record<string, unknown>[] };
      const items = data.items || [];
      return items.map((u) => ({
        id: String(u.id),
        phone: String(u.phone ?? ''),
        name: String(u.name ?? ''),
        email: u.email != null ? String(u.email) : undefined,
        role: u.role as UserRole,
        pid: u.pid != null ? String(u.pid) : undefined,
        isActive: u.isActive !== false,
        createdAt: String(u.createdAt ?? ''),
      }));
    } catch {
      return [];
    }
  },

  getUser: async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(u => u.id === id) || null;
  },

  getClient: async (id: string): Promise<ClientProfile | null> => {
    try {
      const data = (await adminFetchJson(
        `/admin/app-users/clients/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      return {
        id: String(data.id),
        phone: String(data.phone ?? ''),
        name: String(data.name ?? ''),
        email: data.email != null ? String(data.email) : undefined,
        pid: data.pid != null ? String(data.pid) : undefined,
        role: UserRole.CLIENT,
        addresses: addresses as ClientProfile['addresses'],
        createdAt: String(data.createdAt ?? ''),
      };
    } catch {
      return null;
    }
  },

  getContractor: async (id: string): Promise<ContractorProfile | null> => {
    try {
      const c = (await adminFetchJson(
        `/admin/app-users/contractors/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      const portfolio = Array.isArray(c.portfolio) ? c.portfolio : [];
      const company = c.companyName != null ? String(c.companyName).trim() : '';
      const person = c.name != null ? String(c.name).trim() : '';
      return {
        id: String(c.id),
        phone: String(c.phone ?? ''),
        name: company || person || String(c.name ?? ''),
        email: c.email != null ? String(c.email) : undefined,
        pid: c.pid != null ? String(c.pid) : undefined,
        role: UserRole.CONTRACTOR,
        companyName: c.companyName != null ? String(c.companyName) : undefined,
        rating: typeof c.rating === 'number' ? c.rating : Number(c.rating) || 0,
        totalRatings: typeof c.totalRatings === 'number' ? c.totalRatings : Number(c.totalRatings) || 0,
        verificationStatus: (c.verificationStatus || VerificationStatus.PENDING) as VerificationStatus,
        verifiedAt: c.verifiedAt != null ? String(c.verifiedAt) : undefined,
        rejectedAt: c.rejectedAt != null ? String(c.rejectedAt) : undefined,
        verificationNotes: c.verificationNotes != null ? String(c.verificationNotes) : undefined,
        services: Array.isArray(c.services) ? (c.services as string[]) : [],
        coverageAreas: Array.isArray(c.coverageAreas) ? (c.coverageAreas as string[]) : [],
        coverageAreasWithDistricts: Array.isArray(c.coverageAreasWithDistricts)
          ? (c.coverageAreasWithDistricts as ContractorProfile['coverageAreasWithDistricts'])
          : undefined,
        companyDescription: c.companyDescription != null ? String(c.companyDescription) : undefined,
        commercialRegistration: c.commercialRegistration != null ? String(c.commercialRegistration) : undefined,
        taxId: c.taxId != null ? String(c.taxId) : undefined,
        companyAddress: c.companyAddress != null ? String(c.companyAddress) : undefined,
        companyPhone: c.companyPhone != null ? String(c.companyPhone) : undefined,
        companyEmail: c.companyEmail != null ? String(c.companyEmail) : undefined,
        isActive: c.isActive !== false,
        createdAt: String(c.createdAt ?? ''),
        portfolio: portfolio as PortfolioItem[],
      };
    } catch {
      return null;
    }
  },

  getRequest: async (id: string): Promise<ServiceRequest | null> => {
    try {
      const raw = (await adminFetchJson(
        `/admin/service-requests/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      return mapAdminServiceRequest(raw);
    } catch {
      return null;
    }
  },

  getQuickServiceOrder: async (id: string): Promise<QuickServiceOrder | null> => {
    try {
      const raw = (await adminFetchJson(
        `/admin/quick-service-orders/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      return mapAdminQuickOrder(raw);
    } catch {
      return null;
    }
  },

  getClientPaymentMethods: async (clientId: string): Promise<PaymentMethod[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPaymentMethods.filter(pm => pm.userId === clientId);
  },

  getContractorRatings: async (contractorId: string): Promise<Rating[]> => {
    try {
      const data = (await adminFetchJson(
        `/admin/app-users/contractors/${encodeURIComponent(contractorId)}/ratings`
      )) as { items?: Record<string, unknown>[] };
      return (data.items || []).map((r) => ({
        id: String(r.id),
        projectId: r.projectId != null ? String(r.projectId) : undefined,
        contractorId: String(r.contractorId ?? contractorId),
        clientId: String(r.clientId ?? ''),
        clientName: r.clientName != null ? String(r.clientName) : undefined,
        rating: Number(r.rating),
        comment: r.comment != null ? String(r.comment) : undefined,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : undefined,
        createdAt: String(r.createdAt ?? ''),
      }));
    } catch {
      return [];
    }
  },

  getContractorPortfolio: async (contractorId: string): Promise<PortfolioItem[]> => {
    const c = await adminApi.getContractor(contractorId);
    return c?.portfolio || [];
  },

  // Contractors
  listContractors: async (): Promise<ContractorProfile[]> => {
    try {
      const data = (await adminFetchJson('/admin/app-users?role=CONTRACTOR&limit=500')) as {
        items?: Record<string, unknown>[];
      };
      const items = data.items || [];
      return items.map((c) => ({
        id: String(c.id),
        phone: String(c.phone ?? ''),
        name: String(c.name ?? ''),
        email: c.email != null ? String(c.email) : undefined,
        pid: c.pid != null ? String(c.pid) : undefined,
        role: UserRole.CONTRACTOR,
        companyName: c.companyName != null ? String(c.companyName) : undefined,
        rating: typeof c.rating === 'number' ? c.rating : Number(c.rating) || 0,
        verificationStatus: (c.verificationStatus || VerificationStatus.PENDING) as VerificationStatus,
        services: Array.isArray(c.services) ? (c.services as string[]) : [],
        coverageAreas: Array.isArray(c.coverageAreas) ? (c.coverageAreas as string[]) : [],
        coverageAreasWithDistricts: Array.isArray(c.coverageAreasWithDistricts)
          ? (c.coverageAreasWithDistricts as ContractorProfile['coverageAreasWithDistricts'])
          : undefined,
        commercialRegistration: c.commercialRegistration != null ? String(c.commercialRegistration) : undefined,
        isActive: c.isActive !== false,
        createdAt: String(c.createdAt ?? ''),
      }));
    } catch {
      return [];
    }
  },

  // Requests — engine `GET /admin/service-requests` (dashboard role)
  listRequests: async (_filters?: unknown): Promise<ServiceRequest[]> => {
    try {
      const data = (await adminFetchJson('/admin/service-requests?limit=200')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminServiceRequest);
    } catch {
      return [];
    }
  },

  // Quick Service Orders — engine `GET /admin/quick-service-orders`
  listQuickServiceOrders: async (): Promise<QuickServiceOrder[]> => {
    try {
      const data = (await adminFetchJson('/admin/quick-service-orders?limit=200')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminQuickOrder);
    } catch {
      return [];
    }
  },

  // Quick Services — `GET /admin/catalog/quick-services`
  listQuickServices: async (): Promise<QuickService[]> => {
    try {
      const data = (await adminFetchJson('/admin/catalog/quick-services')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map((s) => ({
        id: String(s.id),
        title: String(s.title ?? ''),
        price: Number(s.price) || 0,
        duration: String(s.duration ?? ''),
        description: s.description != null ? String(s.description) : undefined,
        icon: s.icon != null ? String(s.icon) : undefined,
        displayOrder: typeof s.displayOrder === 'number' ? s.displayOrder : undefined,
        isActive: s.isActive !== false,
        createdAt: s.createdAt != null ? String(s.createdAt) : undefined,
        updatedAt: s.updatedAt != null ? String(s.updatedAt) : undefined,
      }));
    } catch {
      return [];
    }
  },

  createServiceGroup: async (payload: Record<string, unknown>): Promise<ServiceGroup> => {
    const row = (await adminFetchJson('/admin/catalog/service-groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    })) as Record<string, unknown>;
    return mapCatalogToServiceGroups([row])[0];
  },

  replaceServiceGroup: async (id: string, payload: Record<string, unknown>): Promise<void> => {
    await adminFetchJson(`/admin/catalog/service-groups/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  createQuickService: async (payload: Record<string, unknown>): Promise<QuickService> => {
    const row = (await adminFetchJson('/admin/catalog/quick-services', {
      method: 'POST',
      body: JSON.stringify(payload),
    })) as Record<string, unknown>;
    return {
      id: String(row.id),
      title: String(row.title ?? ''),
      price: Number(row.price) || 0,
      duration: String(row.duration ?? ''),
      description: row.description != null ? String(row.description) : undefined,
      icon: row.icon != null ? String(row.icon) : undefined,
      displayOrder: typeof row.displayOrder === 'number' ? row.displayOrder : undefined,
      isActive: row.isActive !== false,
      createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
      updatedAt: row.updatedAt != null ? String(row.updatedAt) : undefined,
    };
  },

  patchQuickService: async (id: string, payload: Record<string, unknown>): Promise<void> => {
    await adminFetchJson(`/admin/catalog/quick-services/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Quotations — `GET /admin/quotations`
  listQuotations: async (params?: Record<string, string>): Promise<Quotation[]> => {
    try {
      const q = new URLSearchParams({ limit: '500', ...(params || {}) });
      const data = (await adminFetchJson(`/admin/quotations?${q}`)) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminQuotation);
    } catch {
      return [];
    }
  },

  getQuotation: async (id: string): Promise<Quotation | null> => {
    try {
      const row = (await adminFetchJson(
        `/admin/quotations/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      return mapAdminQuotation(row);
    } catch {
      return null;
    }
  },

  // Contracts — `GET /admin/contracts`
  listContracts: async (): Promise<Contract[]> => {
    try {
      const data = (await adminFetchJson('/admin/contracts?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminContract);
    } catch {
      return [];
    }
  },

  getContract: async (id: string): Promise<Contract | null> => {
    try {
      const row = (await adminFetchJson(`/admin/contracts/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminContract(row);
    } catch {
      return null;
    }
  },

  // Projects — `GET /admin/projects`
  listProjects: async (): Promise<Project[]> => {
    try {
      const data = (await adminFetchJson('/admin/projects?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminProject);
    } catch {
      return [];
    }
  },

  getProject: async (id: string): Promise<Project | null> => {
    try {
      const row = (await adminFetchJson(`/admin/projects/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminProject(row);
    } catch {
      return null;
    }
  },

  // Timeline (still mock until admin timeline endpoint exists)
  getTimelineEntries: async (projectId: string): Promise<TimelineEntry[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTimelineEntries.filter((t) => t.projectId === projectId);
  },

  // Invoices — `GET /admin/invoices`
  listInvoices: async (): Promise<Invoice[]> => {
    try {
      const data = (await adminFetchJson('/admin/invoices?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminInvoice);
    } catch {
      return [];
    }
  },

  getInvoice: async (id: string): Promise<Invoice | null> => {
    try {
      const row = (await adminFetchJson(`/admin/invoices/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminInvoice(row);
    } catch {
      return null;
    }
  },

  // Payments — `GET /admin/payments`
  listPayments: async (): Promise<Payment[]> => {
    try {
      const data = (await adminFetchJson('/admin/payments?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminPayment);
    } catch {
      return [];
    }
  },

  getPayment: async (id: string): Promise<Payment | null> => {
    try {
      const row = (await adminFetchJson(`/admin/payments/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminPayment(row);
    } catch {
      return null;
    }
  },

  // Settlements
  listSettlements: async (): Promise<Settlement[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSettlements;
  },

  updateSettlementStatus: async (id: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Complaints — `GET /admin/complaints`
  listComplaints: async (): Promise<Complaint[]> => {
    try {
      const data = (await adminFetchJson('/admin/complaints?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminComplaint);
    } catch {
      return [];
    }
  },

  getComplaint: async (id: string): Promise<Complaint | null> => {
    try {
      const row = (await adminFetchJson(`/admin/complaints/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminComplaint(row);
    } catch {
      return null;
    }
  },

  respondComplaint: async (id: string, response: string): Promise<Complaint> => {
    const row = (await adminFetchJson(`/admin/complaints/${encodeURIComponent(id)}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    })) as Record<string, unknown>;
    return mapAdminComplaint(row);
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

  // Manual in-app + push broadcast — `POST /admin/app-notifications/broadcast`
  broadcastNotification: async (payload: {
    title: string;
    body: string;
    category?: string;
    type?: string;
    targetType?: string;
  }): Promise<{ sentCount: number }> => {
    const data = (await adminFetchJson('/admin/app-notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        type: payload.type ?? 'general',
        targetType: payload.targetType ?? payload.category ?? 'all',
      }),
    })) as { sentCount?: number };
    return { sentCount: typeof data.sentCount === 'number' ? data.sentCount : 0 };
  },

  // Chat — `GET /admin/chat/threads` (+ enriched rows, `q` / filter query params)
  listChatThreads: async (opts?: {
    q?: string;
    filterRequestId?: string;
    clientPhone?: string;
    contractorPhone?: string;
    requestKind?: 'quick' | 'regular';
    limit?: number;
    page?: number;
  }): Promise<ChatThread[]> => {
    try {
      const sp = new URLSearchParams();
      sp.set('limit', String(opts?.limit ?? 500));
      if (opts?.page != null) sp.set('page', String(opts.page));
      if (opts?.q?.trim()) sp.set('q', opts.q.trim());
      if (opts?.filterRequestId) sp.set('filterRequestId', opts.filterRequestId);
      if (opts?.clientPhone) sp.set('clientPhone', opts.clientPhone);
      if (opts?.contractorPhone) sp.set('contractorPhone', opts.contractorPhone);
      if (opts?.requestKind === 'quick' || opts?.requestKind === 'regular') {
        sp.set('requestKind', opts.requestKind);
      }
      const data = (await adminFetchJson(`/admin/chat/threads?${sp.toString()}`)) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminChatThread);
    } catch {
      return [];
    }
  },

  getChatThread: async (id: string): Promise<ChatThread | null> => {
    try {
      const rows = await adminApi.listChatThreads({ limit: 500 });
      return rows.find((t) => t.id === id) || null;
    } catch {
      return null;
    }
  },

  listChatMessages: async (threadId: string): Promise<ChatMessage[]> => {
    try {
      const data = (await adminFetchJson(
        `/admin/chat/threads/${encodeURIComponent(threadId)}/messages`
      )) as { items?: Record<string, unknown>[] };
      return (data.items || []).map(mapAdminChatMessage);
    } catch {
      return [];
    }
  },

  getChatSettings: async (): Promise<ChatPlatformSettings> => {
    const data = (await adminFetchJson('/admin/chat/settings')) as Record<string, unknown>;
    return {
      hideChatDuringOffers: data.hideChatDuringOffers === true,
      hideChatAfterAward: data.hideChatAfterAward === true,
      disableChatCompletely: data.disableChatCompletely === true,
    };
  },

  updateChatSettings: async (patch: Partial<ChatPlatformSettings>): Promise<ChatPlatformSettings> => {
    const data = (await adminFetchJson('/admin/chat/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    })) as Record<string, unknown>;
    return {
      hideChatDuringOffers: data.hideChatDuringOffers === true,
      hideChatAfterAward: data.hideChatAfterAward === true,
      disableChatCompletely: data.disableChatCompletely === true,
    };
  },

  listChatBlocks: async (): Promise<ChatPairBlock[]> => {
    const data = (await adminFetchJson('/admin/chat/blocks')) as {
      items?: Record<string, unknown>[];
    };
    return (data.items || []).map((row) => ({
      id: String(row.id),
      clientId: String(row.clientId ?? ''),
      contractorId: String(row.contractorId ?? ''),
      clientName: row.clientName != null ? String(row.clientName) : undefined,
      contractorName: row.contractorName != null ? String(row.contractorName) : undefined,
      createdAt: String(row.createdAt ?? ''),
    }));
  },

  createChatBlock: async (clientId: string, contractorId: string): Promise<void> => {
    await adminFetchJson('/admin/chat/blocks', {
      method: 'POST',
      body: JSON.stringify({ clientId, contractorId }),
    });
  },

  deleteChatBlock: async (id: string): Promise<void> => {
    await adminFetchJson(`/admin/chat/blocks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  listAppUserPickList: async (
    role: 'CLIENT' | 'CONTRACTOR'
  ): Promise<{ id: string; name: string; phone: string }[]> => {
    const data = (await adminFetchJson(`/admin/app-users?role=${role}&limit=500`)) as {
      items?: { id?: string; name?: string; phone?: string }[];
    };
    return (data.items || []).map((u) => ({
      id: String(u.id ?? ''),
      name: String(u.name ?? ''),
      phone: String(u.phone ?? ''),
    }));
  },

  // In-app notifications — `GET /admin/app-notifications`
  listNotifications: async (): Promise<Notification[]> => {
    try {
      const data = (await adminFetchJson('/admin/app-notifications?limit=2000')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAdminNotification);
    } catch {
      return [];
    }
  },

  getNotification: async (id: string): Promise<Notification | null> => {
    try {
      const row = (await adminFetchJson(`/admin/app-notifications/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminNotification(row);
    } catch {
      return null;
    }
  },

  // Project reports — `GET /admin/projects/:projectId/reports`
  listProjectReports: async (projectId: string): Promise<ProjectReport[]> => {
    try {
      const data = (await adminFetchJson(
        `/admin/projects/${encodeURIComponent(projectId)}/reports`
      )) as { items?: Record<string, unknown>[] };
      return (data.items || []).map(mapAdminProjectReport);
    } catch {
      return [];
    }
  },

  getProjectReport: async (id: string): Promise<ProjectReport | null> => {
    try {
      const row = (await adminFetchJson(`/admin/project-reports/${encodeURIComponent(id)}`)) as Record<
        string,
        unknown
      >;
      return mapAdminProjectReport(row);
    } catch {
      return null;
    }
  },

  // Milestones — derived from contracts list
  listMilestones: async (): Promise<Milestone[]> => {
    const contracts = await adminApi.listContracts();
    const all: Milestone[] = [];
    for (const c of contracts) {
      for (const m of c.milestones) all.push(m);
    }
    return all;
  },

  getMilestone: async (id: string): Promise<Milestone | null> => {
    const contracts = await adminApi.listContracts();
    for (const c of contracts) {
      const milestone = c.milestones.find((m) => m.id === id);
      if (milestone) return milestone;
    }
    return null;
  },

  getMilestoneContract: async (milestoneId: string): Promise<Contract | null> => {
    const contracts = await adminApi.listContracts();
    return contracts.find((c) => c.milestones.some((m) => m.id === milestoneId)) || null;
  },

  // App support tickets (in-app) — `GET /admin/app-support-tickets`
  listSupportTickets: async (): Promise<SupportTicket[]> => {
    try {
      const data = (await adminFetchJson('/admin/app-support-tickets?limit=500')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map(mapAppSupportTicketRow);
    } catch {
      return [];
    }
  },

  getSupportTicket: async (id: string): Promise<SupportTicket | null> => {
    try {
      const row = (await adminFetchJson(
        `/admin/app-support-tickets/${encodeURIComponent(id)}`
      )) as Record<string, unknown>;
      return mapAppSupportTicketRow(row);
    } catch {
      return null;
    }
  },

  respondSupportTicket: async (id: string, response: string): Promise<void> => {
    await adminFetchJson(`/admin/app-support-tickets/${encodeURIComponent(id)}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  // Catalog — `GET /admin/catalog/service-groups`
  listServiceGroups: async (): Promise<ServiceGroup[]> => {
    try {
      const raw = (await adminFetchJson('/admin/catalog/service-groups')) as
        | { items?: Record<string, unknown>[] }
        | Record<string, unknown>[]
        | null
        | undefined;
      const items = Array.isArray(raw)
        ? raw
        : raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: Record<string, unknown>[] }).items || [])
          : [];
      return mapCatalogToServiceGroups(items as Record<string, unknown>[]);
    } catch {
      return [];
    }
  },

  getServiceGroup: async (id: string): Promise<ServiceGroup | null> => {
    const groups = await adminApi.listServiceGroups();
    return groups.find((g) => g.id === id) || null;
  },

  listCategories: async (): Promise<Category[]> => {
    const groups = await adminApi.listServiceGroups();
    return groups.flatMap((g) => g.categories || []);
  },

  getCategory: async (id: string): Promise<Category | null> => {
    const cats = await adminApi.listCategories();
    return cats.find((c) => c.id === id) || null;
  },

  listSubcategories: async (): Promise<Subcategory[]> => {
    const cats = await adminApi.listCategories();
    return cats.flatMap((c) => c.subcategories || []);
  },

  getSubcategory: async (id: string): Promise<Subcategory | null> => {
    const subs = await adminApi.listSubcategories();
    return subs.find((s) => s.id === id) || null;
  },

  getQuickService: async (id: string): Promise<QuickService | null> => {
    const all = await adminApi.listQuickServices();
    return all.find((q) => q.id === id) || null;
  },

  /** Promo codes — Mongo `promo_codes` */
  listPromoCodes: async (): Promise<
    Array<{ id: string; code: string; title: string; discountRate: number; isActive: boolean; createdAt: string }>
  > => {
    try {
      const data = (await adminFetchJson('/admin/promo-codes')) as {
        items?: Record<string, unknown>[];
      };
      return (data.items || []).map((p) => ({
        id: String(p.id),
        code: String(p.code ?? ''),
        title: String(p.title ?? ''),
        discountRate: Number(p.discountRate) || 0,
        isActive: p.isActive !== false,
        createdAt: String(p.createdAt ?? ''),
      }));
    } catch {
      return [];
    }
  },

  createPromoCode: async (payload: {
    title: string;
    code: string;
    discountRate: number;
  }): Promise<void> => {
    await adminFetchJson('/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        code: payload.code,
        discountRate: payload.discountRate,
      }),
    });
  },

  updatePromoCode: async (
    id: string,
    payload: Partial<{ title: string; discountRate: number; isActive: boolean }>
  ): Promise<void> => {
    await adminFetchJson(`/admin/promo-codes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
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

  /** Cities from engine `GET /locations/cities` (apikey — same as sign-in). Normalized `name` = Arabic label for filters. */
  listCities: async (): Promise<
    Array<{
      id: string;
      name: string;
      name_ar?: string;
      name_en?: string;
      city_id?: number;
      region_id?: number;
      districts: unknown[];
      districtsCount: number;
    }>
  > => {
    if (!API_BASE_URL || !API_KEY) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/locations/cities`, {
        headers: { apikey: API_KEY },
      });
      if (!res.ok) return [];
      const raw = (await res.json()) as unknown;
      if (!Array.isArray(raw)) return [];
      const sorted = [...raw].sort((a, b) => {
        const ar = String((a as { name_ar?: string }).name_ar || '');
        const br = String((b as { name_ar?: string }).name_ar || '');
        return ar.localeCompare(br, 'ar');
      });
      return sorted.map((c) => {
        const row = c as {
          city_id?: number;
          region_id?: number;
          name_ar?: string;
          name_en?: string;
        };
        const name = String(row.name_ar || row.name_en || row.city_id || '').trim();
        return {
          id: String(row.city_id ?? ''),
          name,
          name_ar: row.name_ar,
          name_en: row.name_en,
          city_id: row.city_id,
          region_id: row.region_id,
          districts: [],
          districtsCount: 0,
        };
      }).filter((c) => c.name.length > 0);
    } catch {
      return [];
    }
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
