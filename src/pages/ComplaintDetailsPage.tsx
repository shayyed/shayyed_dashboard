import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Complaint } from '../types';
import { ComplaintType } from '../types';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Info, ArrowRight } from 'lucide-react';

function complaintDisplayRef(c: Complaint): string {
  return (c.publicReference && c.publicReference.trim()) || c.id;
}

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
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

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
    if (!complaint || !responseText.trim()) return;
    setReplyError(null);
    setReplySubmitting(true);
    try {
      const updated = await adminApi.respondComplaint(complaint.id, responseText.trim());
      setComplaint(updated);
      setResponseText(updated.response || '');
      setShowResponseModal(false);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'تعذر حفظ الرد. تحقق من الاتصال وحاول مرة أخرى.';
      setReplyError(msg);
      console.error('Save response error:', error);
    } finally {
      setReplySubmitting(false);
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

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/complaints')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الشكاوى
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الشكوى</h1>
        <p className="text-sm text-gray-600 mt-1">رقم الشكوى: {complaintDisplayRef(complaint)}</p>
      </div>
      {!complaint.response && (
        <div className="mb-4">
          <Button
            variant="primary"
            onClick={() => {
              setReplyError(null);
              setShowResponseModal(true);
            }}
          >
            الرد على الشكوى
          </Button>
        </div>
      )}

      {/* Complaint Info */}
      <Card title="معلومات الشكوى">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم الشكوى</p>
            <p className="text-[#111111] font-medium">{complaintDisplayRef(complaint)}</p>
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

      {(complaint.requestId && (complaint.requestTitle || '').trim()) ||
      (complaint.projectId && (complaint.projectTitle || '').trim()) ? (
        <Card title="الطلب والمشروع">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaint.requestId && (complaint.requestTitle || '').trim() ? (
              <>
                <div>
                  <p className="text-sm text-gray-600">عنوان الطلب</p>
                  <Link
                    to={`/requests/regular/${complaint.requestId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {complaint.requestTitle}
                  </Link>
                </div>
                {complaint.requestReference ? (
                  <div>
                    <p className="text-sm text-gray-600">رقم مرجع الطلب</p>
                    <p className="text-[#111111] font-medium">{complaint.requestReference}</p>
                  </div>
                ) : null}
              </>
            ) : null}
            {complaint.projectId ? (
              <div className={complaint.requestId ? 'md:col-span-2' : ''}>
                <p className="text-sm text-gray-600">المشروع</p>
                <Link
                  to={`/projects/${complaint.projectId}`}
                  className="text-blue-600 hover:underline"
                >
                  {(complaint.projectTitle || '').trim() || 'عرض المشروع'}
                </Link>
                {complaint.projectReference ? (
                  <p className="text-sm text-gray-600 mt-1">
                    رقم المشروع:{' '}
                    <span className="text-[#111111] font-medium">{complaint.projectReference}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complaint.clientId && (complaint.clientName || '').trim() ? (
          <Card title="معلومات العميل">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link
                  to={`/users/clients/${complaint.clientId}`}
                  className="text-blue-600 hover:underline"
                >
                  {complaint.clientName}
                </Link>
              </div>
              {complaint.clientReference ? (
                <div>
                  <p className="text-sm text-gray-600">رقم مرجع الحساب</p>
                  <p className="text-[#111111] font-medium">{complaint.clientReference}</p>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        {complaint.contractorId && (complaint.contractorName || '').trim() ? (
          <Card title="معلومات المقاول">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم / الشركة</p>
                <Link
                  to={`/users/contractors/${complaint.contractorId}`}
                  className="text-blue-600 hover:underline"
                >
                  {complaint.contractorName}
                </Link>
              </div>
              {complaint.contractorReference ? (
                <div>
                  <p className="text-sm text-gray-600">رقم مرجع الحساب</p>
                  <p className="text-[#111111] font-medium">{complaint.contractorReference}</p>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}
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
            {(complaint.respondedByName || complaint.respondedBy) && (
              <div>
                <p className="text-sm text-gray-600 mb-1">من قام بالرد</p>
                <p className="text-[#111111] font-medium">
                  {complaint.respondedByName || complaint.respondedBy}
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

          {replyError ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              {replyError}
            </div>
          ) : null}

          {/* Reply Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرد <span className="text-red-500">*</span>
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={8}
              disabled={replySubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y disabled:opacity-60"
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
              disabled={!responseText.trim() || replySubmitting}
              className="min-w-[120px]"
            >
              {replySubmitting ? 'جاري الإرسال...' : 'إرسال وحفظ'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
