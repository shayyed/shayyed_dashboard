import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Subcategory } from '../types';
import { mockCategories, mockServiceGroups, mockRequests, mockUsers } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';

export const SubcategoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [relatedRequests, setRelatedRequests] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadSubcategory();
    }
  }, [id]);

  const loadSubcategory = async () => {
    try {
      setLoading(true);
      const subcategoryData = await adminApi.getSubcategory(id!);
      if (!subcategoryData) {
        setSubcategory(null);
        return;
      }
      setSubcategory(subcategoryData);
      
      // Load related requests
      const requests = mockRequests.filter(r => r.serviceId === id).slice(0, 10);
      setRelatedRequests(requests);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getGroupName = (categoryId: string) => {
    const category = mockCategories.find(c => c.id === categoryId);
    if (!category) return '-';
    return mockServiceGroups.find(g => g.id === category.groupId)?.name || '-';
  };

  const getGroupId = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.groupId || '';
  };

  const getTotalRequestsCount = () => {
    return mockRequests.filter(r => r.serviceId === id).length;
  };

  const getActiveRequestsCount = () => {
    return mockRequests.filter(r => 
      r.serviceId === id && 
      (r.status === 'SUBMITTED' || r.status === 'ACCEPTED')
    ).length;
  };

  const getCompletedRequestsCount = () => {
    return mockRequests.filter(r => 
      r.serviceId === id && r.status === 'COMPLETED'
    ).length;
  };

  const getCancelledRequestsCount = () => {
    return mockRequests.filter(r => 
      r.serviceId === id && r.status === 'CANCELLED'
    ).length;
  };

  const handleDelete = async () => {
    if (!subcategory) return;
    try {
      // TODO: API call
      navigate('/services');
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

  if (!subcategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الفئة الفرعية غير موجودة" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الفئة الفرعية</h1>
          <p className="text-sm text-gray-600 mt-1">معرف الفئة الفرعية: {subcategory.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            تعديل الفئة الفرعية
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            حذف الفئة الفرعية
          </Button>
        </div>
      </div>

      {/* Subcategory Info */}
      <Card title="معلومات الفئة الفرعية">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الفئة الفرعية</p>
            <p className="text-[#111111] font-medium">{subcategory.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الاسم</p>
            <p className="text-[#111111] font-medium">{subcategory.name}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">الوصف</p>
            <p className="text-[#111111] whitespace-pre-wrap">{subcategory.description || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الأيقونة</p>
            {subcategory.icon ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{subcategory.icon}</span>
                <span className="text-gray-700">{subcategory.icon}</span>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الفئة</p>
            <Link
              to={`/services/categories/${subcategory.categoryId}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {getCategoryName(subcategory.categoryId)}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الفئة</p>
            <p className="text-[#111111]">{subcategory.categoryId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المجموعة</p>
            <Link
              to={`/services/groups/${getGroupId(subcategory.categoryId)}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {getGroupName(subcategory.categoryId)}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ترتيب العرض</p>
            <p className="text-[#111111] font-medium">{subcategory.displayOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              subcategory.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {subcategory.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(subcategory.createdAt || '')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التحديث</p>
            <p className="text-[#111111]">{formatDateTime(subcategory.updatedAt || '')}</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="الإحصائيات">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الطلبات (إجمالي)</p>
            <p className="text-2xl font-bold text-blue-700">{getTotalRequestsCount()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات النشطة</p>
            <p className="text-2xl font-bold text-green-700">{getActiveRequestsCount()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات المكتملة</p>
            <p className="text-2xl font-bold text-purple-700">{getCompletedRequestsCount()}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">الطلبات الملغاة</p>
            <p className="text-2xl font-bold text-red-700">{getCancelledRequestsCount()}</p>
          </div>
        </div>
      </Card>

      {/* Related Requests */}
      <Card title={`الطلبات المرتبطة (آخر 10)`}>
        {relatedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات مرتبطة بهذه الفئة الفرعية
          </div>
        ) : (
          <div className="space-y-4">
            {relatedRequests.map(request => {
              const client = mockUsers.find(u => u.id === request.clientId);
              return (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/requests/regular/${request.id}`}
                        className="text-blue-600 hover:underline font-medium text-lg mb-2 block"
                      >
                        {request.title}
                      </Link>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">العميل:</span>
                          <Link
                            to={`/users/clients/${request.clientId}`}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            {client?.name || request.clientId}
                          </Link>
                        </div>
                        <div>
                          <span className="text-gray-600">الحالة:</span>
                          <span className="text-[#111111] mr-2">{request.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تاريخ الإنشاء:</span>
                          <span className="text-[#111111] mr-2">
                            {formatDateTime(request.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">عدد العروض:</span>
                          <span className="text-[#111111] font-medium mr-2">
                            {request.offersCount || 0}
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
        title="حذف الفئة الفرعية"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-red-700">
              سيتم حذف هذه الفئة الفرعية بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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

      {/* Edit Modal - Placeholder */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الفئة الفرعية"
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
