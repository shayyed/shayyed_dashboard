import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Category } from '../types';
import { mockServiceGroups, mockSubcategories, mockRequests } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';

export const CategoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await adminApi.getCategory(id!);
      if (!categoryData) {
        setCategory(null);
        return;
      }
      setCategory(categoryData);
      setSubcategories(categoryData.subcategories || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (groupId: string) => {
    return mockServiceGroups.find(g => g.id === groupId)?.name || groupId;
  };

  const getRequestsCount = () => {
    const subcategoryIds = subcategories.map(s => s.id);
    return mockRequests.filter(r => subcategoryIds.includes(r.serviceId)).length;
  };

  const handleDelete = async () => {
    if (!category) return;
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

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="الفئة غير موجودة" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل الفئة</h1>
          <p className="text-sm text-gray-600 mt-1">معرف الفئة: {category.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            تعديل الفئة
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            حذف الفئة
          </Button>
        </div>
      </div>

      {/* Category Info */}
      <Card title="معلومات الفئة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف الفئة</p>
            <p className="text-[#111111] font-medium">{category.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الاسم</p>
            <p className="text-[#111111] font-medium">{category.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">المجموعة</p>
            <Link
              to={`/services/groups/${category.groupId}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {getGroupName(category.groupId)}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف المجموعة</p>
            <p className="text-[#111111]">{category.groupId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ترتيب العرض</p>
            <p className="text-[#111111] font-medium">{category.displayOrder || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {category.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
            <p className="text-[#111111]">{formatDateTime(category.createdAt || '')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ التحديث</p>
            <p className="text-[#111111]">{formatDateTime(category.updatedAt || '')}</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="الإحصائيات">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الفئات الفرعية</p>
            <p className="text-2xl font-bold text-purple-700">{subcategories.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الفئات الفرعية النشطة</p>
            <p className="text-2xl font-bold text-green-700">
              {subcategories.filter(s => s.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">عدد الطلبات</p>
            <p className="text-2xl font-bold text-orange-700">{getRequestsCount()}</p>
          </div>
        </div>
      </Card>

      {/* Related Subcategories */}
      <Card title={`الفئات الفرعية المرتبطة (${subcategories.length})`}>
        {subcategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد فئات فرعية مرتبطة بهذه الفئة
          </div>
        ) : (
          <div className="space-y-4">
            {subcategories.map(subcategory => (
              <div
                key={subcategory.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/services/subcategories/${subcategory.id}`}
                      className="text-blue-600 hover:underline font-medium text-lg mb-2 block"
                    >
                      {subcategory.name}
                    </Link>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">الوصف:</span>
                        <span className="text-[#111111] mr-2">
                          {subcategory.description || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">الأيقونة:</span>
                        <span className="text-[#111111] mr-2">
                          {subcategory.icon || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">ترتيب العرض:</span>
                        <span className="text-[#111111] font-medium mr-2">
                          {subcategory.displayOrder || 0}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          subcategory.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {subcategory.isActive ? 'نشط' : 'غير نشط'}
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
        title="حذف الفئة"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">تنبيه</p>
            <p className="text-sm text-red-700">
              سيتم حذف هذه الفئة بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
              {subcategories.length > 0 && (
                <span className="block mt-2">
                  يوجد {subcategories.length} فئة فرعية مرتبطة بهذه الفئة. يرجى التأكد من عدم وجود فئات فرعية مرتبطة قبل الحذف.
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
              disabled={subcategories.length > 0}
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
        title="تعديل الفئة"
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
