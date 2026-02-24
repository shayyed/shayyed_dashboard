import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';
import type { Milestone } from '../types';
import { InvoiceStatus } from '../types';
import { mockContracts, mockProjects, mockInvoices, mockPayments } from '../mock/data';
import { formatDate, formatDateTime, formatSar } from '../utils/formatters';
import { ArrowRight } from 'lucide-react';

const MILESTONE_STATUS_LABELS: Record<'NotDue' | 'Due' | 'Paid', string> = {
  NotDue: 'غير مستحقة',
  Due: 'مستحقة',
  Paid: 'مدفوعة',
};

const MILESTONE_STATUS_COLORS: Record<'NotDue' | 'Due' | 'Paid', string> = {
  NotDue: 'bg-gray-100 text-gray-700',
  Due: 'bg-orange-100 text-orange-700',
  Paid: 'bg-green-100 text-green-700',
};

export const MilestoneDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [relatedInvoice, setRelatedInvoice] = useState<any>(null);
  const [relatedPayments, setRelatedPayments] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'NotDue' | 'Due' | 'Paid'>('NotDue');

  useEffect(() => {
    if (id) {
      loadMilestone();
    }
  }, [id]);

  const loadMilestone = async () => {
    try {
      setLoading(true);
      const milestoneData = await adminApi.getMilestone(id!);
      if (!milestoneData) {
        setMilestone(null);
        return;
      }
      setMilestone(milestoneData);

      // Find contract
      const contractData = await adminApi.getMilestoneContract(id!);
      if (contractData) {
        setContract(contractData);
        // Find project
        const projectData = mockProjects.find(p => p.contractId === contractData.id);
        if (projectData) {
          setProject(projectData);
          // Find related invoice (if any)
          const invoiceData = mockInvoices.find(inv => inv.projectId === projectData.id);
          if (invoiceData) {
            setRelatedInvoice(invoiceData);
            // Find related payments
            const paymentsData = mockPayments.filter(pay => pay.invoiceId === invoiceData.id);
            setRelatedPayments(paymentsData);
          }
        }
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!milestone) return;
    try {
      // TODO: API call
      navigate('/milestones');
    } catch (error) {
      console.error('Delete milestone error:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!milestone) return;
    try {
      // TODO: API call
      setMilestone({
        ...milestone,
        status: newStatus,
        paidAt: newStatus === 'Paid' ? new Date().toISOString() : undefined,
      });
      setShowUpdateStatusModal(false);
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الدفعة غير موجودة" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/milestones')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الدفعات
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الدفعة</h1>
        <p className="text-sm text-gray-600 mt-1">معرف الدفعة: {milestone.id}</p>
      </div>

      {/* Milestone Info */}
      <Card title="معلومات الدفعة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الدفعة</p>
            <p className="text-[#111111] font-medium">{milestone.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">اسم الدفعة</p>
            <p className="text-[#111111] font-medium">{milestone.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المبلغ</p>
            <p className="text-[#111111] font-medium text-lg">{formatSar(milestone.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
              {MILESTONE_STATUS_LABELS[milestone.status]}
            </span>
          </div>
          {milestone.dueDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الاستحقاق</p>
              <p className="text-[#111111] font-medium">{formatDate(milestone.dueDate)}</p>
            </div>
          )}
          {milestone.paidAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الدفع</p>
              <p className="text-[#111111] font-medium">{formatDateTime(milestone.paidAt)}</p>
            </div>
          )}
          {milestone.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">الوصف</p>
              <p className="text-[#111111] whitespace-pre-wrap">{milestone.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Project Info */}
      {project && (
        <Card title="معلومات المشروع">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">العنوان</p>
              <Link
                to={`/projects/${project.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {project.title}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">معرف المشروع</p>
              <p className="text-[#111111]">{project.id}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Related Invoice */}
      {relatedInvoice && (
        <Card title="الفاتورة المرتبطة">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم الفاتورة</p>
              <Link
                to={`/invoices/${relatedInvoice.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {relatedInvoice.id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">معرف الفاتورة</p>
              <p className="text-[#111111]">{relatedInvoice.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">العنوان</p>
              <p className="text-[#111111]">{relatedInvoice.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</p>
              <p className="text-[#111111] font-medium">{formatSar(relatedInvoice.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الحالة</p>
              {relatedInvoice.status === InvoiceStatus.PAID ? (
                <StatusBadge status="PAID" customLabel="مدفوعة" />
              ) : relatedInvoice.status === InvoiceStatus.SENT || relatedInvoice.status === InvoiceStatus.APPROVED ? (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-[#FDB022]/10 text-[#FDB022]">
                  بانتظار الدفع
                </span>
              ) : (
                <StatusBadge status={relatedInvoice.status} />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الاستحقاق</p>
              <p className="text-[#111111]">{formatDate(relatedInvoice.dueDate)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Section Title: المدفوعات */}
      {relatedPayments.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#111111]">المدفوعات</h2>
          </div>
          <Card title="المدفوعات المرتبطة">
          <div className="space-y-4">
            {relatedPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم المرجع</p>
                    <Link
                      to={`/payments/${payment.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {payment.referenceNumber || payment.id}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">المبلغ</p>
                    <p className="text-[#111111] font-medium">{formatSar(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الحالة</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                    <p className="text-[#111111]">{formatDateTime(payment.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف الدفعة"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-red-700">
              سيتم حذف هذه الدفعة بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateStatusModal}
        onClose={() => setShowUpdateStatusModal(false)}
        title="تحديث حالة الدفعة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'NotDue' | 'Due' | 'Paid')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NotDue">غير مستحقة</option>
              <option value="Due">مستحقة</option>
              <option value="Paid">مدفوعة</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowUpdateStatusModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus}>
              تأكيد التحديث
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
