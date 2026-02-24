import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { QuickService } from '../types';
import { mockQuickServiceOrders, mockUsers } from '../mock/data';
import { formatDate, formatDateTime, formatSar } from '../utils/formatters';

export const QuickServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<QuickService | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const serviceData = await adminApi.getQuickService(id!);
      if (!serviceData) {
        setService(null);
        return;
      }
      setService(serviceData);
      
      // Load related orders
      const orders = mockQuickServiceOrders.filter(o => o.serviceId === id).slice(0, 10);
      setRelatedOrders(orders);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalOrdersCount = () => {
    return mockQuickServiceOrders.filter(o => o.serviceId === id).length;
  };

  const getActiveOrdersCount = () => {
    return mockQuickServiceOrders.filter(o => 
      o.serviceId === id && 
      (o.status === 'SENT' || o.status === 'ACCEPTED')
    ).length;
  };

  const getCompletedOrdersCount = () => {
    return mockQuickServiceOrders.filter(o => 
      o.serviceId === id && o.status === 'COMPLETED'
    ).length;
  };

  const getCancelledOrdersCount = () => {
    return mockQuickServiceOrders.filter(o => 
      o.serviceId === id && o.status === 'CANCELLED'
    ).length;
  };

  const getTotalRevenue = () => {
    const completedOrders = mockQuickServiceOrders.filter(o => 
      o.serviceId === id && o.status === 'COMPLETED'
    );
    return completedOrders.reduce((sum, o) => sum + o.price, 0);
  };

  const handleDelete = async () => {
    if (!service) return;
    try {
      // TODO: API call
      navigate('/services');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleCopy = async () => {
    if (!service) return;
    try {
      // TODO: API call to create copy
      setShowCopyModal(false);
      // Navigate to edit page of new service
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الخدمة السريعة غير موجودة" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الخدمة السريعة</h1>
          <p className="text-sm text-gray-600 mt-1">معرف الخدمة: {service.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            تعديل الخدمة
          </Button>
          <Button variant="secondary" onClick={() => setShowCopyModal(true)}>
            نسخ الخدمة
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            حذف الخدمة
          </Button>
        </div>
      </div>

      {/* Service Info */}
      <Card title="معلومات الخدمة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الخدمة</p>
            <p className="text-[#111111] font-medium">{service.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان</p>
            <p className="text-[#111111] font-medium">{service.title}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">الوصف</p>
            <p className="text-[#111111] whitespace-pre-wrap">{service.description || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الأيقونة</p>
            {service.icon ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{service.icon}</span>
                <span className="text-gray-700">{service.icon}</span>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">السعر</p>
            <p className="text-[#111111] font-medium text-lg">{formatSar(service.price)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المدة</p>
            <p className="text-[#111111] font-medium">{service.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ترتيب العرض</p>
            <p className="text-[#111111] font-medium">{service.displayOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              service.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {service.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(service.createdAt || '')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التحديث</p>
            <p className="text-[#111111]">{formatDateTime(service.updatedAt || '')}</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="الإحصائيات">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الطلبات (إجمالي)</p>
            <p className="text-2xl font-bold text-blue-700">{getTotalOrdersCount()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات النشطة</p>
            <p className="text-2xl font-bold text-green-700">{getActiveOrdersCount()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات المكتملة</p>
            <p className="text-2xl font-bold text-purple-700">{getCompletedOrdersCount()}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات الملغاة</p>
            <p className="text-2xl font-bold text-red-700">{getCancelledOrdersCount()}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-orange-700">{formatSar(getTotalRevenue())}</p>
          </div>
        </div>
      </Card>

      {/* Related Orders */}
      <Card title={`الطلبات المرتبطة (آخر 10)`}>
        {relatedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات مرتبطة بهذه الخدمة السريعة
          </div>
        ) : (
          <div className="space-y-4">
            {relatedOrders.map(order => {
              const client = mockUsers.find(u => u.id === order.clientId);
              return (
                <div
                  key={order.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/requests/quick/${order.id}`}
                        className="text-blue-600 hover:underline font-medium text-lg mb-2 block"
                      >
                        {order.title || order.serviceTitle}
                      </Link>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">العميل:</span>
                          <Link
                            to={`/users/clients/${order.clientId}`}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            {client?.name || order.clientId}
                          </Link>
                        </div>
                        {order.contractorId && (
                          <div>
                            <span className="text-gray-600">المقاول:</span>
                            <Link
                              to={`/users/contractors/${order.contractorId}`}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              {order.contractorName || order.contractorId}
                            </Link>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">الحالة:</span>
                          <span className="text-[#111111] mr-2">{order.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تاريخ الإنشاء:</span>
                          <span className="text-[#111111] mr-2">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف الخدمة السريعة"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-red-700">
              سيتم حذف هذه الخدمة السريعة بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>

      {/* Copy Modal */}
      <Modal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        title="نسخ الخدمة"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            سيتم إنشاء نسخة جديدة من هذه الخدمة السريعة بنفس البيانات. يمكنك تعديل البيانات بعد الإنشاء.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCopyModal(false)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleCopy}
            >
              تأكيد النسخ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal - Placeholder */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الخدمة السريعة"
      >
        <div className="space-y-4">
          <p className="text-gray-700">نموذج التعديل سيتم إضافته لاحقاً</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
