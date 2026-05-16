const HEX_OBJECT_ID = /^[a-fA-F0-9]{24}$/;

/** Shown in lists; routes still use Mongo `id`. Uses `invoiceNumber` or `INV-LEG-…` for legacy ids. */
export function getInvoiceDisplayNumber(invoice: { invoiceNumber?: string; id: string }): string {
  const n = invoice.invoiceNumber?.trim();
  if (n) return n;
  const id = String(invoice.id || '').trim();
  if (HEX_OBJECT_ID.test(id)) return `INV-LEG-${id.slice(-8).toUpperCase()}`;
  return id || '—';
}

/** User-visible support ticket ref: `TICKET-YYYY-NNNN` from API when set; legacy rows → `TKT-LEG-…`. */
export function getSupportTicketDisplayNumber(ticket: { ticketNumber?: string; id: string }): string {
  const stored = ticket.ticketNumber?.trim();
  if (stored) return stored;
  const id = String(ticket.id || '').trim();
  if (HEX_OBJECT_ID.test(id)) return `TKT-LEG-${id.slice(-8).toUpperCase()}`;
  return id || '—';
}

/** Tenders: `REQ-LEG-…` — Quick orders: `ORD-LEG-…`. */
export function getRequestDisplayNumber(
  requestId: string | undefined | null,
  isQuickService?: boolean
): string {
  if (requestId == null || !String(requestId).trim()) return '—';
  const id = String(requestId).trim();
  if (HEX_OBJECT_ID.test(id)) {
    const tail = id.slice(-8).toUpperCase();
    return isQuickService ? `ORD-LEG-${tail}` : `REQ-LEG-${tail}`;
  }
  return id;
}

export function getProjectDisplayNumber(projectId: string | undefined | null): string {
  if (projectId == null || !String(projectId).trim()) return '—';
  const id = String(projectId).trim();
  if (HEX_OBJECT_ID.test(id)) return `PRJ-LEG-${id.slice(-8).toUpperCase()}`;
  return id;
}

export function getContractDisplayNumber(contract: { contractNumber?: string; id: string }): string {
  const n = contract.contractNumber?.trim();
  if (n) return n;
  const id = String(contract.id || '').trim();
  if (HEX_OBJECT_ID.test(id)) return `CT-LEG-${id.slice(-8).toUpperCase()}`;
  return id || '—';
}

export function getQuotationDisplayNumber(q: { quotationNumber?: string; id: string }): string {
  const n = q.quotationNumber?.trim();
  if (n) return n;
  const id = String(q.id || '').trim();
  if (HEX_OBJECT_ID.test(id)) return `OF-LEG-${id.slice(-8).toUpperCase()}`;
  return id || '—';
}

/**
 * Other Mongo-only admin entities (threads, notifications, catalog ids, milestones).
 * `prefix` should be short A–Z, e.g. THR, NOTI, SUB, QSRV, MILE.
 */
export function getInternalDisplayRef(id: string | undefined | null, prefix: string): string {
  const p = String(prefix || 'REF')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const safeP = p || 'REF';
  if (id == null || !String(id).trim()) return '—';
  const s = String(id).trim();
  if (HEX_OBJECT_ID.test(s)) return `${safeP}-LEG-${s.slice(-8).toUpperCase()}`;
  return s;
}

/** Arabic / mixed duration text already contains a time unit — show as-is. */
const HAS_DURATION_UNIT_AR =
  /يوم|أيام|يومين|ساعة|ساعتان|ساعات|دقيقة|دقائق|أسبوع|أسابيع|شهر|أشهر|أسبوعين|شهرين|سنة|سنوات/i;

/** Execution time from quotation / quick order (numeric = days → `N يوم` / `N أيام`). */
export function formatQuotationDurationForDisplay(duration: unknown): string {
  if (duration == null || duration === '') return '—';
  if (typeof duration === 'number' && !Number.isNaN(duration)) {
    const n = Math.floor(duration);
    if (n <= 0) return '—';
    return n === 1 ? `${n} يوم` : `${n} أيام`;
  }
  if (typeof duration === 'string') {
    const t = duration.trim();
    if (!t) return '—';
    if (HAS_DURATION_UNIT_AR.test(t)) return t;
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n <= 0) return '—';
      return n === 1 ? `${n} يوم` : `${n} أيام`;
    }
    return t;
  }
  return String(duration);
}

/**
 * Quick-order "مدة الطلب": **accepted offer** duration when available; otherwise catalog snapshot on the order.
 */
export function getQuickServiceOrderDisplayDuration(
  order: { duration?: string | number | null },
  acceptedQuotation?: { duration?: unknown } | null
): string {
  const fromOffer = acceptedQuotation?.duration;
  if (fromOffer != null && String(fromOffer).trim() !== '') {
    return formatQuotationDurationForDisplay(fromOffer);
  }
  return formatQuotationDurationForDisplay(order.duration);
}

/**
 * Regular tender: accepted-offer `executionDuration` from admin API when present; else client `expectedDuration`
 * (numeric strings get يوم/أيام; free text left as-is unless it is only digits).
 */
export function getRegularRequestDurationDisplay(request: {
  executionDuration?: unknown;
  expectedDuration?: string;
}): string {
  const fromOffer = request.executionDuration;
  if (fromOffer != null && String(fromOffer).trim() !== '') {
    return formatQuotationDurationForDisplay(fromOffer);
  }
  return formatQuotationDurationForDisplay(request.expectedDuration);
}

export const formatSar = (amount: number): string => {
  return `${amount.toLocaleString('en-US')} ر.س`;
};

export const formatCurrency = (amount: number): string => {
  return formatSar(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');
  return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
};

export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: 'مسودة',
    SUBMITTED: 'مرسلة',
    CANCELLED: 'ملغاة',
    ACCEPTED: 'مقبولة',
    PENDING: 'بانتظار الرد',
    REJECTED: 'مرفوضة',
    SENT: 'مرسلة',
    APPROVED: 'موافق عليها',
    PAID: 'مدفوعة',
    SUCCESS: 'نجحت',
    FAILED: 'فشلت',
    OPEN: 'مفتوحة',
    IN_REVIEW: 'قيد المراجعة',
    RESOLVED: 'محلولة',
    CLOSED: 'مغلقة',
    NOT_STARTED: 'لم يبدأ',
    IN_PROGRESS: 'قيد التنفيذ',
    PAUSED: 'متوقف مؤقتًا',
    COMPLETED: 'مكتمل',
    VERIFIED: 'موثق',
    Processing: 'قيد المعالجة',
    Paid: 'مدفوع',
  };
  return statusMap[status] || status;
};
