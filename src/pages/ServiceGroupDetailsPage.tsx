import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { ServiceGroup, Category } from '../types';
import { mockCategories, mockSubcategories, mockRequests } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';

export const ServiceGroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<ServiceGroup | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const groupData = await adminApi.getServiceGroup(id!);
      if (!groupData) {
        setGroup(null);
        return;
      }
      setGroup(groupData);
      setCategories(groupData.categories || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoriesCount = (categoryId: string) => {
    return mockSubcategories.filter(s => s.categoryId === categoryId).length;
  };

  const getTotalSubcategoriesCount = () => {
    const categoryIds = categories.map(c => c.id);
    return mockSubcategories.filter(s => categoryIds.includes(s.categoryId)).length;
  };

  const getRequestsCount = () => {
    const subcategoryIds = mockSubcategories
      .filter(s => categories.some(c => c.id === s.categoryId))
      .map(s => s.id);
    return mockRequests.filter(r => subcategoryIds.includes(r.serviceId)).length;
  };

  const handleDelete = async () => {
    if (!group) return;
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

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="المجموعة غير موجودة" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل مجموعة الخدمات</h1>
          <p className="text-sm text-gray-600 mt-1">معرف المجموعة: {group.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            تعديل المجموعة
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            حذف المجموعة
          </Button>
        </div>
      </div>

      {/* Group Info */}
      <Card title="معلومات المجموعة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف المجموعة</p>
            <p className="text-[#111111] font-medium">{group.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الاسم</p>
            <p className="text-[#111111] font-medium">{group.name}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">الوصف</p>
            <p className="text-[#111111] whitespace-pre-wrap">{group.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الأيقونة</p>
            {group.icon ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{group.icon}</span>
                <span className="text-gray-700">{group.icon}</span>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ترتيب العرض</p>
            <p className="text-[#111111] font-medium">{group.displayOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              group.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {group.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(group.createdAt || '')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التحديث</p>
            <p className="text-[#111111]">{formatDateTime(group.updatedAt || '')}</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="الإحصائيات">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الفئات</p>
            <p className="text-2xl font-bold text-blue-700">{categories.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الفئات النشطة</p>
            <p className="text-2xl font-bold text-green-700">
              {categories.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الفئات الفرعية</p>
            <p className="text-2xl font-bold text-purple-700">{getTotalSubcategoriesCount()}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الطلبات</p>
            <p className="text-2xl font-bold text-orange-700">{getRequestsCount()}</p>
          </div>
        </div>
      </Card>

      {/* Related Categories */}
      <Card title={`الفئات المرتبطة (${categories.length})`}>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد فئات مرتبطة بهذه المجموعة
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => (
              <div
                key={category.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/services/categories/${category.id}`}
                      className="text-blue-600 hover:underline font-medium text-lg mb-2 block"
                    >
                      {category.name}
                    </Link>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">معرف الفئة:</span>
                        <span className="text-[#111111] font-medium mr-2">{category.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">عدد الفئات الفرعية:</span>
                        <span className="text-[#111111] font-medium mr-2">
                          {getSubcategoriesCount(category.id)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">ترتيب العرض:</span>
                        <span className="text-[#111111] font-medium mr-2">
                          {category.displayOrder || 0}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {category.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف المجموعة"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-red-700">
              سيتم حذف هذه المجموعة بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
              {categories.length > 0 && (
                <span className="block mt-2">
                  يوجد {categories.length} فئة مرتبطة بهذه المجموعة. يرجى التأكد من عدم وجود فئات مرتبطة قبل الحذف.
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={categories.length > 0}
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
        title="تعديل المجموعة"
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
