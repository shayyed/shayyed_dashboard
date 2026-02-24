import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Invoice, Payment } from '../types';
import { InvoiceStatus, PaymentStatus } from '../types';
import { mockUsers, mockProjects, mockPayments, mockContracts } from '../mock/data';
import { formatDate, formatCurrency, formatDateTime } from '../utils/formatters';
import { FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';

export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Form states
  const [statusForm, setStatusForm] = useState({
    status: InvoiceStatus.DRAFT,
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (id) {
      loadInvoice();
      loadRelatedData();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getInvoice(id!);
      if (data) {
        setInvoice(data);
        setStatusForm({ status: data.status });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = () => {
    if (!id) return;
    const invoicePayments = mockPayments.filter(p => p.invoiceId === id);
    setPayments(invoicePayments);
  };

  const handleUpdateStatus = async () => {
    if (!invoice) return;
    try {
      // TODO: API call
      setInvoice({ ...invoice, status: statusForm.status });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };


  const handleRejectInvoice = async () => {
    if (!invoice) return;
    try {
      // TODO: API call
      setInvoice({ ...invoice, status: InvoiceStatus.REJECTED });
      setRejectReason('');
      setShowRejectModal(false);
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    try {
      // TODO: API call
      navigate('/invoices');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الفاتورة غير موجودة" />
      </div>
    );
  }

  const project = mockProjects.find(p => p.id === invoice.projectId);
  const client = mockUsers.find(u => u.id === invoice.clientId);
  const contractor = mockUsers.find(u => u.id === invoice.contractorId);
  
  // Find related milestone
  let relatedMilestone = null;
  if (invoice.milestoneId && project) {
    const contract = mockContracts.find(c => c.id === project.contractId);
    if (contract) {
      relatedMilestone = contract.milestones.find(m => m.id === invoice.milestoneId);
    }
  }

  // Calculate payment statistics
  const totalPaid = payments
    .filter(p => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = invoice.totalAmount - totalPaid;
  const successfulPayments = payments.filter(p => p.status === PaymentStatus.SUCCESS);
  const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/invoices')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الفواتير
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">{invoice.title}</h1>
        <p className="text-sm text-gray-600 mt-1">رقم الفاتورة: {invoice.id}</p>
      </div>

      {/* Invoice Info */}
      <Card title="معلومات الفاتورة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الفاتورة</p>
            <p className="text-[#111111] font-medium">{invoice.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان</p>
            <p className="text-[#111111] font-medium">{invoice.title}</p>
          </div>
          {invoice.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">الوصف</p>
              <p className="text-[#111111]">{invoice.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">المبلغ (قبل الضريبة)</p>
            <p className="text-[#111111] font-medium">{formatCurrency(invoice.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">قيمة الضريبة (15%)</p>
            <p className="text-[#111111] font-medium">{formatCurrency(invoice.vatAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</p>
            <p className="text-[#111111] font-medium text-lg">{formatCurrency(invoice.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الاستحقاق</p>
            <p className="text-[#111111] font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
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
          {relatedMilestone && (
            <div>
              <p className="text-sm text-gray-600 mb-1">الدفعة المرتبطة</p>
              {project && (() => {
                const contract = mockContracts.find(c => c.id === project.contractId);
                if (!contract) return <span className="text-gray-400">-</span>;
                const milestoneIndex = contract.milestones.findIndex(m => m.id === relatedMilestone!.id) + 1;
                return (
                  <Link to={`/milestones/${relatedMilestone.id}`} className="text-blue-600 hover:underline">
                    الدفعة {milestoneIndex} - {relatedMilestone.name}
                  </Link>
                );
              })()}
            </div>
          )}
          {invoice.status === InvoiceStatus.PAID && invoice.paidAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الدفع</p>
              <p className="text-[#111111] font-medium text-green-600">{formatDate(invoice.paidAt)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111] font-medium">{formatDate(invoice.createdAt)}</p>
          </div>
          {invoice.attachments.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">المرفقات</p>
              <div className="flex flex-wrap gap-2">
                {invoice.attachments.map((att, idx) => {
                  const fileName = att.split('/').pop() || att;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                  const isPdf = /\.pdf$/i.test(fileName);
                  
                  return (
                    <a
                      key={idx}
                      href={att}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-[#E5E5E5] rounded hover:bg-[#F7F7F7] hover:border-[#111111] transition-colors text-[#111111]"
                    >
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-red-500" />
                      ) : isImage ? (
                        <ImageIcon className="w-4 h-4 text-[#666666]" />
                      ) : null}
                      <span className="max-w-[150px] truncate">{fileName}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Related Milestone */}
      {relatedMilestone && (
        <Card title="الدفعة المرتبطة">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">اسم الدفعة</p>
              {project && (() => {
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
              <p className="text-sm text-gray-600 mb-1">مبلغ الدفعة</p>
              <p className="text-[#111111] font-medium">{formatCurrency(relatedMilestone.amount)}</p>
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
            {relatedMilestone.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">الوصف</p>
                <p className="text-[#111111]">{relatedMilestone.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Related Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {contractor && (
          <Card title="معلومات المقاول">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link to={`/users/contractors/${contractor.id}`} className="text-blue-600 hover:underline">
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
              {'taxId' in contractor && contractor.taxId && (
                <div>
                  <p className="text-sm text-gray-600">الرقم الضريبي</p>
                  <p className="text-[#111111]">{contractor.taxId}</p>
                </div>
              )}
            </div>
          </Card>
        )}

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
      </div>

      {/* Section Title: المدفوعات */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[#111111]">المدفوعات</h2>
      </div>

      {/* Payments */}
      <Card title="المدفوعات">
        {payments.length === 0 ? (
          <EmptyState title="لا توجد مدفوعات" />
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        to={`/payments/${payment.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {payment.referenceNumber || payment.id}
                      </Link>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">المبلغ</p>
                        <p className="text-[#111111] font-medium">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">طريقة الدفع</p>
                        <p className="text-[#111111]">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">تاريخ الإنشاء</p>
                        <p className="text-[#111111]">{formatDate(payment.createdAt)}</p>
                      </div>
                      {payment.status === PaymentStatus.SUCCESS && payment.successAt && (
                        <div>
                          <p className="text-gray-600">تاريخ النجاح</p>
                          <p className="text-[#111111] text-green-600">{formatDateTime(payment.successAt)}</p>
                        </div>
                      )}
                      {payment.status === PaymentStatus.FAILED && payment.failedAt && (
                        <div>
                          <p className="text-gray-600">تاريخ الفشل</p>
                          <p className="text-[#111111] text-red-600">{formatDateTime(payment.failedAt)}</p>
                        </div>
                      )}
                      {payment.noonPaymentId && (
                        <div>
                          <p className="text-gray-600">معرف Noon Payment</p>
                          <p className="text-[#111111] text-xs">{payment.noonPaymentId}</p>
                        </div>
                      )}
                      {payment.noonReference && (
                        <div>
                          <p className="text-gray-600">المرجع من Noon</p>
                          <p className="text-[#111111] text-xs">{payment.noonReference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link to={`/payments/${payment.id}`}>
                    <Button variant="secondary">عرض التفاصيل</Button>
                  </Link>
                </div>
              </div>
            ))}
            
            {/* Payment Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-[#111111] mb-4">ملخص المدفوعات</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المدفوع</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المبلغ المتبقي</p>
                  <p className="text-lg font-semibold text-orange-600">{formatCurrency(remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المدفوعات الناجحة</p>
                  <p className="text-lg font-semibold text-[#111111]">{successfulPayments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المدفوعات الفاشلة</p>
                  <p className="text-lg font-semibold text-[#111111]">{failedPayments.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>


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
              onChange={(e) => setStatusForm({ status: e.target.value as InvoiceStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={InvoiceStatus.PAID}>مدفوعة</option>
              <option value={InvoiceStatus.SENT}>بانتظار الدفع</option>
              <option value={InvoiceStatus.APPROVED}>بانتظار الدفع</option>
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
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="رفض الفاتورة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              سبب الرفض (اختياري)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل سبب الرفض..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleRejectInvoice}>
              رفض الفاتورة
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف الفاتورة"
      >
        <div className="space-y-4">
          <p className="text-gray-600">هل أنت متأكد من حذف هذه الفاتورة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvoice}>
              حذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
