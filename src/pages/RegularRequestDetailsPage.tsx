import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { Table } from '../components/Table';
import { ArrowRight, Star, FileText, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../services/api';
import type { ServiceRequest, User, Quotation, Project, Contract } from '../types';
import { RequestStatus, QuotationStatus } from '../types';
import { mockUsers, mockQuotations, mockProjects, mockChatThreads, mockContracts } from '../mock/data';
import { formatDate, formatDateTime, formatSar } from '../utils/formatters';

export const RegularRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [chatThread, setChatThread] = useState<any>(null);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form states
  const [cancelForm, setCancelForm] = useState({ reason: '' });

  useEffect(() => {
    if (id) {
      loadRequest();
      loadRelatedData();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRequest(id!);
      if (data) {
        setRequest(data);
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
      const requestData = await adminApi.getRequest(id);
      if (requestData) {
        const clientData = mockUsers.find(u => u.id === requestData.clientId);
        setClient(clientData || null);

        // Filter quotations to only show PENDING, ACCEPTED, and REJECTED statuses
        const requestQuotations = mockQuotations.filter(q => 
          q.requestId === id && 
          (q.status === QuotationStatus.PENDING || 
           q.status === QuotationStatus.ACCEPTED || 
           q.status === QuotationStatus.REJECTED)
        );
        setQuotations(requestQuotations);

        const relatedContract = mockContracts.find(c => c.requestId === id);
        setContract(relatedContract || null);

        const relatedProject = mockProjects.find(p => p.requestId === id);
        setProject(relatedProject || null);

        const thread = mockChatThreads.find(
          t => t.relatedType === 'request' && t.relatedId === id
        );
        setChatThread(thread || null);
      }
    } catch (error) {
      console.error('Load related data error:', error);
    }
  };

  const handleCancel = async () => {
    if (!request) return;
    try {
      setRequest({ ...request, status: RequestStatus.CANCELLED });
      setShowCancelModal(false);
      setCancelForm({ reason: '' });
      alert('تم إلغاء الطلب بنجاح');
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

  if (!request) {
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
      render: (item: any) => (
        <Link to={`/quotations/${item.id}`} className="text-blue-600 hover:underline">
          {item.id}
        </Link>
      ),
    },
    {
      key: 'contractorName',
      label: 'المقاول',
      render: (item: any) => (
        <Link to={`/users/contractors/${item.contractorId}`} className="text-blue-600 hover:underline">
          {item.contractorName}
        </Link>
      ),
    },
    {
      key: 'price',
      label: 'السعر',
      render: (item: any) => (
        <span className="text-[#111111] font-medium">{item.price}</span>
      ),
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (item: any) => (
        <span className="text-[#666666]">{item.duration}</span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (item: any) => {
        // Map statuses: PENDING -> بانتظار التأكيد, ACCEPTED -> مقبول, REJECTED -> مرفوض
        let displayStatus = item.status;
        let customLabel = '';
        if (item.status === QuotationStatus.PENDING) {
          customLabel = 'بانتظار التأكيد';
        } else if (item.status === QuotationStatus.ACCEPTED) {
          customLabel = 'مقبول';
        } else if (item.status === QuotationStatus.REJECTED) {
          customLabel = 'مرفوض';
        }
        return <StatusBadge status={displayStatus} customLabel={customLabel} />;
      },
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: any) => (
        <Link to={`/quotations/${item.id}`}>
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
        <h1 className="text-2xl font-bold text-[#111111]">تفاصيل الطلب العادي</h1>
      </div>

      {/* Request Info */}
      <Card title="معلومات الطلب">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">معرف الطلب</p>
            <p className="text-[#111111]">{request.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">العنوان</p>
            <p className="text-[#111111]">{request.title}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">الوصف</p>
            <p className="text-[#111111]">{request.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">معرف الخدمة</p>
            <Link to={`/services/subcategories/${request.serviceId}`} className="text-blue-600 hover:underline">
              {request.serviceId}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600">اسم الخدمة</p>
            <p className="text-[#111111]">{request.serviceName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">معرف العميل</p>
            <Link to={`/users/clients/${request.clientId}`} className="text-blue-600 hover:underline">
              {request.clientId}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600">مستوى الاستعجال</p>
            <StatusBadge status={request.urgency === 'urgent' ? 'مستعجل' : 'عادي'} />
          </div>
          <div>
            <p className="text-sm text-gray-600">هل لديك مخطط/تصميم؟</p>
            <p className="text-[#111111]">{request.hasDesign ? 'نعم' : 'لا'}</p>
          </div>
          {request.hasDesign && request.attachments && request.attachments.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">المخطط المرفق</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {request.attachments.map((att, idx) => {
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
            <p className="text-sm text-gray-600">المدينة</p>
            <p className="text-[#111111]">{request.location.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">الحي</p>
            <p className="text-[#111111]">{request.location.district}</p>
          </div>
          {request.location.detailed && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">العنوان التفصيلي</p>
              <p className="text-[#111111]">{request.location.detailed}</p>
            </div>
          )}
          {/* نطاق الميزانية - hidden for now */}
          {/* <div>
            <p className="text-sm text-gray-600">الميزانية</p>
            <p className="text-[#111111]">{request.budgetRange}</p>
          </div> */}
          {request.materialsIncluded !== undefined && (
            <div>
              <p className="text-sm text-gray-600">المواد مشمولة</p>
              <span className={`text-xs px-2 py-1 rounded inline-block ${
                request.materialsIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {request.materialsIncluded ? 'مشمولة' : 'غير مشمولة'}
              </span>
            </div>
          )}
          {request.startDate && (
            <div>
              <p className="text-sm text-gray-600">تاريخ البدء</p>
              <p className="text-[#111111]">{formatDate(request.startDate)}</p>
            </div>
          )}
          {request.expectedDuration && (
            <div>
              <p className="text-sm text-gray-600">المدة المتوقعة</p>
              <p className="text-[#111111]">{request.expectedDuration}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">السماح بزيارات الموقع</p>
            <p className="text-[#111111]">{request.allowSiteVisits ? 'نعم' : 'لا'}</p>
          </div>
          {request.requirements && request.requirements.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">متطلبات شائعة</p>
              <div className="flex flex-wrap gap-2">
                {request.requirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
          {request.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">ملاحظات اضافية</p>
              <p className="text-[#111111]">{request.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">الحالة</p>
            <StatusBadge status={request.status} />
          </div>
          {request.rating && (
            <div>
              <p className="text-sm text-gray-600">التقييم</p>
              <div className="flex items-center gap-1">
                <p className="text-[#111111]">{request.rating}</p>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">عدد العروض</p>
            <p className="text-[#111111]">{request.offersCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(request.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">تاريخ التحديث</p>
            <p className="text-[#111111]">{formatDateTime(request.updatedAt)}</p>
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

      {/* Client Attachments */}
      <Card title="مرفقات العميل">
        {request.attachments && request.attachments.length > 0 ? (
          <div className="space-y-2">
            {request.attachments.map((att, idx) => {
              const fileName = att.split('/').pop() || att;
              const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
              const isPDF = fileExtension === 'pdf';
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 border border-[#E5E5E5] rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isPDF ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : isImage ? (
                      <ImageIcon className="w-4 h-4 text-[#666666]" />
                    ) : null}
                    <div className="flex-1">
                      <p className="text-[#111111] font-medium">{fileName}</p>
                    </div>
                  </div>
                  <a
                    href={att}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button variant="secondary">تحميل</Button>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="لا توجد مرفقات" />
        )}
      </Card>

      {/* Quotations */}
      <Card title="العروض المرتبطة">
        {quotations.length === 0 ? (
          <EmptyState title="لا توجد عروض" />
        ) : (
          <>
            <p className="mb-4 text-gray-600">عدد العروض: {quotations.length}</p>
            <Table
              columns={quotationsColumns}
              data={quotations.map(quotation => ({
                id: quotation.id,
                contractorId: quotation.contractorId,
                contractorName: quotation.contractorName,
                price: `${quotation.price.toLocaleString()} ر.س`,
                duration: `${quotation.duration} يوم`,
                status: quotation.status,
              }))}
            />
          </>
        )}
      </Card>

      {/* Related Contract - Only show for ACCEPTED or COMPLETED status */}
      {contract && (request.status === RequestStatus.ACCEPTED || request.status === RequestStatus.COMPLETED) && (
        <Card title="العقد المرتبط">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم العقد</p>
              <Link to={`/contracts/${contract.id}`} className="text-blue-600 hover:underline">
                {contract.id}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">السعر الإجمالي</p>
              <p className="text-[#111111] font-semibold">{formatSar(contract.totalPrice)}</p>
            </div>
            <div className="pt-2">
              <Link to={`/contracts/${contract.id}`}>
                <Button variant="secondary">عرض العقد</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Related Project - Always show for ACCEPTED or COMPLETED status */}
      {(request.status === RequestStatus.ACCEPTED || request.status === RequestStatus.COMPLETED) && (
        <Card title="المشروع المرتبط">
          {project ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">معرف المشروع</p>
                <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                  {project.id}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">التقدم</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F7F7F7] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%`, backgroundColor: '#05C4AF' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#111111]">{project.progress}%</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="لا يوجد مشروع مرتبط" />
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
            <Link to={`/chats/${chatThread.id}`}>
              <Button variant="secondary">عرض المحادثة</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Modals */}
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

    </div>
  );
};
