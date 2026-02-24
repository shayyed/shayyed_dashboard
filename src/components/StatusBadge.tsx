import React from 'react';
import { Badge } from './Badge';
import {
  RequestStatus,
  QuotationStatus,
  ProjectStatus,
  InvoiceStatus,
  PaymentStatus,
  ComplaintStatus,
  VerificationStatus,
  ZATCAStatus,
  QuickServiceOrderStatus,
} from '../types';

interface StatusBadgeProps {
  status: RequestStatus | QuotationStatus | ProjectStatus | InvoiceStatus | PaymentStatus | ComplaintStatus | VerificationStatus | ZATCAStatus | QuickServiceOrderStatus | string;
  className?: string;
  customLabel?: string; // لتجاوز التسمية الافتراضية
}

const getStatusConfig = (status: string): { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' | 'default' } => {
  // استخدام object واحد مع جميع الحالات - الأولوية للأول في حالة التكرار
  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' | 'default' }> = {
    // RequestStatus
    'DRAFT': { label: 'مسودة', variant: 'muted' },
    'SUBMITTED': { label: 'مرسلة', variant: 'default' },
    'CANCELLED': { label: 'ملغاة', variant: 'danger' },
    'ACCEPTED': { label: 'مقبولة', variant: 'success' },
    'COMPLETED': { label: 'مكتملة', variant: 'success' },
    
    // QuotationStatus - Must come before other PENDING entries
    'QUOTATION_PENDING': { label: 'بانتظار التأكيد', variant: 'warning' },
    'QUOTATION_ACCEPTED': { label: 'مقبول', variant: 'success' },
    'QUOTATION_REJECTED': { label: 'مرفوض', variant: 'danger' },
    'QUOTATION_WITHDRAWN': { label: 'منسحب', variant: 'muted' },
    // Also support direct enum values for backward compatibility
    'PENDING': { label: 'بانتظار التأكيد', variant: 'warning' }, // Default to QuotationStatus if ambiguous
    
    // ProjectStatus
    'NOT_STARTED': { label: 'لم يبدأ', variant: 'muted' },
    'IN_PROGRESS': { label: 'قيد التنفيذ', variant: 'warning' },
    'PAUSED': { label: 'متوقف', variant: 'muted' },
    'COMPLETED': { label: 'مكتمل', variant: 'success' },
    'CANCELLED': { label: 'ملغي', variant: 'danger' },
    
    // InvoiceStatus
    'DRAFT': { label: 'مسودة', variant: 'muted' },
    'SENT': { label: 'مرسلة', variant: 'default' },
    'APPROVED': { label: 'موافق عليها', variant: 'success' },
    'REJECTED': { label: 'مرفوضة', variant: 'danger' },
    'PAID': { label: 'مدفوعة', variant: 'success' },
    
    // PaymentStatus
    'PAYMENT_PENDING': { label: 'قيد الانتظار', variant: 'warning' },
    'PROCESSING': { label: 'قيد المعالجة', variant: 'warning' },
    'SUCCESS': { label: 'نجح', variant: 'success' },
    'FAILED': { label: 'فشل', variant: 'danger' },
    'REFUNDED': { label: 'مسترد', variant: 'muted' },
    
    // ComplaintStatus
    'OPEN': { label: 'مفتوحة', variant: 'warning' },
    'IN_REVIEW': { label: 'قيد المراجعة', variant: 'warning' },
    'RESOLVED': { label: 'محلولة', variant: 'success' },
    'CLOSED': { label: 'مغلقة', variant: 'muted' },
    
    // VerificationStatus
    'VERIFICATION_PENDING': { label: 'قيد المراجعة', variant: 'warning' },
    'VERIFIED': { label: 'موثق', variant: 'success' },
    'REJECTED': { label: 'مرفوض', variant: 'danger' },
    
    // ZATCAStatus
    'NOT_ISSUED': { label: 'لم تصدر', variant: 'muted' },
    'ZATCA_PENDING': { label: 'قيد الانتظار', variant: 'warning' },
    'ISSUED': { label: 'صادرة', variant: 'success' },
    'REJECTED': { label: 'مرفوضة', variant: 'danger' },
    
    // QuickServiceOrderStatus
    'DRAFT': { label: 'مسودة', variant: 'muted' },
    'SENT': { label: 'مرسل', variant: 'default' },
    'ACCEPTED': { label: 'مقبول', variant: 'success' },
    'CANCELLED': { label: 'ملغي', variant: 'danger' },
    'COMPLETED': { label: 'مكتمل', variant: 'success' },
    
    // SupportTicket Status (as defined in types/index.ts: 'open' | 'in_progress' | 'closed')
    'open': { label: 'مفتوحة', variant: 'warning' },
    'in_progress': { label: 'قيد المعالجة', variant: 'default' },
    'closed': { label: 'مغلقة', variant: 'muted' },
    
    // Reply status for Complaints and Support Tickets (display only)
    'REPLIED': { label: 'تم الرد', variant: 'success' },
    'AWAITING_REPLY': { label: 'بانتظار الرد', variant: 'warning' },
    
    // Urgency status
    'urgent': { label: 'مستعجل', variant: 'warning' },
    'normal': { label: 'عادي', variant: 'muted' },
    
    // Active/Inactive status
    'ACTIVE': { label: 'نشط', variant: 'success' },
    'INACTIVE': { label: 'غير نشط', variant: 'muted' },
  };

  return statusMap[status] || { label: status, variant: 'default' };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', customLabel }) => {
  const config = getStatusConfig(status);
  const label = customLabel || config.label;
  return <Badge label={label} variant={config.variant} className={className} />;
};
