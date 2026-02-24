import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { ChatThread } from '../types';
import { mockUsers, mockProjects, mockRequests, mockInvoices, mockQuickServiceOrders } from '../mock/data';
import { formatDateTime } from '../utils/formatters';

export const ChatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    request: '',
    clientPhone: '',
    contractorPhone: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listChatThreads();
      setChats(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = useMemo(() => {
    let filtered = chats;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat => {
        const client = mockUsers.find(u => u.id === chat.clientId);
        const contractor = mockUsers.find(u => u.id === chat.contractorId);
        return (
          chat.id.toLowerCase().includes(query) ||
          (client && client.name.toLowerCase().includes(query)) ||
          (contractor && contractor.name.toLowerCase().includes(query)) ||
          (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(query))
        );
      });
    }

    // Request filter
    if (filters.request) {
      filtered = filtered.filter(chat => {
        // Get the request ID from the related entity
        let requestId: string | null = null;
        if (chat.relatedType === 'request') {
          requestId = chat.relatedId;
        } else if (chat.relatedType === 'project') {
          const project = mockProjects.find(p => p.id === chat.relatedId);
          if (project) requestId = project.requestId;
        } else if (chat.relatedType === 'invoice') {
          const invoice = mockInvoices.find(i => i.id === chat.relatedId);
          if (invoice) {
            const project = mockProjects.find(p => p.id === invoice.projectId);
            if (project) requestId = project.requestId;
          }
        }
        return requestId === filters.request;
      });
    }

    // Client phone filter
    if (filters.clientPhone) {
      filtered = filtered.filter(chat => {
        const client = mockUsers.find(u => u.id === chat.clientId);
        return client && client.phone === filters.clientPhone;
      });
    }

    // Contractor phone filter
    if (filters.contractorPhone) {
      filtered = filtered.filter(chat => {
        const contractor = mockUsers.find(u => u.id === chat.contractorId);
        return contractor && contractor.phone === filters.contractorPhone;
      });
    }

    return filtered;
  }, [chats, searchQuery, filters]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export chats:', filteredChats);
  };

  // Generate unique options for searchable selects
  const uniqueRequests = useMemo(() => {
    const requests = chats
      .map(chat => {
        // Get the request ID from the related entity
        let requestId: string | null = null;
        if (chat.relatedType === 'request') {
          requestId = chat.relatedId;
        } else if (chat.relatedType === 'project') {
          const project = mockProjects.find(p => p.id === chat.relatedId);
          if (project) requestId = project.requestId;
        } else if (chat.relatedType === 'invoice') {
          const invoice = mockInvoices.find(i => i.id === chat.relatedId);
          if (invoice) {
            const project = mockProjects.find(p => p.id === invoice.projectId);
            if (project) requestId = project.requestId;
          }
        }
        if (!requestId) return null;
        const request = mockRequests.find(r => r.id === requestId);
        return request ? { label: `${request.id} - ${request.title}`, value: request.id } : null;
      })
      .filter((r): r is { label: string; value: string } => r !== null);
    
    const unique = Array.from(new Map(requests.map(r => [r.value, r])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [chats]);

  const uniqueClientPhones = useMemo(() => {
    const phones = chats
      .map(chat => {
        const client = mockUsers.find(u => u.id === chat.clientId);
        return client ? { label: client.phone, value: client.phone } : null;
      })
      .filter((p): p is { label: string; value: string } => p !== null);
    
    const unique = Array.from(new Map(phones.map(p => [p.value, p])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [chats]);

  const uniqueContractorPhones = useMemo(() => {
    const phones = chats
      .map(chat => {
        const contractor = mockUsers.find(u => u.id === chat.contractorId);
        return contractor ? { label: contractor.phone, value: contractor.phone } : null;
      })
      .filter((p): p is { label: string; value: string } => p !== null);
    
    const unique = Array.from(new Map(phones.map(p => [p.value, p])).values());
    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [chats]);

  const resetFilters = () => {
    setFilters({
      request: '',
      clientPhone: '',
      contractorPhone: '',
    });
    setSearchQuery('');
  };

  const getRelatedEntityLink = (chat: ChatThread) => {
    if (chat.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === chat.relatedId);
      if (project) {
        const request = mockRequests.find(r => r.id === project.requestId);
        if (request) return `/requests/regular/${request.id}`;
      }
      return `/projects/${chat.relatedId}`;
    } else if (chat.relatedType === 'request') {
      return `/requests/regular/${chat.relatedId}`;
    } else if (chat.relatedType === 'invoice') {
      return `/invoices/${chat.relatedId}`;
    }
    return '#';
  };

  const getRelatedEntityTitle = (chat: ChatThread) => {
    if (chat.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === chat.relatedId);
      if (project) {
        const request = mockRequests.find(r => r.id === project.requestId);
        if (request) return request.title;
      }
      return project ? project.title : chat.relatedId;
    } else if (chat.relatedType === 'request') {
      const request = mockRequests.find(r => r.id === chat.relatedId);
      return request ? request.title : chat.relatedId;
    } else if (chat.relatedType === 'invoice') {
      const invoice = mockInvoices.find(i => i.id === chat.relatedId);
      return invoice ? invoice.title : chat.relatedId;
    }
    return chat.relatedId;
  };

  // Helper function to get request ID from chat thread
  const getRequestIdFromChat = (chat: ChatThread): string | null => {
    if (chat.relatedType === 'request') {
      return chat.relatedId;
    } else if (chat.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === chat.relatedId);
      return project ? project.requestId : null;
    } else if (chat.relatedType === 'invoice') {
      const invoice = mockInvoices.find(i => i.id === chat.relatedId);
      if (invoice) {
        const project = mockProjects.find(p => p.id === invoice.projectId);
        return project ? project.requestId : null;
      }
    }
    return null;
  };

  // Helper function to determine if request is regular or quick service
  const getRequestType = (requestId: string | null): 'regular' | 'quick' => {
    if (!requestId) return 'regular';
    const regularRequest = mockRequests.find(r => r.id === requestId);
    if (regularRequest) return 'regular';
    const quickOrder = mockQuickServiceOrders.find(q => q.id === requestId);
    if (quickOrder) return 'quick';
    return 'regular'; // Default
  };

  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (chat: ChatThread) => {
        const client = mockUsers.find(u => u.id === chat.clientId);
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
      render: (chat: ChatThread) => {
        const contractor = mockUsers.find(u => u.id === chat.contractorId);
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
      key: 'relatedType',
      label: 'نوع الطلب',
      render: (chat: ChatThread) => {
        const requestId = getRequestIdFromChat(chat);
        const type = getRequestType(requestId);
        return (
          <span className={`text-xs px-2 py-1 rounded ${
            type === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
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
        ]}
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredChats.length === 0 && !loading ? (
          <EmptyState title="لا توجد محادثات مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredChats} loading={loading} />
        )}
      </div>

      {filteredChats.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredChats.length} من {chats.length} محادثة
        </div>
      )}
    </div>
  );
};
