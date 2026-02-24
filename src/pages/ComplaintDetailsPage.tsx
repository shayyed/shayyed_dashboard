import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Complaint } from '../types';
import { ComplaintType, ComplaintStatus } from '../types';
import { mockUsers, mockProjects, mockRequests } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Info, ArrowRight } from 'lucide-react';

const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  [ComplaintType.DELAY]: 'تأخير',
  [ComplaintType.QUALITY]: 'جودة',
  [ComplaintType.SCOPE]: 'نطاق العمل',
  [ComplaintType.PAYMENT]: 'فواتير/دفع',
  [ComplaintType.OTHER]: 'أخرى',
};

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  // Modals
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Form states
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (id) {
      loadComplaint();
    }
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplaint(id!);
      if (data) {
        setComplaint(data);
        setResponseText(data.response || '');
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!complaint) return;
    try {
      // TODO: API call
      const now = new Date().toISOString();
      setComplaint({
        ...complaint,
        response: responseText,
        respondedAt: now,
        respondedBy: 'admin1', // TODO: Get from auth context
        status: ComplaintStatus.IN_REVIEW,
      });
      setShowResponseModal(false);
    } catch (error) {
      console.error('Save response error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الشكوى غير موجودة" />
      </div>
    );
  }

  const project = mockProjects.find(p => p.id === complaint.projectId);
  const client = mockUsers.find(u => u.id === complaint.clientId);
  const contractor = mockUsers.find(u => u.id === complaint.contractorId);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/complaints')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الشكاوى
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الشكوى</h1>
        <p className="text-sm text-gray-600 mt-1">
          معرف الشكوى: {complaint.id}
        </p>
      </div>
      {!complaint.response && (
        <div className="mb-4">
          <Button variant="primary" onClick={() => setShowResponseModal(true)}>
            الرد على الشكوى
          </Button>
        </div>
      )}

      {/* Complaint Info */}
      <Card title="معلومات الشكوى">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الشكوى</p>
            <p className="text-[#111111] font-medium">{complaint.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">النوع</p>
            <span className="text-[#111111] font-medium">
              {COMPLAINT_TYPE_LABELS[complaint.type]}
            </span>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">الوصف</p>
            <p className="text-[#111111] whitespace-pre-wrap">{complaint.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <StatusBadge 
              status={complaint.response ? 'REPLIED' : 'AWAITING_REPLY'} 
              customLabel={complaint.response ? 'تم الرد' : 'بانتظار الرد'}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111] font-medium">{formatDate(complaint.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Complaint Direction */}
      <Card>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#111111]">
            {complaint.raisedBy === 'CLIENT' 
              ? 'شكوى من العميل إلى المقاول'
              : 'شكوى من المقاول إلى العميل'}
          </p>
        </div>
      </Card>

      {/* Related Entities */}
      {project && (() => {
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? (
          <Card title="معلومات الطلب">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">عنوان الطلب</p>
                <Link to={`/requests/regular/${request.id}`} className="text-blue-600 hover:underline">
                  {request.title}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">معرف الطلب</p>
                <p className="text-[#111111]">{request.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                <StatusBadge status={request.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600">اسم الخدمة</p>
                <p className="text-[#111111]">{request.serviceName}</p>
              </div>
            </div>
          </Card>
        ) : null;
      })()}

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

      {/* Response Section */}
      {complaint.response && (
        <Card title="الرد من الإدارة">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">الرد</p>
              <p className="text-[#111111] whitespace-pre-wrap">{complaint.response}</p>
            </div>
            {complaint.respondedAt && (
              <div>
                <p className="text-sm text-gray-600 mb-1">تاريخ الرد</p>
                <p className="text-[#111111] font-medium">
                  {formatDateTime(complaint.respondedAt)}
                </p>
              </div>
            )}
            {complaint.respondedBy && (
              <div>
                <p className="text-sm text-gray-600 mb-1">من قام بالرد</p>
                <p className="text-[#111111] font-medium">
                  {complaint.respondedBy} {/* TODO: Get admin name */}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          if (complaint) {
            setResponseText(complaint.response || '');
          }
        }}
        title="الرد على الشكوى"
      >
        <div className="space-y-6">
          {/* Info Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">ملاحظة مهمة</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                بعد إرسال الرد، سيتم إرسال إشعار تلقائي إلى مقدم الشكوى وسيتم تغيير حالة الشكوى تلقائياً إلى <span className="font-semibold">تم الرد</span>.
              </p>
            </div>
          </div>

          {/* Reply Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرد <span className="text-red-500">*</span>
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
              placeholder="أدخل رد الإدارة على الشكوى..."
              required
            />
            {responseText.trim() && (
              <p className="mt-2 text-xs text-gray-500">
                {responseText.trim().length} حرف
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowResponseModal(false);
                if (complaint) {
                  setResponseText(complaint.response || '');
                }
              }}
            >
              إلغاء
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveResponse} 
              disabled={!responseText.trim()}
              className="min-w-[120px]"
            >
              إرسال وحفظ
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
