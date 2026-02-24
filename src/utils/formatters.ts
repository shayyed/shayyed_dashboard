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
