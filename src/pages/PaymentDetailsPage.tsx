import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Payment } from '../types';
import { PaymentStatus, InvoiceStatus } from '../types';
import { mockUsers, mockInvoices, mockProjects, mockContracts } from '../mock/data';
import { formatDate, formatCurrency, formatDateTime } from '../utils/formatters';
import { ArrowRight } from 'lucide-react';

export const PaymentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  
  // Form states
  const [statusForm, setStatusForm] = useState({
    status: PaymentStatus.PENDING,
  });
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPayment(id!);
      if (data) {
        setPayment(data);
        setStatusForm({ status: data.status });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!payment) return;
    try {
      // TODO: API call
      setPayment({ ...payment, status: statusForm.status });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleRefundPayment = async () => {
    if (!payment) return;
    try {
      // TODO: API call
      const now = new Date().toISOString();
      setPayment({
        ...payment,
        status: PaymentStatus.REFUNDED,
        refundedAt: now,
        refundReason: refundReason,
        refundedBy: 'admin1', // TODO: Get from auth context
      });
      setRefundReason('');
      setShowRefundModal(false);
    } catch (error) {
      console.error('Refund error:', error);
    }
  };

  const handleRetryPayment = async () => {
    if (!payment) return;
    try {
      // TODO: API call
      setPayment({
        ...payment,
        status: PaymentStatus.PROCESSING,
        processedAt: new Date().toISOString(),
      });
      setShowRetryModal(false);
    } catch (error) {
      console.error('Retry error:', error);
    }
  };

  const handleCancelPayment = async () => {
    if (!payment) return;
    try {
      // TODO: API call
      navigate('/payments');
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الدفعة غير موجودة" />
      </div>
    );
  }

  const invoice = mockInvoices.find(i => i.id === payment.invoiceId);
  const client = invoice ? mockUsers.find(u => u.id === invoice.clientId) : null;
  const contractor = invoice ? mockUsers.find(u => u.id === invoice.contractorId) : null;
  
  // Find related milestone
  let relatedMilestone = null;
  if (invoice && invoice.milestoneId) {
    const project = mockProjects.find(p => p.id === invoice.projectId);
    if (project) {
      const contract = mockContracts.find(c => c.id === project.contractId);
      if (contract) {
        relatedMilestone = contract.milestones.find(m => m.id === invoice.milestoneId);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/payments')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى المدفوعات
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الدفعة</h1>
        <p className="text-sm text-gray-600 mt-1">
          رقم المرجع: {payment.referenceNumber || payment.id}
        </p>
      </div>

      {/* Payment Info */}
      <Card title="معلومات الدفع">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الدفع</p>
            <p className="text-[#111111] font-medium">{payment.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم المرجع</p>
            <p className="text-[#111111] font-medium">{payment.referenceNumber || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المبلغ</p>
            <p className="text-[#111111] font-medium text-lg">{formatCurrency(payment.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <StatusBadge status={payment.status} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
            <p className="text-[#111111] font-medium">{payment.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111] font-medium">{formatDate(payment.createdAt)}</p>
          </div>
          {payment.processedAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ المعالجة</p>
              <p className="text-[#111111] font-medium">{formatDateTime(payment.processedAt)}</p>
            </div>
          )}
          {payment.successAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ النجاح</p>
              <p className="text-[#111111] font-medium text-green-600">
                {formatDateTime(payment.successAt)}
              </p>
            </div>
          )}
          {payment.failedAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الفشل</p>
              <p className="text-[#111111] font-medium text-red-600">
                {formatDateTime(payment.failedAt)}
              </p>
            </div>
          )}
          {payment.refundedAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الاسترداد</p>
              <p className="text-[#111111] font-medium text-orange-600">
                {formatDateTime(payment.refundedAt)}
              </p>
            </div>
          )}
          {payment.noonPaymentId && (
            <div>
              <p className="text-sm text-gray-600 mb-1">معرف Noon Payment</p>
              <p className="text-[#111111] text-xs font-mono">{payment.noonPaymentId}</p>
            </div>
          )}
          {payment.noonReference && (
            <div>
              <p className="text-sm text-gray-600 mb-1">المرجع من Noon</p>
              <p className="text-[#111111] text-xs font-mono">{payment.noonReference}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Related Entities - First Row: Invoice and Milestone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoice && (
          <Card title="معلومات الفاتورة">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">رقم الفاتورة</p>
                <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                  {invoice.id}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">عنوان الفاتورة</p>
                <p className="text-[#111111]">{invoice.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                <p className="text-[#111111] font-medium">{formatCurrency(invoice.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                {invoice.status === InvoiceStatus.PAID ? (
                  <StatusBadge status="PAID" customLabel="مدفوعة" />
                ) : invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.APPROVED ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-[#FDB022]/10 text-[#FDB022]">
                    بانتظار الدفع
                  </span>
                ) : (
                  <StatusBadge status={invoice.status} />
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Related Milestone */}
        {relatedMilestone && invoice && (
          <Card title="الدفعة المرتبطة">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم الدفعة</p>
                {(() => {
                  const project = mockProjects.find(p => p.id === invoice.projectId);
                  if (!project) return <span className="text-gray-400">-</span>;
                  const contract = mockContracts.find(c => c.id === project.contractId);
                  if (!contract) return <span className="text-gray-400">-</span>;
                  const milestoneIndex = contract.milestones.findIndex(m => m.id === relatedMilestone!.id) + 1;
                  return (
                    <Link to={`/milestones/${relatedMilestone.id}`} className="text-blue-600 hover:underline font-medium">
                      الدفعة {milestoneIndex} - {relatedMilestone.name}
                    </Link>
                  );
                })()}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">حالة الدفعة</p>
                <span className={`text-xs px-2 py-1 rounded inline-block ${
                  relatedMilestone.status === 'Paid' ? 'bg-green-100 text-green-700' :
                  relatedMilestone.status === 'Due' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {relatedMilestone.status === 'Paid' ? 'مدفوعة' :
                   relatedMilestone.status === 'Due' ? 'مستحقة' : 'غير مستحقة'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">مبلغ الدفعة</p>
                <p className="text-[#111111] font-medium">{formatCurrency(relatedMilestone.amount)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Second Row: Client and Contractor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client && (
          <Card title="معلومات العميل">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
                  {client.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">معرف العميل</p>
                <p className="text-[#111111]">{client.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الجوال</p>
                <p className="text-[#111111]">{client.phone}</p>
              </div>
            </div>
          </Card>
        )}

        {contractor && (
          <Card title="معلومات المقاول">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link
                  to={`/users/contractors/${contractor.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {contractor.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">معرف المقاول</p>
                <p className="text-[#111111]">{contractor.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الجوال</p>
                <p className="text-[#111111]">{contractor.phone}</p>
              </div>
              {'companyName' in contractor && contractor.companyName && (
                <div>
                  <p className="text-sm text-gray-600">اسم الشركة</p>
                  <p className="text-[#111111]">{contractor.companyName}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Refund Details */}
      {payment.status === PaymentStatus.REFUNDED && (
        <Card title="تفاصيل الاسترداد">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الاسترداد</p>
              <p className="text-[#111111] font-medium">
                {payment.refundedAt ? formatDateTime(payment.refundedAt) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">المبلغ المسترد</p>
              <p className="text-[#111111] font-medium text-orange-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            {payment.refundReason && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">سبب الاسترداد</p>
                <p className="text-[#111111]">{payment.refundReason}</p>
              </div>
            )}
            {payment.refundedBy && (
              <div>
                <p className="text-sm text-gray-600 mb-1">من قام بالاسترداد</p>
                <p className="text-[#111111] font-medium">
                  {payment.refundedBy} {/* TODO: Get admin name */}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="تحديث الحالة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة *
            </label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ status: e.target.value as PaymentStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={PaymentStatus.PENDING}>قيد الانتظار</option>
              <option value={PaymentStatus.PROCESSING}>قيد المعالجة</option>
              <option value={PaymentStatus.SUCCESS}>نجح</option>
              <option value={PaymentStatus.FAILED}>فشل</option>
              <option value={PaymentStatus.REFUNDED}>مسترد</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus}>
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setRefundReason('');
        }}
        title="استرداد الدفع"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-orange-700">
              سيتم استرداد المبلغ {formatCurrency(payment.amount)} للعميل. هذا الإجراء لا يمكن
              التراجع عنه.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              سبب الاسترداد *
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل سبب الاسترداد..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRefundModal(false);
                setRefundReason('');
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundPayment}
              disabled={!refundReason.trim()}
            >
              تأكيد الاسترداد
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRetryModal}
        onClose={() => setShowRetryModal(false)}
        title="إعادة المحاولة"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            هل تريد إعادة محاولة معالجة هذه الدفعة؟ سيتم إرسال طلب الدفع مرة أخرى إلى مزود
            الدفع.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowRetryModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleRetryPayment}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
