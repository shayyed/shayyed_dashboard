import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { adminApi } from '../services/api';

export const BroadcastNotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  const handleSend = async () => {
    if (!title || !body || !category || !type) return;

    try {
      setLoading(true);
      await adminApi.broadcastNotification({ title, body, category, type });
      setTitle('');
      setBody('');
      setCategory('');
      setType('');
      alert('تم إرسال الإشعار');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">إرسال إشعار</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Input
            label="العنوان"
            value={title}
            onChange={setTitle}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#111111] mb-1">المحتوى</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-[#111111] focus:outline-none focus:border-[#111111]"
              rows={6}
              required
            />
          </div>
          <Select
            label="الفئة"
            options={[
              { label: 'جميع المستخدمين', value: 'all' },
              { label: 'العملاء', value: 'clients' },
              { label: 'المقاولون', value: 'contractors' },
            ]}
            value={category}
            onChange={setCategory}
            required
          />
          <Select
            label="نوع الإشعار"
            options={[
              { label: 'عام', value: 'general' },
              { label: 'تشغيلي', value: 'operational' },
              { label: 'مالي', value: 'financial' },
            ]}
            value={type}
            onChange={setType}
            required
          />
          <Button onClick={handleSend} loading={loading}>
            إرسال
          </Button>
        </div>
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-[#111111] mb-4">معاينة الإشعار</h3>
            {title && (
              <div className="p-4 bg-[#F7F7F7] rounded-lg mb-4">
                <p className="font-semibold text-[#111111] mb-2">{title}</p>
                <p className="text-[#666666] text-sm">{body}</p>
              </div>
            )}
            {!title && <p className="text-[#666666]">ستظهر معاينة الإشعار هنا</p>}
          </Card>
        </div>
      </div>
    </div>
  );
};
