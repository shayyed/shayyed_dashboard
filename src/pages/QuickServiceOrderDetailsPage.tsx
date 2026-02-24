import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { EmptyState } from '../components/EmptyState';
import { Table } from '../components/Table';
import { ArrowRight, Star, FileText, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../services/api';
import type { QuickServiceOrder, User, Quotation, Invoice } from '../types';
import { QuickServiceOrderStatus, QuotationStatus, InvoiceStatus } from '../types';
import { mockUsers, mockQuotations, mockInvoices, mockChatThreads } from '../mock/data';
import { formatDate, formatCurrency, formatDateTime } from '../utils/formatters';

export const QuickServiceOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<QuickServiceOrder | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [acceptedQuotation, setAcceptedQuotation] = useState<Quotation | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [chatThread, setChatThread] = useState<any>(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    urgency: 'normal' as 'normal' | 'urgent',
    status: QuickServiceOrderStatus.DRAFT,
  });
  const [cancelForm, setCancelForm] = useState({ reason: '' });

  useEffect(() => {
    if (id) {
      loadOrder();
      loadRelatedData();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getQuickServiceOrder(id!);
      if (data) {
        setOrder(data);
        setEditForm({
          title: data.title || '',
          description: data.description || '',
          urgency: data.urgency || 'normal',
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    if (!id) return;
    try {
      const orderData = await adminApi.getQuickServiceOrder(id);
      if (orderData) {
        const clientData = mockUsers.find(u => u.id === orderData.clientId);
        setClient(clientData || null);

        const orderQuotations = mockQuotations.filter(q => q.requestId === id);
        setQuotations(orderQuotations);

        // Find accepted quotation
        const accepted = orderQuotations.find(q => q.status === QuotationStatus.ACCEPTED);
        setAcceptedQuotation(accepted || null);

        // Find invoice for this quick service order (using projectId field which can store QSO ID)
        const relatedInvoice = mockInvoices.find(i => i.projectId === id);
        setInvoice(relatedInvoice || null);

        const thread = mockChatThreads.find(
          t => t.relatedType === 'request' && t.relatedId === id
        );
        setChatThread(thread || null);
      }
    } catch (error) {
      console.error('Load related data error:', error);
    }
  };

  const handleUpdate = async () => {
    if (!order) return;
    try {
      setOrder({ ...order, ...editForm });
      setShowEditModal(false);
      alert('تم تحديث معلومات الطلب بنجاح');
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      setOrder({ ...order, status: QuickServiceOrderStatus.CANCELLED });
      setShowCancelModal(false);
      setCancelForm({ reason: '' });
      alert('تم إلغاء الطلب بنجاح');
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    try {
      setOrder({ ...order, status: editForm.status });
      setShowStatusModal(false);
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      alert('تم حذف الطلب بنجاح');
      navigate('/requests');
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

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الطلب غير موجود" />
      </div>
    );
  }

  const quotationsColumns = [
    {
      key: 'id',
      label: 'معرف العرض',
      render: (quotation: Quotation) => (
        <Link to={`/quotations/${quotation.id}`} className="text-blue-600 hover:underline">
          {quotation.id}
        </Link>
      ),
    },
    {
      key: 'contractorName',
      label: 'المقاول',
      render: (quotation: Quotation) => (
        <Link to={`/users/contractors/${quotation.contractorId}`} className="text-blue-600 hover:underline">
          {quotation.contractorName}
        </Link>
      ),
    },
    {
      key: 'price',
      label: 'السعر',
      render: (quotation: Quotation) => formatCurrency(quotation.price),
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (quotation: Quotation) => 
        typeof quotation.duration === 'string' 
          ? quotation.duration 
          : `${quotation.duration} ${quotation.duration === 1 ? 'ساعة' : 'ساعة'}`,
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (quotation: Quotation) => <StatusBadge status={quotation.status} />,
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (quotation: Quotation) => (
        <Link to={`/quotations/${quotation.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="secondary" onClick={() => navigate('/requests')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الطلبات
        </Button>
        <h1 className="text-2xl font-bold text-[#111111]">تفاصيل طلب الخدمة السريعة</h1>
      </div>

      {/* Order Info */}
      <Card title="معلومات الطلب">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">معرف الطلب</p>
            <p className="text-[#111111]">{order.id}</p>
          </div>
          {order.title && (
            <div>
              <p className="text-sm text-gray-600">العنوان</p>
              <p className="text-[#111111]">{order.title}</p>
            </div>
          )}
          {order.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">الوصف</p>
              <p className="text-[#111111]">{order.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">معرف الخدمة السريعة</p>
            <Link to={`/services/quick/${order.serviceId}`} className="text-blue-600 hover:underline">
              {order.serviceId}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600">اسم الخدمة السريعة</p>
            <p className="text-[#111111]">{order.serviceTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">معرف العميل</p>
            <Link to={`/users/clients/${order.clientId}`} className="text-blue-600 hover:underline">
              {order.clientId}
            </Link>
          </div>
          {order.urgency && (
            <div>
              <p className="text-sm text-gray-600">مستوى الاستعجال</p>
              <StatusBadge status={order.urgency === 'urgent' ? 'مستعجل' : 'عادي'} />
            </div>
          )}
          {order.materialsIncluded !== undefined && (
            <div>
              <p className="text-sm text-gray-600">المواد مشمولة</p>
              <span className={`text-xs px-2 py-1 rounded inline-block ${
                order.materialsIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {order.materialsIncluded ? 'مشمولة' : 'غير مشمولة'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">المدينة</p>
            <p className="text-[#111111]">{order.location.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">الحي</p>
            <p className="text-[#111111]">{order.location.district}</p>
          </div>
          {order.location.detailed && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">العنوان التفصيلي</p>
              <p className="text-[#111111]">{order.location.detailed}</p>
            </div>
          )}
          {order.scheduledDate && (
            <div>
              <p className="text-sm text-gray-600">التاريخ المجدول</p>
              <p className="text-[#111111]">{formatDate(order.scheduledDate)}</p>
            </div>
          )}
          {order.attachments && order.attachments.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">المرفقات</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {order.attachments.map((att, idx) => {
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
          <div>
            <p className="text-sm text-gray-600">الحالة</p>
            <StatusBadge status={order.status} />
          </div>
          {order.rating && (
            <div>
              <p className="text-sm text-gray-600">التقييم</p>
              <div className="flex items-center gap-1">
                <p className="text-[#111111]">{order.rating}</p>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Client Info */}
      {client && (
        <Card title="معلومات العميل">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">الاسم</p>
              <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
                {client.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600">رقم الجوال</p>
              <p className="text-[#111111]">{client.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">رقم الهوية الوطنية</p>
              <p className="text-[#111111]">{client.id}</p>
            </div>
          </div>
        </Card>
      )}


      {/* Accepted Offer - Show when status is ACCEPTED or COMPLETED */}
      {(order.status === QuickServiceOrderStatus.ACCEPTED || order.status === QuickServiceOrderStatus.COMPLETED) && acceptedQuotation && (
        <Card title="العرض المقبول">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">معرف العرض</p>
              <Link to={`/quotations/${acceptedQuotation.id}`} className="text-blue-600 hover:underline">
                {acceptedQuotation.id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600">المقاول</p>
              <Link to={`/users/contractors/${acceptedQuotation.contractorId}`} className="text-blue-600 hover:underline">
                {acceptedQuotation.contractorName}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600">السعر</p>
              <p className="text-[#111111] font-semibold text-lg">{formatCurrency(acceptedQuotation.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المدة</p>
              <p className="text-[#111111]">
                {typeof acceptedQuotation.duration === 'string' 
                  ? acceptedQuotation.duration 
                  : `${acceptedQuotation.duration} ${acceptedQuotation.duration === 1 ? 'ساعة' : 'ساعة'}`
                }
              </p>
            </div>
            {/* المواد مشمولة - يحددها العميل في الطلب، ليس في العرض - hidden from offer */}
            {/* <div>
              <p className="text-sm text-gray-600">المواد مشمولة</p>
              <span className={`text-xs px-2 py-1 rounded inline-block ${
                acceptedQuotation.materialsIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {acceptedQuotation.materialsIncluded ? 'نعم' : 'لا'}
              </span>
            </div> */}
            {acceptedQuotation.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">الملاحظات</p>
                <p className="text-[#111111]">{acceptedQuotation.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Payment/Invoice - Show when status is ACCEPTED or COMPLETED */}
      {(order.status === QuickServiceOrderStatus.ACCEPTED || order.status === QuickServiceOrderStatus.COMPLETED) && invoice && (
        <Card title="الدفع / الفاتورة">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">معرف الفاتورة</p>
              <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                {invoice.id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600">عنوان الفاتورة</p>
              <p className="text-[#111111]">{invoice.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المبلغ الاساسي</p>
              <p className="text-[#111111] font-medium">{formatCurrency(invoice.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الضريبة 15%</p>
              <p className="text-[#111111] font-medium">{formatCurrency(invoice.vatAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
              <p className="text-[#111111] font-bold text-lg">{formatCurrency(invoice.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">حالة الدفع</p>
              {invoice.status === InvoiceStatus.PAID ? (
                <StatusBadge status="PAID" customLabel="مدفوعة" />
              ) : (
                <span className="text-xs px-2 py-1 rounded inline-block bg-[#FDB022]/10 text-[#FDB022]">
                  غير مدفوعة
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ الاستحقاق</p>
              <p className="text-[#111111]">{formatDate(invoice.dueDate)}</p>
            </div>
            {invoice.status === InvoiceStatus.PAID && (
              <div className="md:col-span-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    // TODO: Open PDF invoice viewer
                    console.log('View PDF invoice:', invoice.id);
                  }}
                >
                  <FileText className="w-4 h-4 ml-2" />
                  عرض فاتورة PDF
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quotations - Show all when status is not ACCEPTED/COMPLETED, or show non-accepted when ACCEPTED/COMPLETED */}
      {quotations.length > 0 && (
        <Card title={(order.status === QuickServiceOrderStatus.ACCEPTED || order.status === QuickServiceOrderStatus.COMPLETED) ? "العروض الأخرى" : "العروض المرتبطة"}>
          {quotations.filter(q => (order.status !== QuickServiceOrderStatus.ACCEPTED && order.status !== QuickServiceOrderStatus.COMPLETED) || q.status !== QuotationStatus.ACCEPTED).length === 0 ? (
            <EmptyState title="لا توجد عروض أخرى" />
          ) : (
            <>
              <p className="mb-4 text-gray-600">عدد العروض: {quotations.filter(q => (order.status !== QuickServiceOrderStatus.ACCEPTED && order.status !== QuickServiceOrderStatus.COMPLETED) || q.status !== QuotationStatus.ACCEPTED).length}</p>
              <Table
                columns={quotationsColumns}
                data={quotations.filter(q => (order.status !== QuickServiceOrderStatus.ACCEPTED && order.status !== QuickServiceOrderStatus.COMPLETED) || q.status !== QuotationStatus.ACCEPTED)}
              />
            </>
          )}
        </Card>
      )}

      {/* Chat */}
      {chatThread && (
        <Card title="المحادثة">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عدد الرسائل غير المقروءة</p>
              <p className="text-[#111111]">{chatThread.unreadCount || 0}</p>
            </div>
            <Link to={`/chats/${chatThread.id}`} className="text-blue-600 hover:underline">
              عرض المحادثة
            </Link>
          </div>
        </Card>
      )}

      {/* Modals */}
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل معلومات الطلب"
      >
        <div className="space-y-4">
          <Input
            label="العنوان"
            value={editForm.title}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="عنوان الطلب (اختياري)"
          />
          <Input
            label="الوصف"
            value={editForm.description}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            placeholder="وصف الطلب (اختياري)"
          />
          <Select
            label="مستوى الاستعجال"
            value={editForm.urgency}
            onChange={e => setEditForm({ ...editForm, urgency: e.target.value as 'normal' | 'urgent' })}
            options={[
              { value: 'normal', label: 'عادي' },
              { value: 'urgent', label: 'مستعجل' },
            ]}
          />
          <div className="flex gap-2">
            <Button onClick={handleUpdate}>حفظ</Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="تحديث حالة الطلب"
      >
        <div className="space-y-4">
          <Select
            label="الحالة"
            value={editForm.status}
            onChange={e => setEditForm({ ...editForm, status: e.target.value as QuickServiceOrderStatus })}
            options={[
              { value: QuickServiceOrderStatus.DRAFT, label: 'مسودة' },
              { value: QuickServiceOrderStatus.SENT, label: 'مرسل' },
              { value: QuickServiceOrderStatus.CANCELLED, label: 'ملغي' },
              { value: QuickServiceOrderStatus.ACCEPTED, label: 'مقبول' },
              { value: QuickServiceOrderStatus.COMPLETED, label: 'مكتمل' },
            ]}
          />
          <div className="flex gap-2">
            <Button onClick={handleUpdateStatus}>حفظ</Button>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="إلغاء الطلب"
      >
        <div className="space-y-4">
          <Input
            label="سبب الإلغاء"
            value={cancelForm.reason}
            onChange={e => setCancelForm({ reason: e.target.value })}
            multiline
            placeholder="أدخل سبب الإلغاء..."
          />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleCancel}>
              تأكيد الإلغاء
            </Button>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
      >
        <p className="mb-4">هل أنت متأكد من حذف هذا الطلب؟</p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            حذف
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            إلغاء
          </Button>
        </div>
      </Modal>
    </div>
  );
};
