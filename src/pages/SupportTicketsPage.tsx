import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';
import type { SupportTicket } from '../types';
import { UserRole } from '../types';
import { mockUsers } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';

const STATUS_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'تم الرد', value: 'replied' },
  { label: 'بانتظار الرد', value: 'awaiting_reply' },
];

// Helper function to determine reply status
const getTicketReplyStatus = (ticket: SupportTicket): 'replied' | 'awaiting_reply' => {
  return (ticket.replies && ticket.replies.length > 0) ? 'replied' : 'awaiting_reply';
};

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'عميل',
  CONTRACTOR: 'مقاول',
};

export const SupportTicketsPage: React.FC = () => {
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    createdAtFrom: '',
    createdAtTo: '',
    respondedFrom: '',
    respondedTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [activeStatusTab]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Status tab filter - فلترة حسب وجود الردود
    if (activeStatusTab === 'replied') {
      filtered = filtered.filter(ticket => ticket.replies && ticket.replies.length > 0);
    } else if (activeStatusTab === 'awaiting_reply') {
      filtered = filtered.filter(ticket => !ticket.replies || ticket.replies.length === 0);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => {
        const user = mockUsers.find(u => u.id === ticket.userId);
        return (
          ticket.id.toLowerCase().includes(query) ||
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          (user && user.name.toLowerCase().includes(query))
        );
      });
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(ticket => ticket.role === filters.role);
    }

    // Created date range filter
    if (filters.createdAtFrom) {
      filtered = filtered.filter(ticket => ticket.createdAt >= filters.createdAtFrom);
    }
    if (filters.createdAtTo) {
      filtered = filtered.filter(ticket => ticket.createdAt <= filters.createdAtTo);
    }

    // Responded date range filter
    if (filters.respondedFrom) {
      filtered = filtered.filter(ticket => {
        if (!ticket.replies || ticket.replies.length === 0) return false;
        const lastReply = ticket.replies[ticket.replies.length - 1];
        return lastReply.createdAt >= filters.respondedFrom;
      });
    }
    if (filters.respondedTo) {
      filtered = filtered.filter(ticket => {
        if (!ticket.replies || ticket.replies.length === 0) return false;
        const lastReply = ticket.replies[ticket.replies.length - 1];
        return lastReply.createdAt <= filters.respondedTo;
      });
    }

    return filtered;
  }, [tickets, activeStatusTab, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export tickets:', filteredTickets);
  };

  const resetFilters = () => {
    setFilters({
      role: '',
      createdAtFrom: '',
      createdAtTo: '',
      respondedFrom: '',
      respondedTo: '',
    });
    setSearchQuery('');
  };

  const columns = [
    {
      key: 'title',
      label: 'العنوان',
      render: (ticket: SupportTicket) => (
        <Link
          to={`/support-tickets/${ticket.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {ticket.title}
        </Link>
      ),
    },
    {
      key: 'user',
      label: 'المستخدم',
      render: (ticket: SupportTicket) => {
        const user = mockUsers.find(u => u.id === ticket.userId);
        return user ? (
          <Link
            to={`/users/${ticket.role === UserRole.CLIENT ? 'clients' : 'contractors'}/${user.id}`}
            className="text-blue-600 hover:underline"
          >
            {user.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'role',
      label: 'الدور',
      render: (ticket: SupportTicket) => (
        <span className="text-gray-700">{ROLE_LABELS[ticket.role]}</span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (ticket: SupportTicket) => {
        const replyStatus = getTicketReplyStatus(ticket);
        return (
          <StatusBadge 
            status={replyStatus === 'replied' ? 'REPLIED' : 'AWAITING_REPLY'} 
            customLabel={replyStatus === 'replied' ? 'تم الرد' : 'بانتظار الرد'}
          />
        );
      },
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (ticket: SupportTicket) => formatDate(ticket.createdAt),
    },
    {
      key: 'respondedAt',
      label: 'تاريخ الرد',
      render: (ticket: SupportTicket) => {
        if (!ticket.replies || ticket.replies.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        const lastReply = ticket.replies[ticket.replies.length - 1];
        return <span className="text-green-600">{formatDate(lastReply.createdAt)}</span>;
      },
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (ticket: SupportTicket) => (
        <Link to={`/support-tickets/${ticket.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة تذاكر الدعم</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs tabs={STATUS_TABS} value={activeStatusTab} onChange={setActiveStatusTab} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث بالعنوان ، اسم المستخدم ..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'select',
            key: 'role',
            label: 'الدور',
            options: [
              { label: 'الكل', value: '' },
              { label: 'عميل', value: UserRole.CLIENT },
              { label: 'مقاول', value: UserRole.CONTRACTOR },
            ],
            value: filters.role,
            onChange: (value) => setFilters({ ...filters, role: value }),
          },
          {
            type: 'date',
            key: 'createdFrom',
            label: 'تاريخ الإنشاء من',
            value: filters.createdAtFrom,
            onChange: (value) => setFilters({ ...filters, createdAtFrom: value }),
          },
          {
            type: 'date',
            key: 'createdTo',
            label: 'تاريخ الإنشاء إلى',
            value: filters.createdAtTo,
            onChange: (value) => setFilters({ ...filters, createdAtTo: value }),
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
        {filteredTickets.length === 0 && !loading ? (
          <EmptyState title="لا توجد تذاكر دعم مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredTickets} loading={loading} />
        )}
      </div>

      {filteredTickets.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredTickets.length} من {tickets.length} تذكرة دعم
        </div>
      )}
    </div>
  );
};
