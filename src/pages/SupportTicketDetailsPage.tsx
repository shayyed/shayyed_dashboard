import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';
import type { SupportTicket, SupportTicketReply } from '../types';
import { UserRole } from '../types';
import { mockUsers } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Info, ArrowRight } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'عميل',
  CONTRACTOR: 'مقاول',
};

const SENDER_ROLE_LABELS: Record<'user' | 'support', string> = {
  user: 'المستخدم',
  support: 'الدعم',
};

export const SupportTicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const ticketData = await adminApi.getSupportTicket(id!);
      if (!ticketData) {
        setTicket(null);
        return;
      }
      setTicket(ticketData);

      // Find user
      const userData = mockUsers.find(u => u.id === ticketData.userId);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReply = async () => {
    if (!ticket || !replyContent.trim()) return;
    try {
      // TODO: API call
      const newReply: SupportTicketReply = {
        id: `reply-${Date.now()}`,
        ticketId: ticket.id,
        senderId: 'admin1', // Current admin
        senderRole: 'support',
        content: replyContent,
        createdAt: new Date().toISOString(),
      };
      setTicket({
        ...ticket,
        replies: [...(ticket.replies || []), newReply],
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
        updatedAt: new Date().toISOString(),
      });
      setReplyContent('');
      setShowReplyModal(false);
    } catch (error) {
      console.error('Save reply error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="التذكرة غير موجودة" />
      </div>
    );
  }

  const hasSupportReplies = ticket.replies && ticket.replies.some(reply => reply.senderRole === 'support');

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/support-tickets')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى تذاكر الدعم
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل تذكرة الدعم</h1>
        <p className="text-sm text-gray-600 mt-1">معرف التذكرة: {ticket.id}</p>
      </div>
      {!hasSupportReplies && (
        <div className="mb-4">
          <Button variant="primary" onClick={() => {
            setReplyContent('');
            setShowReplyModal(true);
          }}>
            الرد على التذكرة
          </Button>
        </div>
      )}

      {/* Ticket Info */}
      <Card title="معلومات التذكرة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف التذكرة</p>
            <p className="text-[#111111] font-medium">{ticket.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان</p>
            <p className="text-[#111111] font-medium">{ticket.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <StatusBadge 
              status={hasSupportReplies ? 'REPLIED' : 'AWAITING_REPLY'} 
              customLabel={hasSupportReplies ? 'تم الرد' : 'بانتظار الرد'}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111] font-medium">{formatDate(ticket.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* User Info */}
      {user && (
        <Card title="معلومات المستخدم">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">الاسم</p>
              <Link
                to={`/users/${ticket.role === UserRole.CLIENT ? 'clients' : 'contractors'}/${user.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {user.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">معرف المستخدم</p>
              <p className="text-[#111111]">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
              <p className="text-[#111111]">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الدور</p>
              <span className="text-[#111111]">{ROLE_LABELS[ticket.role]}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Messages Section - Shows initial ticket and replies */}
      <Card title={hasSupportReplies ? 'المحادثة' : 'رسالة التذكرة'}>
        <div className="space-y-4">
          {/* Initial Ticket Message from User */}
          <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
            <div className="mb-2">
              <p className="font-medium text-[#111111]">
                {user?.name || ticket.userId}
              </p>
              <p className="text-xs text-gray-500">
                المستخدم • {formatDateTime(ticket.createdAt)}
              </p>
            </div>
            <p className="text-[#111111] whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Customer Service Replies */}
          {hasSupportReplies && ticket.replies?.map((reply) => {
            if (reply.senderRole === 'support') {
              return (
                <div
                  key={reply.id}
                  className="p-4 rounded-lg border bg-blue-50 border-blue-200"
                >
                  <div className="mb-2">
                    <p className="font-medium text-[#111111]">الدعم</p>
                    <p className="text-xs text-gray-500">
                      {SENDER_ROLE_LABELS[reply.senderRole]} • {formatDateTime(reply.createdAt)}
                    </p>
                  </div>
                  <p className="text-[#111111] whitespace-pre-wrap">{reply.content}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </Card>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyContent('');
        }}
        title="الرد على التذكرة"
      >
        <div className="space-y-6">
          {/* Info Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">ملاحظة مهمة</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                بعد إرسال الرد، سيتم إرسال إشعار تلقائي إلى مقدم التذكرة وسيتم تغيير حالة التذكرة تلقائياً إلى <span className="font-semibold">تم الرد</span>.
              </p>
            </div>
          </div>

          {/* Reply Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرد <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
              placeholder="أدخل رد الدعم على التذكرة..."
              required
            />
            {replyContent.trim() && (
              <p className="mt-2 text-xs text-gray-500">
                {replyContent.trim().length} حرف
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowReplyModal(false);
                setReplyContent('');
              }}
            >
              إلغاء
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveReply} 
              disabled={!replyContent.trim()}
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
