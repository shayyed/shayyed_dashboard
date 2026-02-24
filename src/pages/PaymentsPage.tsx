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
import { mockUsers, mockInvoices, mockProjects, mockContracts, mockQuotations } from '../mock/data';
import { formatDate, formatCurrency, formatDateTime } from '../utils/formatters';

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
      .map(p => {
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        return invoice ? { label: `${invoice.id} - ${invoice.title}`, value: invoice.id } : null;
      })
      .filter((inv): inv is { label: string; value: string } => inv !== null);
    
    const unique = Array.from(new Map(invoices.map(inv => [inv.value, inv])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [payments]);

  const uniqueClients = useMemo(() => {
    const clients = payments
      .map(p => {
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        const client = invoice ? mockUsers.find(u => u.id === invoice.clientId) : null;
        return client ? { label: client.name, value: client.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
    const unique = Array.from(new Map(clients.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [payments]);

  const uniqueContractors = useMemo(() => {
    const contractors = payments
      .map(p => {
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        const contractor = invoice ? mockUsers.find(u => u.id === invoice.contractorId) : null;
        return contractor ? { label: contractor.name, value: contractor.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
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
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        const client = invoice ? mockUsers.find(u => u.id === invoice.clientId) : null;
        const contractor = invoice ? mockUsers.find(u => u.id === invoice.contractorId) : null;
        return (
          p.id.toLowerCase().includes(query) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(query)) ||
          (p.noonPaymentId && p.noonPaymentId.toLowerCase().includes(query)) ||
          (p.noonReference && p.noonReference.toLowerCase().includes(query)) ||
          (invoice && invoice.id.toLowerCase().includes(query)) ||
          (client && client.name.toLowerCase().includes(query)) ||
          (contractor && contractor.name.toLowerCase().includes(query))
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
      filtered = filtered.filter(p => {
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        return invoice && invoice.clientId === filters.client;
      });
    }

    // Contractor filter
    if (filters.contractor) {
      filtered = filtered.filter(p => {
        const invoice = mockInvoices.find(i => i.id === p.invoiceId);
        return invoice && invoice.contractorId === filters.contractor;
      });
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
          {payment.referenceNumber || payment.id}
        </Link>
      ),
    },
    {
      key: 'invoice',
      label: 'الفاتورة',
      render: (payment: Payment) => {
        const invoice = mockInvoices.find(i => i.id === payment.invoiceId);
        return invoice ? (
          <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
            {invoice.id}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'milestone',
      label: 'الدفعة المرتبطة',
      render: (payment: Payment) => {
        const invoice = mockInvoices.find(i => i.id === payment.invoiceId);
        if (!invoice) return <span className="text-gray-400">-</span>;
        
        // Check if it's a quick service order (projectId starts with QSO-)
        const isQuickService = invoice.projectId && invoice.projectId.startsWith('QSO-');
        
        if (isQuickService) {
          // For quick service orders, find the quotation and its installments
          const quotation = mockQuotations.find(q => q.requestId === invoice.projectId && q.status === 'ACCEPTED');
          if (quotation && quotation.installments && quotation.installments.length > 0) {
            // Find the installment that matches the invoice amount
            const relatedInstallment = quotation.installments.find(
              inst => Math.abs(inst.amount - invoice.totalAmount) < 1 || Math.abs(inst.amount - invoice.amount) < 1
            ) || quotation.installments[0]; // Fallback to first installment
            
            const installmentIndex = quotation.installments.findIndex(inst => inst.id === relatedInstallment.id) + 1;
            return (
              <span className="text-blue-600">
                الدفعة {installmentIndex} - {relatedInstallment.title}
              </span>
            );
          }
          return <span className="text-gray-400">-</span>;
        }
        
        // For regular projects, find milestone from contract
        if (!invoice.milestoneId) return <span className="text-gray-400">-</span>;
        
        const project = mockProjects.find(p => p.id === invoice.projectId);
        if (!project) return <span className="text-gray-400">-</span>;
        
        const contract = mockContracts.find(c => c.id === project.contractId);
        if (!contract) return <span className="text-gray-400">-</span>;
        
        const milestone = contract.milestones.find(m => m.id === invoice.milestoneId);
        if (!milestone) return <span className="text-gray-400">-</span>;
        
        const milestoneIndex = contract.milestones.findIndex(m => m.id === milestone.id) + 1;
        return (
          <Link to={`/milestones/${milestone.id}`} className="text-blue-600 hover:underline">
            الدفعة {milestoneIndex} - {milestone.name}
          </Link>
        );
      },
    },
    {
      key: 'client',
      label: 'العميل',
      render: (payment: Payment) => {
        const invoice = mockInvoices.find(i => i.id === payment.invoiceId);
        const client = invoice ? mockUsers.find(u => u.id === invoice.clientId) : null;
        return client ? (
          <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (payment: Payment) => {
        const invoice = mockInvoices.find(i => i.id === payment.invoiceId);
        const contractor = invoice ? mockUsers.find(u => u.id === invoice.contractorId) : null;
        return contractor ? (
          <Link to={`/users/contractors/${contractor.id}`} className="text-blue-600 hover:underline">
            {contractor.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
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
