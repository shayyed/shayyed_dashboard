import React, { useState, useEffect, useMemo } from 'react';
import { Tabs } from '../components/Tabs';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { ServiceGroup, Category, Subcategory, QuickService } from '../types';
import { IconPicker } from '../components/IconPicker';
import * as LucideIcons from 'lucide-react';

// Helper function to get icon component by name
const getIconComponent = (iconName: string) => {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || null;
};

// Helper component to render icon
const IconDisplay: React.FC<{ iconName?: string; size?: 'sm' | 'md' | 'lg' }> = ({ iconName, size = 'md' }) => {
  if (!iconName) return null;
  const IconComponent = getIconComponent(iconName);
  if (!IconComponent) return null;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return <IconComponent className={`${sizeClasses[size]} text-[#111111]`} />;
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled 
            ? 'bg-gray-200 cursor-not-allowed opacity-60' 
            : checked 
              ? 'bg-[#05C4AF] cursor-pointer' 
              : 'bg-gray-300 cursor-pointer'
        }`}
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${
            checked ? 'left-[22px]' : 'left-[2px]'
          }`}
        />
      </button>
    </div>
  );
};

function flattenSubcategoriesForGroup(group: ServiceGroup): Subcategory[] {
  const out: Subcategory[] = [];
  for (const cat of group.categories || []) {
    for (const sub of cat.subcategories || []) {
      out.push({
        ...sub,
        categoryId: sub.categoryId || cat.id,
      });
    }
  }
  return out;
}

function serviceGroupToApiPayload(g: ServiceGroup): Record<string, unknown> {
  return {
    name: g.name,
    description: g.description,
    icon: g.icon,
    isActive: g.isActive !== false,
    displayOrder: g.displayOrder ?? 0,
    categories: (g.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      isActive: c.isActive !== false,
      displayOrder: c.displayOrder ?? 0,
      subcategories: (c.subcategories || []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        icon: s.icon,
        isActive: s.isActive !== false,
        displayOrder: s.displayOrder ?? 0,
      })),
    })),
  };
}

function allCategoriesFromGroups(groups: ServiceGroup[]): Category[] {
  return groups.flatMap((gr) =>
    (gr.categories || []).map((c) => ({
      ...c,
      groupId: String(gr.id),
      subcategories: c.subcategories || [],
    }))
  );
}

// ============================================
// Regular Services Tab - المناقصات / الخدمات العادية
// ============================================

const RegularServicesTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceGroup | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    categoryId: '',
    groupId: '', // For filtering categories when adding subcategory
  });

  const mainCategorySelectOptions = useMemo(() => {
    const all = allCategoriesFromGroups(groups);
    const gid = String(subcategoryForm.groupId || '').trim();
    if (!gid) return all;
    return all.filter((c) => String(c.groupId || '') === gid);
  }, [groups, subcategoryForm.groupId]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<ServiceGroup[]> => {
    try {
      setLoading(true);
      const data = await adminApi.listServiceGroups();
      setGroups(data);
      return data;
    } catch (error) {
      console.error('Load error:', error);
      setGroups([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const persistGroup = async (g: ServiceGroup) => {
    try {
      await adminApi.replaceServiceGroup(g.id, serviceGroupToApiPayload(g));
      await loadData();
    } catch (e) {
      console.error('Save service group error:', e);
      void loadData();
    }
  };

  const getSubcategoriesForGroup = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId);
    return g ? flattenSubcategoriesForGroup(g) : [];
  };

  /** Middle categories (الفئة الرئيسية) — creates a default bucket if the group has none (e.g. new groups). */
  const openAddSubcategoryForGroup = async (group: ServiceGroup) => {
    let g = group;
    if (!(g.categories && g.categories.length > 0)) {
      try {
        setLoading(true);
        const defaultCat: Category = {
          id: `cat-${Date.now()}`,
          name: 'خدمات',
          groupId: g.id,
          isActive: true,
          displayOrder: 0,
          subcategories: [],
        };
        await adminApi.replaceServiceGroup(g.id, serviceGroupToApiPayload({ ...g, categories: [defaultCat] }));
        const refreshed = await loadData();
        const found = refreshed.find((x) => String(x.id) === String(g.id));
        if (found) g = found;
      } catch (e) {
        console.error('ensure default main category:', e);
        setLoading(false);
        return;
      }
    }
    setSubcategoryForm({
      name: '',
      description: '',
      icon: '',
      categoryId: '',
      groupId: String(g.id),
    });
    setShowAddSubcategoryModal(true);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.description.trim()) return;
    try {
      setLoading(true);
      await adminApi.createServiceGroup({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        icon: categoryForm.icon || undefined,
        isActive: true,
        displayOrder: groups.length,
        categories: [],
      });
      setCategoryForm({ name: '', description: '', icon: '' });
      setShowAddCategoryModal(false);
      await loadData();
    } catch (error) {
      console.error('Add category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;
    if (!categoryForm.name.trim() || !categoryForm.description.trim()) return;
    try {
      setLoading(true);
      const updated: ServiceGroup = {
        ...selectedCategory,
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        icon: categoryForm.icon || undefined,
      };
      await persistGroup(updated);
      setSelectedCategory(null);
      setCategoryForm({ name: '', description: '', icon: '' });
      setShowEditCategoryModal(false);
    } catch (error) {
      console.error('Edit category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!subcategoryForm.categoryId || !subcategoryForm.name.trim()) return;
    try {
      setLoading(true);
      const allCats = allCategoriesFromGroups(groups);
      const parentCat = allCats.find((c) => c.id === subcategoryForm.categoryId);
      if (!parentCat?.groupId) return;
      const gIdx = groups.findIndex((g) => g.id === parentCat.groupId);
      if (gIdx < 0) return;
      const g = groups[gIdx];
      const cats = [...(g.categories || [])];
      const ci = cats.findIndex((c) => c.id === subcategoryForm.categoryId);
      if (ci < 0) return;
      const cat = cats[ci];
      const subs = [...(cat.subcategories || [])];
      subs.push({
        id: `sub${Date.now()}`,
        name: subcategoryForm.name.trim(),
        description: subcategoryForm.description?.trim() || '',
        categoryId: cat.id,
        icon: subcategoryForm.icon || undefined,
        isActive: true,
        displayOrder: subs.length,
      });
      cats[ci] = { ...cat, subcategories: subs };
      const nextGroup: ServiceGroup = { ...g, categories: cats };
      await persistGroup(nextGroup);
      setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
      setShowAddSubcategoryModal(false);
    } catch (error) {
      console.error('Add subcategory error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubcategory = async () => {
    if (!selectedSubcategory) return;
    if (!subcategoryForm.name.trim()) return;
    try {
      setLoading(true);
      const allCats = allCategoriesFromGroups(groups);
      const parentCat = allCats.find((c) => c.id === selectedSubcategory.categoryId);
      if (!parentCat?.groupId) return;
      const gIdx = groups.findIndex((gr) => gr.id === parentCat.groupId);
      if (gIdx < 0) return;
      const g = groups[gIdx];
      const cats = (g.categories || []).map((c) => {
        if (c.id !== selectedSubcategory.categoryId) return c;
        return {
          ...c,
          subcategories: (c.subcategories || []).map((s) =>
            s.id === selectedSubcategory.id
              ? {
                  ...s,
                  name: subcategoryForm.name.trim(),
                  description: subcategoryForm.description?.trim() || '',
                  icon: subcategoryForm.icon || undefined,
                }
              : s
          ),
        };
      });
      await persistGroup({ ...g, categories: cats });
      setSelectedSubcategory(null);
      setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
      setShowEditSubcategoryModal(false);
    } catch (error) {
      console.error('Edit subcategory error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, type: 'category' | 'subcategory') => {
    if (type === 'category') {
      const idx = groups.findIndex((gr) => gr.id === id);
      if (idx < 0) return;
      const g = groups[idx];
      const wasActive = g.isActive !== false;
      const nextActive = !wasActive;
      let next: ServiceGroup;
      if (!nextActive) {
        next = {
          ...g,
          isActive: false,
          categories: (g.categories || []).map((c) => ({
            ...c,
            subcategories: (c.subcategories || []).map((s) => ({ ...s, isActive: false })),
          })),
        };
      } else {
        next = { ...g, isActive: true };
      }
      setGroups(groups.map((x, i) => (i === idx ? next : x)));
      await persistGroup(next);
      return;
    }

    const flatSubs = groups.flatMap((gr) => flattenSubcategoriesForGroup(gr));
    const subFound = flatSubs.find((s) => s.id === id);
    if (!subFound) return;
    const allCats = allCategoriesFromGroups(groups);
    const parentCat = allCats.find((c) => c.id === subFound.categoryId);
    if (!parentCat?.groupId) return;
    const parentGroup = groups.find((gr) => gr.id === parentCat.groupId);
    if (!parentGroup) return;
    const nextSubOn = !(subFound.isActive !== false);
    if (!parentGroup.isActive && nextSubOn) return;

    const gIdx = groups.findIndex((gr) => gr.id === parentCat.groupId);
    if (gIdx < 0) return;
    const g = groups[gIdx];
    const cats = (g.categories || []).map((c) => ({
      ...c,
      subcategories: (c.subcategories || []).map((s) =>
        s.id === id ? { ...s, isActive: nextSubOn } : s
      ),
    }));
    const nextGroup: ServiceGroup = { ...g, categories: cats };
    setGroups(groups.map((x, i) => (i === gIdx ? nextGroup : x)));
    await persistGroup(nextGroup);
  };

  const openEditCategory = (category: ServiceGroup) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon || '',
    });
    setShowEditCategoryModal(true);
  };

  const openEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description || '',
      icon: subcategory.icon || '',
      categoryId: subcategory.categoryId,
    });
    setShowEditSubcategoryModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111]">المناقصات / الخدمات العادية</h2>
        <Button variant="primary" onClick={() => {
          setCategoryForm({ name: '', description: '', icon: '' });
          setShowAddCategoryModal(true);
        }}>
          إضافة فئة جديدة
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="لا توجد فئات خدمات عادية" />
      ) : (
        <div className="space-y-6">
          {groups.map((category) => {
            const categorySubcategories = getSubcategoriesForGroup(category.id);
            return (
              <Card key={category.id} title="">
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-4 flex-1">
                      {category.icon && (
                        <div className="mt-1 flex items-center justify-center w-12 h-12">
                          <IconDisplay iconName={category.icon} size="lg" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-[#111111]">{category.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ToggleSwitch
                        checked={category.isActive ?? true}
                        onChange={() => {
                          void handleToggleActive(category.id, 'category');
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditCategory(category)}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            void openAddSubcategoryForGroup(category);
                          }}
                        >
                          إضافة فئة فرعية
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {categorySubcategories.length > 0 && (
                    <div className="space-y-2 pr-12">
                      {categorySubcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {subcategory.icon && (
                              <div className="mt-1">
                                <IconDisplay iconName={subcategory.icon} size="md" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-[#111111] mb-1">{subcategory.name}</h4>
                              {subcategory.description && (
                                <p className="text-sm text-gray-600">{subcategory.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <ToggleSwitch
                              checked={subcategory.isActive ?? true}
                              onChange={() => {
                                void handleToggleActive(subcategory.id, 'subcategory');
                              }}
                              disabled={!category.isActive}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditSubcategory(subcategory)}
                            >
                              تعديل
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setCategoryForm({ name: '', description: '', icon: '' });
        }}
        title="إضافة فئة جديدة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل عنوان الفئة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="أدخل وصف الفئة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={categoryForm.icon}
              onChange={(icon) => setCategoryForm({ ...categoryForm, icon })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowAddCategoryModal(false);
              setCategoryForm({ name: '', description: '', icon: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCategory}
              disabled={!categoryForm.name.trim() || !categoryForm.description.trim()}
            >
              إضافة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setSelectedCategory(null);
          setCategoryForm({ name: '', description: '', icon: '' });
        }}
        title="تعديل الفئة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={categoryForm.icon}
              onChange={(icon) => setCategoryForm({ ...categoryForm, icon })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowEditCategoryModal(false);
              setSelectedCategory(null);
              setCategoryForm({ name: '', description: '', icon: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleEditCategory}
              disabled={!categoryForm.name.trim() || !categoryForm.description.trim()}
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal
        isOpen={showAddSubcategoryModal}
        onClose={() => {
          setShowAddSubcategoryModal(false);
          setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
        }}
        title="إضافة فئة فرعية جديدة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة الرئيسية <span className="text-red-500">*</span>
            </label>
            <select
              value={subcategoryForm.categoryId}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الفئة</option>
              {mainCategorySelectOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subcategoryForm.name}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل عنوان الفئة الفرعية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title)
            </label>
            <textarea
              value={subcategoryForm.description}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="أدخل وصف الفئة الفرعية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={subcategoryForm.icon}
              onChange={(icon) => setSubcategoryForm({ ...subcategoryForm, icon })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowAddSubcategoryModal(false);
              setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSubcategory}
              disabled={!subcategoryForm.name.trim() || !subcategoryForm.categoryId}
            >
              إضافة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Subcategory Modal */}
      <Modal
        isOpen={showEditSubcategoryModal}
        onClose={() => {
          setShowEditSubcategoryModal(false);
          setSelectedSubcategory(null);
          setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
        }}
        title="تعديل الفئة الفرعية"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subcategoryForm.name}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title)
            </label>
            <textarea
              value={subcategoryForm.description}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={subcategoryForm.icon}
              onChange={(icon) => setSubcategoryForm({ ...subcategoryForm, icon })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowEditSubcategoryModal(false);
              setSelectedSubcategory(null);
              setSubcategoryForm({ name: '', description: '', icon: '', categoryId: '', groupId: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubcategory}
              disabled={!subcategoryForm.name.trim()}
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

// ============================================
// Quick Services Tab - الخدمات السريعة
// ============================================

const QuickServicesTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<QuickService[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickService | null>(null);

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    description: '',
    icon: '',
    price: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listQuickServices();
      setCategories(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.title.trim()) return;
    const price = parseFloat(categoryForm.price);
    if (!Number.isFinite(price) || price < 0) return;
    try {
      setLoading(true);
      await adminApi.createQuickService({
        title: categoryForm.title.trim(),
        description: categoryForm.description?.trim() || '',
        icon: categoryForm.icon || undefined,
        price,
        duration: '',
        isActive: true,
        displayOrder: categories.length,
      });
      setCategoryForm({ title: '', description: '', icon: '', price: '' });
      setShowAddCategoryModal(false);
      await loadData();
    } catch (error) {
      console.error('Add category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;
    if (!categoryForm.title.trim()) return;
    const price = parseFloat(categoryForm.price);
    if (!Number.isFinite(price) || price < 0) return;
    try {
      setLoading(true);
      await adminApi.patchQuickService(selectedCategory.id, {
        title: categoryForm.title.trim(),
        description: categoryForm.description?.trim() || '',
        icon: categoryForm.icon || undefined,
        price,
      });
      setSelectedCategory(null);
      setCategoryForm({ title: '', description: '', icon: '', price: '' });
      setShowEditCategoryModal(false);
      await loadData();
    } catch (error) {
      console.error('Edit category error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const row = categories.find((c) => c.id === id);
    if (!row) return;
    const next = !(row.isActive !== false);
    try {
      setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: next } : c)));
      await adminApi.patchQuickService(id, { isActive: next });
    } catch (error) {
      console.error('Toggle active error:', error);
      await loadData();
    }
  };

  const openEditCategory = (category: QuickService) => {
    setSelectedCategory(category);
    setCategoryForm({
      title: category.title,
      description: category.description || '',
      icon: category.icon || '',
      price: category.price.toString(),
    });
    setShowEditCategoryModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111]">الخدمات السريعة</h2>
        <Button variant="primary" onClick={() => {
          setCategoryForm({ title: '', description: '', icon: '', price: '' });
          setShowAddCategoryModal(true);
        }}>
          إضافة فئة جديدة
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="لا توجد فئات خدمات سريعة" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} title="">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  {category.icon && (
                    <div className="flex items-center justify-center w-12 h-12">
                      <IconDisplay iconName={category.icon} size="lg" />
                    </div>
                  )}
                  <ToggleSwitch
                    checked={category.isActive ?? true}
                    onChange={() => {
                      void handleToggleActive(category.id);
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111111] mb-1">{category.title}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  )}
                  <p className="text-lg font-bold text-[#111111]">
                    {category.price.toLocaleString()} ر.س
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditCategory(category)}
                    className="w-full"
                  >
                    تعديل
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setCategoryForm({ title: '', description: '', icon: '', price: '' });
        }}
        title="إضافة فئة جديدة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.title}
              onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل عنوان الفئة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title)
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="أدخل وصف الفئة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={categoryForm.icon}
              onChange={(icon) => setCategoryForm({ ...categoryForm, icon })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر المقدر (SAR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={categoryForm.price}
              onChange={(e) => setCategoryForm({ ...categoryForm, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowAddCategoryModal(false);
              setCategoryForm({ title: '', description: '', icon: '', price: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCategory}
              disabled={!categoryForm.title.trim() || !categoryForm.price}
            >
              إضافة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setSelectedCategory(null);
          setCategoryForm({ title: '', description: '', icon: '', price: '' });
        }}
        title="تعديل الفئة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.title}
              onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (Sub-title)
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأيقونة (Icon)
            </label>
            <IconPicker
              value={categoryForm.icon}
              onChange={(icon) => setCategoryForm({ ...categoryForm, icon })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر المقدر (SAR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={categoryForm.price}
              onChange={(e) => setCategoryForm({ ...categoryForm, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => {
              setShowEditCategoryModal(false);
              setSelectedCategory(null);
              setCategoryForm({ title: '', description: '', icon: '', price: '' });
            }}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleEditCategory}
              disabled={!categoryForm.title.trim() || !categoryForm.price}
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

// ============================================
// Main ServicesPage Component
// ============================================

export const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('regular');

  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة الخدمات</h1>
      </div>

      <Tabs
        tabs={[
          { id: 'regular', label: 'المناقصات / الخدمات العادية' },
          { id: 'quick', label: 'الخدمات السريعة' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'regular' && <RegularServicesTab />}
        {activeTab === 'quick' && <QuickServicesTab />}
      </div>
    </div>
  );
};
