import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { ChatThread } from '../types';
import { formatDateTime } from '../utils/formatters';

export const ChatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    request: '',
    clientPhone: '',
    contractorPhone: '',
    requestKind: '' as '' | 'quick' | 'regular',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.listChatThreads({
        q: debouncedSearch || undefined,
        filterRequestId: filters.request || undefined,
        clientPhone: filters.clientPhone || undefined,
        contractorPhone: filters.contractorPhone || undefined,
        requestKind: filters.requestKind || undefined,
        limit: 500,
        page: 1,
      });
      setChats(data);
      setTotalLoaded(data.length);
    } catch (error) {
      console.error('Load error:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.request, filters.clientPhone, filters.contractorPhone, filters.requestKind]);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  const handleExport = () => {
    console.log('Export chats:', chats);
  };

  const uniqueRequests = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of chats) {
      const fid = c.filterRequestId || (c.relatedType === 'request' ? c.relatedId : '');
      if (!fid) continue;
      const label = c.relatedTitle ? `${fid.slice(-8)} — ${c.relatedTitle}` : fid;
      if (!map.has(fid)) map.set(fid, label);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'));
  }, [chats]);

  const uniqueClientPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of chats) {
      if (c.clientPhone) set.add(c.clientPhone);
    }
    return [...set]
      .sort()
      .map((phone) => ({ value: phone, label: phone }));
  }, [chats]);

  const uniqueContractorPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of chats) {
      if (c.contractorPhone) set.add(c.contractorPhone);
    }
    return [...set]
      .sort()
      .map((phone) => ({ value: phone, label: phone }));
  }, [chats]);

  const resetFilters = () => {
    setFilters({
      request: '',
      clientPhone: '',
      contractorPhone: '',
      requestKind: '',
    });
    setSearchQuery('');
  };

  const getRelatedEntityLink = (chat: ChatThread) => {
    if (chat.relatedType === 'project') return `/projects/${chat.relatedId}`;
    if (chat.relatedType === 'invoice') return `/invoices/${chat.relatedId}`;
    if (chat.requestKind === 'quick') return `/requests/quick/${chat.relatedId}`;
    return `/requests/regular/${chat.relatedId}`;
  };

  const getRelatedEntityTitle = (chat: ChatThread) =>
    chat.relatedTitle?.trim() || chat.relatedId || '—';

  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (chat: ChatThread) => {
        const name = chat.clientName?.trim();
        return name ? (
          <Link to={`/users/clients/${chat.clientId}`} className="text-blue-600 hover:underline">
            {name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (chat: ChatThread) => {
        const name = chat.contractorName?.trim();
        return name ? (
          <Link
            to={`/users/contractors/${chat.contractorId}`}
            className="text-blue-600 hover:underline"
          >
            {name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'relatedType',
      label: 'نوع الطلب',
      render: (chat: ChatThread) => {
        const type = chat.requestKind === 'quick' ? 'quick' : 'regular';
        return (
          <span
            className={`text-xs px-2 py-1 rounded ${
              type === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {type === 'regular' ? 'عادي' : 'خدمة سريعة'}
          </span>
        );
      },
    },
    {
      key: 'relatedId',
      label: 'عنوان الطلب',
      render: (chat: ChatThread) => (
        <Link to={getRelatedEntityLink(chat)} className="text-blue-600 hover:underline">
          {getRelatedEntityTitle(chat)}
        </Link>
      ),
    },
    {
      key: 'updatedAt',
      label: 'تاريخ آخر تحديث',
      render: (chat: ChatThread) => formatDateTime(chat.updatedAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (chat: ChatThread) => (
        <Link to={`/chats/${chat.id}`}>
          <Button variant="secondary">عرض المحادثة</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة المحادثات</h1>
        <div className="flex items-center gap-2">
          <Link to="/chats/settings">
            <Button variant="secondary">إعدادات المحادثات</Button>
          </Link>
          <Link to="/chats/bans">
            <Button variant="secondary">حظر بعض المحادثات</Button>
          </Link>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث بإسم العميل ، اسم المقاول ..."
      />

      <FilterBar
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onReset={resetFilters}
        filters={[
          {
            type: 'searchable-select',
            key: 'request',
            label: 'الطلب',
            options: uniqueRequests,
            value: filters.request,
            onChange: (value) => setFilters({ ...filters, request: value }),
          },
          {
            type: 'searchable-select',
            key: 'clientPhone',
            label: 'رقم جوال العميل',
            options: uniqueClientPhones,
            value: filters.clientPhone,
            onChange: (value) => setFilters({ ...filters, clientPhone: value }),
          },
          {
            type: 'searchable-select',
            key: 'contractorPhone',
            label: 'رقم جوال المقاول',
            options: uniqueContractorPhones,
            value: filters.contractorPhone,
            onChange: (value) => setFilters({ ...filters, contractorPhone: value }),
          },
          {
            type: 'searchable-select',
            key: 'requestKind',
            label: 'نوع الطلب',
            options: [
              { value: '', label: 'الكل' },
              { value: 'regular', label: 'عادي' },
              { value: 'quick', label: 'خدمة سريعة' },
            ],
            value: filters.requestKind,
            onChange: (value) =>
              setFilters({
                ...filters,
                requestKind: (value as 'quick' | 'regular' | '') || '',
              }),
          },
        ]}
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {chats.length === 0 && !loading ? (
          <EmptyState title="لا توجد محادثات مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={chats} loading={loading} />
        )}
      </div>

      {chats.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {chats.length}
          {totalLoaded >= 500 ? '+' : ''} محادثة
        </div>
      )}
    </div>
  );
};
