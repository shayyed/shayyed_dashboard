import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { adminApi } from '../services/api';
import type { Notification } from '../types';
import { UserRole } from '../types';
import { mockUsers } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';



export const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    title: '',
    body: '',
    type: 'general' as 'offer' | 'payment' | 'complaint' | 'general',
    targetType: 'all' as 'all' | 'clients' | 'contractors',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif => {
        return (
          notif.title.toLowerCase().includes(query) ||
          notif.body.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [notifications, searchQuery]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export notifications:', filteredNotifications);
  };

  // Helper function to get target users based on notification
  const getTargetUsers = (notif: Notification): 'العملاء' | 'المقاولون' | 'الكل' => {
    // Check if there are other notifications with the same title/body sent to different user types
    const sameNotifications = notifications.filter(n => 
      n.title === notif.title && 
      n.body === notif.body && 
      n.id !== notif.id
    );
    
    if (sameNotifications.length > 0) {
      const userRoles = new Set<string>();
      sameNotifications.forEach(n => {
        const user = mockUsers.find(u => u.id === n.userId);
        if (user) userRoles.add(user.role);
      });
      const currentUser = mockUsers.find(u => u.id === notif.userId);
      if (currentUser) userRoles.add(currentUser.role);
      
      if (userRoles.has(UserRole.CLIENT) && userRoles.has(UserRole.CONTRACTOR)) {
        return 'الكل';
      }
    }
    
    const user = mockUsers.find(u => u.id === notif.userId);
    if (!user) return 'الكل';
    
    return user.role === UserRole.CLIENT ? 'العملاء' : 'المقاولون';
  };

  const handleSendNotification = async () => {
    try {
      // TODO: API call
      console.log('Send notification:', sendForm);
      setShowSendModal(false);
      setSendForm({
        title: '',
        body: '',
        type: 'general',
        targetType: 'all',
      });
      loadNotifications();
    } catch (error) {
      console.error('Send notification error:', error);
    }
  };



  const columns = [
    {
      key: 'title',
      label: 'العنوان',
      render: (notif: Notification) => (
        <Link
          to={`/notifications/${notif.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {notif.title}
        </Link>
      ),
    },
    {
      key: 'body',
      label: 'المحتوى',
      render: (notif: Notification) => (
        <div className="max-w-xs truncate text-sm text-gray-600">{notif.body}</div>
      ),
    },
    {
      key: 'targetUsers',
      label: 'المستخدمون المستهدفون',
      render: (notif: Notification) => {
        const targetUsers = getTargetUsers(notif);
        return (
          <span className="text-sm text-gray-600">{targetUsers}</span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (notif: Notification) => formatDateTime(notif.createdAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (notif: Notification) => (
        <Link to={`/notifications/${notif.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة الإشعارات</h1>
        <div className="flex gap-2">
          <ExportButton onExport={handleExport} />
          <Button variant="primary" onClick={() => setShowSendModal(true)}>
            إرسال إشعار جديد
          </Button>
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث بعنوان الإشعار ..."
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredNotifications.length === 0 && !loading ? (
          <EmptyState title="لا توجد إشعارات مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredNotifications} loading={loading} />
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredNotifications.length} من {notifications.length} إشعار
        </div>
      )}

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          setSendForm({
            title: '',
            body: '',
            type: 'general',
            targetType: 'all',
            specificUsers: [],
          });
        }}
        title="إرسال إشعار جديد"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              placeholder="عنوان الإشعار"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المحتوى <span className="text-red-500">*</span>
            </label>
            <textarea
              value={sendForm.body}
              onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
              placeholder="محتوى الإشعار"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
            <select
              value={sendForm.type}
              onChange={(e) =>
                setSendForm({
                  ...sendForm,
                  type: e.target.value as 'offer' | 'payment' | 'complaint' | 'general',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="offer">عرض</option>
              <option value="payment">دفع</option>
              <option value="complaint">شكوى</option>
              <option value="general">عام</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستخدمون المستهدفون
            </label>
            <select
              value={sendForm.targetType}
              onChange={(e) =>
                setSendForm({
                  ...sendForm,
                  targetType: e.target.value as 'all' | 'clients' | 'contractors',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">الكل</option>
              <option value="clients">العملاء</option>
              <option value="contractors">المقاولون</option>
            </select>
          </div>


          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="primary"
              onClick={() => {
                setShowSendModal(false);
                setSendForm({
                  title: '',
                  body: '',
                  type: 'general',
                  targetType: 'all',
                  specificUsers: [],
                });
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleSendNotification}
              disabled={!sendForm.title || !sendForm.body}
            >
              إرسال
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
