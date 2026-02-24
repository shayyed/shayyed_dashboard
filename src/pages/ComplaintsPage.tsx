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
import type { Complaint } from '../types';
import { ComplaintType, ComplaintStatus } from '../types';
import { mockUsers, mockProjects, mockRequests, mockContracts } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';

const STATUS_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'تم الرد', value: 'replied' },
  { label: 'بانتظار الرد', value: 'awaiting_reply' },
];

const RAISED_BY_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'من العميل', value: 'CLIENT' },
  { label: 'من المقاول', value: 'CONTRACTOR' },
];

const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  [ComplaintType.DELAY]: 'تأخير',
  [ComplaintType.QUALITY]: 'جودة',
  [ComplaintType.SCOPE]: 'نطاق العمل',
  [ComplaintType.PAYMENT]: 'فواتير/دفع',
  [ComplaintType.OTHER]: 'أخرى',
};


export const ComplaintsPage: React.FC = () => {
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [activeRaisedByTab, setActiveRaisedByTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    project: '',
    client: '',
    contractor: '',
    createdFrom: '',
    createdTo: '',
    respondedFrom: '',
    respondedTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, [activeStatusTab, activeRaisedByTab]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    let filtered = complaints;

    // Status tab filter - فلترة حسب وجود الرد
    if (activeStatusTab === 'replied') {
      filtered = filtered.filter(c => c.response && c.response.trim().length > 0);
    } else if (activeStatusTab === 'awaiting_reply') {
      filtered = filtered.filter(c => !c.response || c.response.trim().length === 0);
    }

    // Raised by tab filter - فلترة حسب من رفع الشكوى
    if (activeRaisedByTab === 'CLIENT') {
      filtered = filtered.filter(c => c.raisedBy === 'CLIENT');
    } else if (activeRaisedByTab === 'CONTRACTOR') {
      filtered = filtered.filter(c => c.raisedBy === 'CONTRACTOR');
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const project = mockProjects.find(p => p.id === c.projectId);
        const request = project ? mockRequests.find(r => r.id === project.requestId) : null;
        const client = mockUsers.find(u => u.id === c.clientId);
        const contractor = mockUsers.find(u => u.id === c.contractorId);
        return (
          c.id.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          (c.response && c.response.toLowerCase().includes(query)) ||
          (client && client.name.toLowerCase().includes(query)) ||
          (contractor && contractor.name.toLowerCase().includes(query)) ||
          (request && request.title.toLowerCase().includes(query))
        );
      });
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }

    // Request filter - البحث في الطلبات المرتبطة
    if (filters.project) {
      filtered = filtered.filter(c => {
        const project = mockProjects.find(p => p.id === c.projectId);
        if (!project) return false;
        return project.requestId === filters.project;
      });
    }

    // Client filter
    if (filters.client) {
      filtered = filtered.filter(c => c.clientId === filters.client);
    }

    // Contractor filter
    if (filters.contractor) {
      filtered = filtered.filter(c => c.contractorId === filters.contractor);
    }

    // Created date range filter
    if (filters.createdFrom) {
      filtered = filtered.filter(c => c.createdAt >= filters.createdFrom);
    }
    if (filters.createdTo) {
      filtered = filtered.filter(c => c.createdAt <= filters.createdTo);
    }

    // Responded date range filter
    if (filters.respondedFrom) {
      filtered = filtered.filter(c => c.respondedAt && c.respondedAt >= filters.respondedFrom);
    }
    if (filters.respondedTo) {
      filtered = filtered.filter(c => c.respondedAt && c.respondedAt <= filters.respondedTo);
    }

    return filtered;
  }, [complaints, activeStatusTab, activeRaisedByTab, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export complaints:', filteredComplaints);
  };

  // Generate unique options for searchable selects
  const uniqueRequests = useMemo(() => {
    const requests = complaints
      .map(c => {
        const project = mockProjects.find(p => p.id === c.projectId);
        if (!project) return null;
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? { label: `${request.id} - ${request.title}`, value: request.id } : null;
      })
      .filter((r): r is { label: string; value: string } => r !== null);
    
    const unique = Array.from(new Map(requests.map(r => [r.value, r])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [complaints]);

  const uniqueClients = useMemo(() => {
    const clients = complaints
      .map(c => {
        const client = mockUsers.find(u => u.id === c.clientId);
        return client ? { label: client.name, value: client.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
    const unique = Array.from(new Map(clients.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [complaints]);

  const uniqueContractors = useMemo(() => {
    const contractors = complaints
      .map(c => {
        const contractor = mockUsers.find(u => u.id === c.contractorId);
        return contractor ? { label: contractor.name, value: contractor.id } : null;
      })
      .filter((c): c is { label: string; value: string } => c !== null);
    
    const unique = Array.from(new Map(contractors.map(c => [c.value, c])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [complaints]);

  const resetFilters = () => {
    setFilters({
      type: '',
      project: '',
      client: '',
      contractor: '',
      createdFrom: '',
      createdTo: '',
      respondedFrom: '',
      respondedTo: '',
    });
    setSearchQuery('');
  };

  const columns = [
    {
      key: 'type',
      label: 'النوع',
      render: (complaint: Complaint) => (
        <span>{COMPLAINT_TYPE_LABELS[complaint.type]}</span>
      ),
    },
    {
      key: 'project',
      label: 'الطلب',
      render: (complaint: Complaint) => {
        const project = mockProjects.find(p => p.id === complaint.projectId);
        if (!project) return <span className="text-gray-400">-</span>;
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? (
          <Link to={`/requests/regular/${request.id}`} className="text-blue-600 hover:underline">
            {request.title}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'client',
      label: 'العميل',
      render: (complaint: Complaint) => {
        const client = mockUsers.find(u => u.id === complaint.clientId);
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
      render: (complaint: Complaint) => {
        const contractor = mockUsers.find(u => u.id === complaint.contractorId);
        return contractor ? (
          <Link
            to={`/users/contractors/${contractor.id}`}
            className="text-blue-600 hover:underline"
          >
            {contractor.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (complaint: Complaint) => (
        <StatusBadge 
          status={complaint.response ? 'REPLIED' : 'AWAITING_REPLY'} 
          customLabel={complaint.response ? 'تم الرد' : 'بانتظار الرد'}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (complaint: Complaint) => formatDate(complaint.createdAt),
    },
    {
      key: 'respondedAt',
      label: 'تاريخ الرد',
      render: (complaint: Complaint) =>
        complaint.respondedAt ? (
          <span className="text-green-600">{formatDate(complaint.respondedAt)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (complaint: Complaint) => (
        <Link to={`/complaints/${complaint.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة الشكاوى</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <div className="space-y-4">
        <Tabs tabs={STATUS_TABS} value={activeStatusTab} onChange={setActiveStatusTab} />
        <Tabs tabs={RAISED_BY_TABS} value={activeRaisedByTab} onChange={setActiveRaisedByTab} />
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث بنوع الشكوى ، العميل ، المقاول ..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'select',
            key: 'type',
            label: 'النوع',
            options: [
              { label: 'الكل', value: '' },
              { label: 'تأخير', value: ComplaintType.DELAY },
              { label: 'جودة', value: ComplaintType.QUALITY },
              { label: 'نطاق العمل', value: ComplaintType.SCOPE },
              { label: 'فواتير/دفع', value: ComplaintType.PAYMENT },
              { label: 'أخرى', value: ComplaintType.OTHER },
            ],
            value: filters.type,
            onChange: (value) => setFilters({ ...filters, type: value }),
          },
          {
            type: 'searchable-select',
            key: 'project',
            label: 'الطلب',
            options: uniqueRequests,
            value: filters.project,
            onChange: (value) => setFilters({ ...filters, project: value }),
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
            key: 'respondedFrom',
            label: 'تاريخ الرد من',
            value: filters.respondedFrom,
            onChange: (value) => setFilters({ ...filters, respondedFrom: value }),
          },
          {
            type: 'date',
            key: 'respondedTo',
            label: 'تاريخ الرد إلى',
            value: filters.respondedTo,
            onChange: (value) => setFilters({ ...filters, respondedTo: value }),
          },
        ]}
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredComplaints.length === 0 && !loading ? (
          <EmptyState title="لا توجد شكاوى مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredComplaints} loading={loading} />
        )}
      </div>

      {filteredComplaints.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredComplaints.length} من {complaints.length} شكوى
        </div>
      )}
    </div>
  );
};
