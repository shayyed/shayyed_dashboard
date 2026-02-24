import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Milestone } from '../types';
import { mockContracts, mockProjects, mockInvoices, mockPayments, mockRequests } from '../mock/data';
import { formatDate, formatDateTime, formatSar } from '../utils/formatters';

const MILESTONE_STATUS_LABELS: Record<'NotDue' | 'Due' | 'Paid', string> = {
  NotDue: 'بالانتظار',
  Due: 'مستحقة',
  Paid: 'مدفوعة',
};

const MILESTONE_STATUS_COLORS: Record<'NotDue' | 'Due' | 'Paid', string> = {
  NotDue: 'bg-gray-100 text-gray-700',
  Due: 'bg-[#FDB022]/10 text-[#FDB022]',
  Paid: 'bg-[#05C4AF]/10 text-[#05C4AF]',
};

// Helper function to get all milestones with contract and project info
const getAllMilestonesWithRelations = (): Array<Milestone & { contractId: string; projectId?: string }> => {
  const allMilestones: Array<Milestone & { contractId: string; projectId?: string }> = [];
  
  mockContracts.forEach(contract => {
    const project = mockProjects.find(p => p.contractId === contract.id);
    contract.milestones.forEach(milestone => {
      allMilestones.push({
        ...milestone,
        contractId: contract.id,
        projectId: project?.id,
      });
    });
  });
  
  return allMilestones;
};

export const MilestonesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Array<Milestone & { contractId: string; projectId?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    amountMin: '',
    amountMax: '',
    dueDateFrom: '',
    dueDateTo: '',
    paidDateFrom: '',
    paidDateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      // Get all milestones from contracts
      const allMilestones = getAllMilestonesWithRelations();
      setMilestones(allMilestones);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMilestones = useMemo(() => {
    let filtered = milestones;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(milestone => {
        const contract = mockContracts.find(c => c.id === milestone.contractId);
        const project = milestone.projectId ? mockProjects.find(p => p.id === milestone.projectId) : null;
        const request = project ? mockRequests.find(r => r.id === project.requestId) : null;
        return (
          milestone.id.toLowerCase().includes(query) ||
          milestone.name.toLowerCase().includes(query) ||
          (milestone.description && milestone.description.toLowerCase().includes(query)) ||
          (contract && contract.id.toLowerCase().includes(query)) ||
          (request && request.title.toLowerCase().includes(query))
        );
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(milestone => milestone.status === filters.status);
    }

    // Request filter - البحث في الطلبات المرتبطة
    if (filters.projectId) {
      filtered = filtered.filter(milestone => {
        if (!milestone.projectId) return false;
        const project = mockProjects.find(p => p.id === milestone.projectId);
        if (!project) return false;
        return project.requestId === filters.projectId;
      });
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter(milestone => milestone.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(milestone => milestone.amount <= Number(filters.amountMax));
    }

    // Due date range filter
    if (filters.dueDateFrom) {
      filtered = filtered.filter(milestone => milestone.dueDate && milestone.dueDate >= filters.dueDateFrom);
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter(milestone => milestone.dueDate && milestone.dueDate <= filters.dueDateTo);
    }

    // Paid date range filter (only for Paid milestones)
    if (filters.paidDateFrom) {
      filtered = filtered.filter(milestone => milestone.paidAt && milestone.paidAt >= filters.paidDateFrom);
    }
    if (filters.paidDateTo) {
      filtered = filtered.filter(milestone => milestone.paidAt && milestone.paidAt <= filters.paidDateTo);
    }

    return filtered;
  }, [milestones, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export milestones:', filteredMilestones);
  };

  // Generate unique options for searchable selects
  const uniqueRequests = useMemo(() => {
    const requests = milestones
      .map(milestone => {
        if (!milestone.projectId) return null;
        const project = mockProjects.find(p => p.id === milestone.projectId);
        if (!project) return null;
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? { label: `${request.id} - ${request.title}`, value: request.id } : null;
      })
      .filter((r): r is { label: string; value: string } => r !== null);
    
    const unique = Array.from(new Map(requests.map(r => [r.value, r])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [milestones]);

  const resetFilters = () => {
    setFilters({
      status: '',
      projectId: '',
      amountMin: '',
      amountMax: '',
      dueDateFrom: '',
      dueDateTo: '',
      paidDateFrom: '',
      paidDateTo: '',
    });
    setSearchQuery('');
  };


  const columns = [
    {
      key: 'name',
      label: 'اسم الدفعة',
      render: (milestone: Milestone & { contractId: string; projectId?: string }) => (
        <Link
          to={`/milestones/${milestone.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {milestone.name}
        </Link>
      ),
    },
    {
      key: 'request',
      label: 'عنوان الطلب',
      render: (milestone: Milestone & { contractId: string; projectId?: string }) => {
        if (!milestone.projectId) {
          return <span className="text-gray-400">-</span>;
        }
        const project = mockProjects.find(p => p.id === milestone.projectId);
        if (!project) return <span className="text-gray-400">-</span>;
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? (
          <Link
            to={`/requests/regular/${request.id}`}
            className="text-blue-600 hover:underline"
          >
            {request.title}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (milestone: Milestone) => formatSar(milestone.amount),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (milestone: Milestone) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
          {MILESTONE_STATUS_LABELS[milestone.status]}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'تاريخ الاستحقاق',
      render: (milestone: Milestone) => milestone.dueDate ? formatDate(milestone.dueDate) : '-',
    },
    {
      key: 'paidAt',
      label: 'تاريخ الدفع',
      render: (milestone: Milestone) => milestone.paidAt ? formatDateTime(milestone.paidAt) : '-',
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (milestone: Milestone & { contractId: string; projectId?: string }) => (
        <Link to={`/milestones/${milestone.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة الدفعات</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث بإسم الدفعة ، عنوان الطلب ..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'select',
            key: 'status',
            label: 'الحالة',
            options: [
              { label: 'الكل', value: '' },
              { label: 'بالانتظار', value: 'NotDue' },
              { label: 'مستحقة', value: 'Due' },
              { label: 'مدفوعة', value: 'Paid' },
            ],
            value: filters.status,
            onChange: (value) => setFilters({ ...filters, status: value }),
          },
          {
            type: 'searchable-select',
            key: 'projectId',
            label: 'الطلب',
            options: uniqueRequests,
            value: filters.projectId,
            onChange: (value) => setFilters({ ...filters, projectId: value }),
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
        {filteredMilestones.length === 0 && !loading ? (
          <EmptyState title="لا توجد دفعات مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredMilestones} loading={loading} />
        )}
      </div>

      {filteredMilestones.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredMilestones.length} من {milestones.length} دفعة
        </div>
      )}
    </div>
  );
};
