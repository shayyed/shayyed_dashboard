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
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';
import { mockUsers, mockProjects, mockContracts, mockQuotations } from '../mock/data';
import { formatDate, formatCurrency } from '../utils/formatters';

const TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'مدفوعة', value: InvoiceStatus.PAID },
  { label: 'بانتظار الدفع', value: 'pending' },
];

export const InvoicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    contractor: '',
    client: '',
    amountMin: '',
    amountMax: '',
    dueDateFrom: '',
    dueDateTo: '',
    createdFrom: '',
    createdTo: '',
    paidDateFrom: '',
    paidDateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [activeTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    // Filter out REJECTED invoices
    let filtered = invoices.filter(i => i.status !== InvoiceStatus.REJECTED);

    // Tab filter - map to actual statuses
    if (activeTab !== 'all') {
      if (activeTab === InvoiceStatus.PAID) {
        filtered = filtered.filter(i => i.status === InvoiceStatus.PAID);
      } else if (activeTab === 'pending') {
        filtered = filtered.filter(i => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.APPROVED);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => {
        const client = mockUsers.find(u => u.id === i.clientId);
        const contractor = mockUsers.find(u => u.id === i.contractorId);
        const project = mockProjects.find(p => p.id === i.projectId);
        return (
          i.id.toLowerCase().includes(query) ||
          i.title.toLowerCase().includes(query) ||
          (i.description && i.description.toLowerCase().includes(query)) ||
          (client && client.name.toLowerCase().includes(query)) ||
          (contractor && contractor.name.toLowerCase().includes(query)) ||
          (project && project.title.toLowerCase().includes(query))
        );
      });
    }

    // Contractor filter
    if (filters.contractor) {
      filtered = filtered.filter(i => i.contractorId === filters.contractor);
    }

    // Client filter
    if (filters.client) {
      filtered = filtered.filter(i => i.clientId === filters.client);
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter(i => i.totalAmount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(i => i.totalAmount <= Number(filters.amountMax));
    }

    // Due date range filter
    if (filters.dueDateFrom) {
      filtered = filtered.filter(i => i.dueDate >= filters.dueDateFrom);
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter(i => i.dueDate <= filters.dueDateTo);
    }

    // Created date range filter
    if (filters.createdFrom) {
      filtered = filtered.filter(i => i.createdAt >= filters.createdFrom);
    }
    if (filters.createdTo) {
      filtered = filtered.filter(i => i.createdAt <= filters.createdTo);
    }

    // Paid date range filter (for PAID invoices only)
    if (filters.paidDateFrom || filters.paidDateTo) {
      filtered = filtered.filter(i => {
        if (i.status !== InvoiceStatus.PAID || !i.paidAt) return false;
        if (filters.paidDateFrom && i.paidAt < filters.paidDateFrom) return false;
        if (filters.paidDateTo && i.paidAt > filters.paidDateTo) return false;
        return true;
      });
    }

    return filtered;
  }, [invoices, activeTab, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export invoices:', filteredInvoices);
  };

  // Generate unique options for searchable selects
  const uniqueContractors = useMemo(() => {
    const contractors = invoices
      .map(inv => {
        const contractor = mockUsers.find(u => u.id === inv.contractorId);
        return contractor ? { label: contractor.name, value: contractor.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
    const unique = Array.from(new Map(contractors.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [invoices]);

  const uniqueClients = useMemo(() => {
    const clients = invoices
      .map(inv => {
        const client = mockUsers.find(u => u.id === inv.clientId);
        return client ? { label: client.name, value: client.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
    const unique = Array.from(new Map(clients.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [invoices]);

  const resetFilters = () => {
    setFilters({
      contractor: '',
      client: '',
      amountMin: '',
      amountMax: '',
      dueDateFrom: '',
      dueDateTo: '',
      createdFrom: '',
      createdTo: '',
      paidDateFrom: '',
      paidDateTo: '',
    });
    setSearchQuery('');
  };

  const columns = [
    {
      key: 'id',
      label: 'رقم الفاتورة',
      render: (invoice: Invoice) => (
        <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
          {invoice.id}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'العنوان',
      render: (invoice: Invoice) => (
        <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
          {invoice.title}
        </Link>
      ),
    },
    {
      key: 'milestone',
      label: 'الدفعة المرتبطة',
      render: (invoice: Invoice) => {
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
      key: 'contractor',
      label: 'المقاول',
      render: (invoice: Invoice) => {
        const contractor = mockUsers.find(u => u.id === invoice.contractorId);
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
      key: 'client',
      label: 'العميل',
      render: (invoice: Invoice) => {
        const client = mockUsers.find(u => u.id === invoice.clientId);
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
      key: 'amount',
      label: 'المبلغ (قبل الضريبة)',
      render: (invoice: Invoice) => formatCurrency(invoice.amount),
    },
    {
      key: 'vatAmount',
      label: 'قيمة الضريبة (15%)',
      render: (invoice: Invoice) => formatCurrency(invoice.vatAmount),
    },
    {
      key: 'totalAmount',
      label: 'المبلغ الإجمالي',
      render: (invoice: Invoice) => (
        <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (invoice: Invoice) => {
        // Map statuses: PAID = success, SENT/APPROVED = warning (بانتظار الدفع)
        if (invoice.status === InvoiceStatus.PAID) {
          return <StatusBadge status="PAID" customLabel="مدفوعة" />;
        } else if (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.APPROVED) {
          // Use warning variant explicitly for "بانتظار الدفع"
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-[#FDB022]/10 text-[#FDB022]">
              بانتظار الدفع
            </span>
          );
        } else {
          return <StatusBadge status={invoice.status} />;
        }
      },
    },
    {
      key: 'dueDate',
      label: 'تاريخ الاستحقاق',
      render: (invoice: Invoice) => formatDate(invoice.dueDate),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (invoice: Invoice) => formatDate(invoice.createdAt),
    },
    {
      key: 'paidDate',
      label: 'تاريخ الدفع',
      render: (invoice: Invoice) => {
        if (invoice.status === InvoiceStatus.PAID && invoice.paidAt) {
          return <span className="text-green-600">{formatDate(invoice.paidAt)}</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (invoice: Invoice) => (
        <Link to={`/invoices/${invoice.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة الفواتير</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث برقم الفاتورة ، بإسم المقاول ، بإسم العميل ..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'searchable-select',
            key: 'contractor',
            label: 'المقاول',
            options: uniqueContractors,
            value: filters.contractor,
            onChange: (value) => setFilters({ ...filters, contractor: value }),
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
            key: 'dueDateFrom',
            label: 'تاريخ الاستحقاق من',
            value: filters.dueDateFrom,
            onChange: (value) => setFilters({ ...filters, dueDateFrom: value }),
          },
          {
            type: 'date',
            key: 'dueDateTo',
            label: 'تاريخ الاستحقاق إلى',
            value: filters.dueDateTo,
            onChange: (value) => setFilters({ ...filters, dueDateTo: value }),
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
          {
            type: 'date',
            key: 'paidDateFrom',
            label: 'تاريخ الدفع من',
            value: filters.paidDateFrom,
            onChange: (value) => setFilters({ ...filters, paidDateFrom: value }),
          },
          {
            type: 'date',
            key: 'paidDateTo',
            label: 'تاريخ الدفع إلى',
            value: filters.paidDateTo,
            onChange: (value) => setFilters({ ...filters, paidDateTo: value }),
          },
        ]}
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredInvoices.length === 0 && !loading ? (
          <EmptyState title="لا توجد فواتير مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredInvoices} loading={loading} />
        )}
      </div>

      {filteredInvoices.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredInvoices.length} من {invoices.length} فاتورة
          {filteredInvoices.length > 0 && (
            <span className="mr-4">
              {' '}
              | إجمالي المبلغ:{' '}
              {formatCurrency(
                filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
