import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Milestone, QuickServiceOrder, ServiceRequest } from '../types';
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

export type MilestoneRow = Milestone & { contractId: string; requestId?: string };

function resolveRequestLink(
  requestId: string | undefined,
  requests: ServiceRequest[],
  quickOrders: QuickServiceOrder[]
): { title: string; to: string } | null {
  if (!requestId || !requestId.trim()) return null;
  const rid = requestId.trim();
  const reg = requests.find((r) => r.id === rid);
  if (reg) return { title: reg.title, to: `/requests/regular/${reg.id}` };
  const q = quickOrders.find((o) => o.id === rid);
  if (q) {
    const title = (q.title && q.title.trim()) || q.serviceTitle || rid;
    return { title, to: `/requests/quick/${q.id}` };
  }
  return null;
}

export const MilestonesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [requestsList, setRequestsList] = useState<ServiceRequest[]>([]);
  const [quickOrdersList, setQuickOrdersList] = useState<QuickServiceOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    requestId: '',
    amountMin: '',
    amountMax: '',
    dueDateFrom: '',
    dueDateTo: '',
    paidDateFrom: '',
    paidDateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    void loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const [contracts, requests, quickOrders] = await Promise.all([
        adminApi.listContracts(),
        adminApi.listRequests(),
        adminApi.listQuickServiceOrders(),
      ]);
      setRequestsList(requests);
      setQuickOrdersList(quickOrders);
      const allMilestones: MilestoneRow[] = [];
      for (const contract of contracts) {
        const rid = contract.requestId?.trim() || undefined;
        for (const milestone of contract.milestones) {
          allMilestones.push({
            ...milestone,
            contractId: contract.id,
            requestId: rid,
          });
        }
      }
      setMilestones(allMilestones);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMilestones = useMemo(() => {
    let filtered = milestones;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((milestone) => {
        const req = resolveRequestLink(milestone.requestId, requestsList, quickOrdersList);
        return (
          milestone.id.toLowerCase().includes(query) ||
          milestone.name.toLowerCase().includes(query) ||
          (milestone.description && milestone.description.toLowerCase().includes(query)) ||
          milestone.contractId.toLowerCase().includes(query) ||
          (req && req.title.toLowerCase().includes(query))
        );
      });
    }

    if (filters.status) {
      filtered = filtered.filter((milestone) => milestone.status === filters.status);
    }

    if (filters.requestId) {
      filtered = filtered.filter((milestone) => milestone.requestId === filters.requestId);
    }

    if (filters.amountMin) {
      filtered = filtered.filter((milestone) => milestone.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter((milestone) => milestone.amount <= Number(filters.amountMax));
    }

    if (filters.dueDateFrom) {
      filtered = filtered.filter(
        (milestone) => milestone.dueDate && milestone.dueDate >= filters.dueDateFrom
      );
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter(
        (milestone) => milestone.dueDate && milestone.dueDate <= filters.dueDateTo
      );
    }

    if (filters.paidDateFrom) {
      filtered = filtered.filter(
        (milestone) => milestone.paidAt && milestone.paidAt >= filters.paidDateFrom
      );
    }
    if (filters.paidDateTo) {
      filtered = filtered.filter(
        (milestone) => milestone.paidAt && milestone.paidAt <= filters.paidDateTo
      );
    }

    return filtered;
  }, [milestones, searchQuery, filters, requestsList, quickOrdersList]);

  const handleExport = () => {
    console.log('Export milestones:', filteredMilestones);
  };

  const uniqueRequests = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of milestones) {
      if (!m.requestId) continue;
      if (seen.has(m.requestId)) continue;
      const meta = resolveRequestLink(m.requestId, requestsList, quickOrdersList);
      seen.set(m.requestId, meta ? `${m.requestId.slice(-8)} — ${meta.title}` : m.requestId);
    }
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'));
  }, [milestones, requestsList, quickOrdersList]);

  const resetFilters = () => {
    setFilters({
      status: '',
      requestId: '',
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
      render: (milestone: MilestoneRow) => (
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
      render: (milestone: MilestoneRow) => {
        const meta = resolveRequestLink(milestone.requestId, requestsList, quickOrdersList);
        return meta ? (
          <Link to={meta.to} className="text-blue-600 hover:underline">
            {meta.title}
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
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${MILESTONE_STATUS_COLORS[milestone.status]}`}
        >
          {MILESTONE_STATUS_LABELS[milestone.status]}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'تاريخ الاستحقاق',
      render: (milestone: Milestone) =>
        milestone.dueDate ? formatDate(milestone.dueDate) : '-',
    },
    {
      key: 'paidAt',
      label: 'تاريخ الدفع',
      render: (milestone: Milestone) =>
        milestone.paidAt ? formatDateTime(milestone.paidAt) : '-',
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (milestone: MilestoneRow) => (
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
            key: 'requestId',
            label: 'الطلب',
            options: uniqueRequests,
            value: filters.requestId,
            onChange: (value) => setFilters({ ...filters, requestId: value }),
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
