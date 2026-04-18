import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Payment } from '../types';
import { PaymentStatus } from '../types';
import { formatDate, formatCurrency, getInvoiceDisplayNumber } from '../utils/formatters';

function paymentDisplayRef(p: Payment): string {
  return (p.referenceNumber && p.referenceNumber.trim()) || p.id;
}

const TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'قيد الانتظار', value: PaymentStatus.PENDING },
  { label: 'قيد المعالجة', value: PaymentStatus.PROCESSING },
  { label: 'نجحت', value: PaymentStatus.SUCCESS },
  { label: 'فشلت', value: PaymentStatus.FAILED },
  { label: 'مستردة', value: PaymentStatus.REFUNDED },
];

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    paymentMethod: '',
    invoice: '',
    client: '',
    contractor: '',
    amountMin: '',
    amountMax: '',
    createdFrom: '',
    createdTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [activeTab]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listPayments();
      setPayments(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique options for searchable selects
  const uniqueInvoices = useMemo(() => {
    const invoices = payments
      .filter(p => p.invoiceId)
      .map(p => ({
        label: `${getInvoiceDisplayNumber({ id: p.invoiceId, invoiceNumber: p.invoiceNumber })}${
          p.invoiceTitle ? ` — ${p.invoiceTitle}` : ''
        }`,
        value: p.invoiceId,
      }));
    const unique = Array.from(new Map(invoices.map(inv => [inv.value, inv])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [payments]);

  const uniqueClients = useMemo(() => {
    const clients = payments
      .filter(p => p.clientId && (p.clientName || '').trim())
      .map(p => ({ label: p.clientName!.trim(), value: p.clientId! }));
    const unique = Array.from(new Map(clients.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [payments]);

  const uniqueContractors = useMemo(() => {
    const contractors = payments
      .filter(p => p.contractorId && (p.contractorName || '').trim())
      .map(p => ({ label: p.contractorName!.trim(), value: p.contractorId! }));
    const unique = Array.from(new Map(contractors.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const invNo = getInvoiceDisplayNumber({
          id: p.invoiceId,
          invoiceNumber: p.invoiceNumber,
        }).toLowerCase();
        return (
          p.id.toLowerCase().includes(query) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(query)) ||
          (p.noonPaymentId && p.noonPaymentId.toLowerCase().includes(query)) ||
          (p.noonReference && p.noonReference.toLowerCase().includes(query)) ||
          (p.invoiceId && p.invoiceId.toLowerCase().includes(query)) ||
          invNo.includes(query) ||
          (p.invoiceTitle && p.invoiceTitle.toLowerCase().includes(query)) ||
          (p.clientName && p.clientName.toLowerCase().includes(query)) ||
          (p.contractorName && p.contractorName.toLowerCase().includes(query)) ||
          (p.milestoneLabel && p.milestoneLabel.toLowerCase().includes(query))
        );
      });
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(p => p.paymentMethod === filters.paymentMethod);
    }

    // Invoice filter
    if (filters.invoice) {
      filtered = filtered.filter(p => p.invoiceId === filters.invoice);
    }

    // Client filter
    if (filters.client) {
      filtered = filtered.filter(p => p.clientId === filters.client);
    }

    // Contractor filter
    if (filters.contractor) {
      filtered = filtered.filter(p => p.contractorId === filters.contractor);
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter(p => p.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(p => p.amount <= Number(filters.amountMax));
    }

    // Created date range filter
    if (filters.createdFrom) {
      filtered = filtered.filter(p => p.createdAt >= filters.createdFrom);
    }
    if (filters.createdTo) {
      filtered = filtered.filter(p => p.createdAt <= filters.createdTo);
    }

    return filtered;
  }, [payments, activeTab, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export payments:', filteredPayments);
  };

  const resetFilters = () => {
    setFilters({
      paymentMethod: '',
      invoice: '',
      client: '',
      contractor: '',
      amountMin: '',
      amountMax: '',
      createdFrom: '',
      createdTo: '',
    });
    setSearchQuery('');
  };

  const columns = [
    {
      key: 'referenceNumber',
      label: 'رقم المرجع',
      render: (payment: Payment) => (
        <Link to={`/payments/${payment.id}`} className="text-blue-600 hover:underline">
          {paymentDisplayRef(payment)}
        </Link>
      ),
    },
    {
      key: 'invoice',
      label: 'الفاتورة',
      render: (payment: Payment) =>
        payment.invoiceId ? (
          <Link to={`/invoices/${payment.invoiceId}`} className="text-blue-600 hover:underline">
            {getInvoiceDisplayNumber({
              id: payment.invoiceId,
              invoiceNumber: payment.invoiceNumber,
            })}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'milestone',
      label: 'الدفعة المرتبطة',
      render: (payment: Payment) =>
        payment.milestoneLabel && payment.milestoneLabel.trim() ? (
          <span className="text-[#111111]">{payment.milestoneLabel}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'client',
      label: 'العميل',
      render: (payment: Payment) =>
        payment.clientId && (payment.clientName || '').trim() ? (
          <Link to={`/users/clients/${payment.clientId}`} className="text-blue-600 hover:underline">
            {payment.clientName}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (payment: Payment) =>
        payment.contractorId && (payment.contractorName || '').trim() ? (
          <Link
            to={`/users/contractors/${payment.contractorId}`}
            className="text-blue-600 hover:underline"
          >
            {payment.contractorName}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (payment: Payment) => (
        <span className="font-medium">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (payment: Payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: 'paymentMethod',
      label: 'طريقة الدفع',
      render: (payment: Payment) => payment.paymentMethod,
    },
    {
      key: 'noonPaymentId',
      label: 'معرف Noon Payment',
      render: (payment: Payment) => (
        <span className="text-xs text-gray-600">{payment.noonPaymentId || '-'}</span>
      ),
    },
    {
      key: 'noonReference',
      label: 'المرجع من Noon',
      render: (payment: Payment) => (
        <span className="text-xs text-gray-600">{payment.noonReference || '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (payment: Payment) => formatDate(payment.createdAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (payment: Payment) => (
        <Link to={`/payments/${payment.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة المدفوعات</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث في رقم المرجع، رقم المرجع من Noon، رقم الفاتورة..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'select',
            key: 'paymentMethod',
            label: 'طريقة الدفع',
            options: [
              { label: 'الكل', value: '' },
              { label: 'بطاقة ائتمانية', value: 'بطاقة ائتمانية' },
              { label: 'مدى', value: 'مدى' },
              { label: 'Apple Pay', value: 'Apple Pay' },
            ],
            value: filters.paymentMethod,
            onChange: (value) => setFilters({ ...filters, paymentMethod: value }),
          },
          {
            type: 'searchable-select',
            key: 'invoice',
            label: 'الفاتورة',
            options: uniqueInvoices,
            value: filters.invoice,
            onChange: (value) => setFilters({ ...filters, invoice: value }),
          },
          {
            type: 'searchable-select',
            key: 'client',
            label: 'العميل',
            options: uniqueClients,
            value: filters.client,
            onChange: (value) => setFilters({ ...filters, client: value }),
          },
          {
            type: 'searchable-select',
            key: 'contractor',
            label: 'المقاول',
            options: uniqueContractors,
            value: filters.contractor,
            onChange: (value) => setFilters({ ...filters, contractor: value }),
          },
          {
            type: 'number',
            key: 'amountMin',
            label: 'المبلغ الأدنى (ر.س)',
            value: filters.amountMin,
            onChange: (value) => setFilters({ ...filters, amountMin: value }),
          },
          {
            type: 'number',
            key: 'amountMax',
            label: 'المبلغ الأعلى (ر.س)',
            value: filters.amountMax,
            onChange: (value) => setFilters({ ...filters, amountMax: value }),
          },
          {
            type: 'date',
            key: 'createdFrom',
            label: 'تاريخ الإنشاء من',
            value: filters.createdFrom,
            onChange: (value) => setFilters({ ...filters, createdFrom: value }),
          },
          {
            type: 'date',
            key: 'createdTo',
            label: 'تاريخ الإنشاء إلى',
            value: filters.createdTo,
            onChange: (value) => setFilters({ ...filters, createdTo: value }),
          },
        ]}
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredPayments.length === 0 && !loading ? (
          <EmptyState title="لا توجد مدفوعات مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredPayments} loading={loading} />
        )}
      </div>

      {filteredPayments.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredPayments.length} من {payments.length} دفعة
          {filteredPayments.length > 0 && (
            <span className="mr-4">
              {' '}
              | إجمالي المبلغ:{' '}
              {formatCurrency(
                filteredPayments.reduce((sum, p) => sum + p.amount, 0)
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
