import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { formatDateTime } from '../utils/formatters';

const PROMO_CODES_KEY = 'shayyed_promo_codes';

export interface PromoCode {
  id: string;
  title: string;
  code: string;
  discountRate: number;
  isActive: boolean;
  createdAt: string;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
      checked ? 'bg-[#05C4AF]' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
        checked ? 'left-[22px]' : 'left-[2px]'
      }`}
    />
  </button>
);

export const PromoCodesPage: React.FC = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({ title: '', code: '', discountRate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROMO_CODES_KEY);
      if (stored) {
        setPromos(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const savePromos = (next: PromoCode[]) => {
    setPromos(next);
    localStorage.setItem(PROMO_CODES_KEY, JSON.stringify(next));
  };

  const handleCreate = () => {
    setError('');
    const title = form.title.trim();
    const code = form.code.trim().toUpperCase();
    const rate = parseFloat(form.discountRate);

    if (!title) {
      setError('يرجى إدخال العنوان');
      return;
    }
    if (!code) {
      setError('يرجى إدخال رمز العرض');
      return;
    }
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      setError('يرجى إدخال نسبة خصم صحيحة (1-100)');
      return;
    }
    if (promos.some((p) => p.code.toUpperCase() === code)) {
      setError('رمز العرض موجود مسبقاً');
      return;
    }

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      title,
      code,
      discountRate: rate,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    savePromos([...promos, newPromo]);
    setForm({ title: '', code: '', discountRate: '' });
  };

  const handleToggle = (id: string) => {
    savePromos(
      promos.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const columns = [
    { key: 'title', label: 'العنوان', render: (p: PromoCode) => p.title },
    { key: 'code', label: 'الرمز', render: (p: PromoCode) => <span className="font-mono font-medium">{p.code}</span> },
    { key: 'discountRate', label: 'نسبة الخصم', render: (p: PromoCode) => `${p.discountRate}%` },
    { key: 'createdAt', label: 'تاريخ الإنشاء', render: (p: PromoCode) => formatDateTime(p.createdAt) },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (p: PromoCode) => (
        <ToggleSwitch checked={p.isActive} onChange={() => handleToggle(p.id)} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111111]">العروض الترويجية</h1>

      <Card title="إنشاء عرض ترويجي جديد">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">العنوان</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: اليوم الوطني"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-[#111111]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">رمز العرض</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="مثال: KSA99"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-[#111111] font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">نسبة الخصم (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.discountRate}
              onChange={(e) => setForm({ ...form, discountRate: e.target.value })}
              placeholder="مثال: 10"
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-[#111111]"
            />
          </div>
        </div>
        {error && <p className="text-sm text-[#D34D72] mb-2">{error}</p>}
        <Button variant="primary" onClick={handleCreate}>
          إنشاء العرض الترويجي
        </Button>
      </Card>

      <Card title="جميع العروض الترويجية">
        {promos.length === 0 ? (
          <p className="text-[#666666] text-center py-8">لا توجد عروض ترويجية حالياً.</p>
        ) : (
          <Table columns={columns} data={promos} loading={false} />
        )}
      </Card>
    </div>
  );
};
