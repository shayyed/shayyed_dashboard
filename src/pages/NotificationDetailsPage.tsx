import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Notification } from '../types';
import { UserRole } from '../types';
import { mockUsers, mockNotifications } from '../mock/data';
import { formatDateTime } from '../utils/formatters';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';

export const NotificationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (id) {
      loadNotification();
    }
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNotification(id!);
      setNotification(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get target users and count receivers
  const getTargetUsersInfo = (notif: Notification): { targetUsers: 'العملاء' | 'المقاولون' | 'الكل'; receiverCount: number } => {
    // Find all notifications with the same title and body
    const sameNotifications = mockNotifications.filter(n => 
      n.title === notif.title && 
      n.body === notif.body
    );
    
    const receiverCount = sameNotifications.length;
    
    // Check user roles
    const userRoles = new Set<string>();
    sameNotifications.forEach(n => {
      const user = mockUsers.find(u => u.id === n.userId);
      if (user) userRoles.add(user.role);
    });
    
    let targetUsers: 'العملاء' | 'المقاولون' | 'الكل';
    if (userRoles.has(UserRole.CLIENT) && userRoles.has(UserRole.CONTRACTOR)) {
      targetUsers = 'الكل';
    } else if (userRoles.has(UserRole.CLIENT)) {
      targetUsers = 'العملاء';
    } else {
      targetUsers = 'المقاولون';
    }
    
    return { targetUsers, receiverCount };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الإشعار غير موجود" />
      </div>
    );
  }

  const { targetUsers, receiverCount } = getTargetUsersInfo(notification);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/notifications')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الإشعارات
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الإشعار</h1>
        <p className="text-sm text-gray-600 mt-1">معرف الإشعار: {notification.id}</p>
      </div>

      {/* Notification Info */}
      <Card title="معلومات الإشعار">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الإشعار</p>
            <p className="text-[#111111] font-medium">{notification.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان</p>
            <p className="text-[#111111] font-medium">{notification.title}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">المحتوى</p>
            <p className="text-[#111111] whitespace-pre-wrap">{notification.body}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111] font-medium">{formatDateTime(notification.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">عدد المستلمين</p>
            <p className="text-[#111111] font-medium">{receiverCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع المستخدمون المستهدفون</p>
            <span className={`text-xs px-2 py-1 rounded ${
              targetUsers === 'الكل' 
                ? 'bg-purple-100 text-purple-700'
                : targetUsers === 'العملاء'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {targetUsers}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
