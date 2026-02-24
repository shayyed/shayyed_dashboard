import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Quotation } from '../types';
import { QuotationStatus } from '../types';
import { formatSar, formatDate } from '../utils/formatters';
import { mockUsers, mockRequests, mockQuickServiceOrders, mockQuotations } from '../mock/data';

const STATUS_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'بانتظار التأكيد', value: QuotationStatus.PENDING },
  { label: 'مقبولة', value: QuotationStatus.ACCEPTED },
  { label: 'مرفوضة', value: QuotationStatus.REJECTED },
];

export const QuotationsPage: React.FC = () => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  // فلاتر
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [contractor, setContractor] = useState('');
  const [request, setRequest] = useState('');
  const [client, setClient] = useState('');
  const [requestType, setRequestType] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  useEffect(() => {
    loadQuotations();
  }, [statusTab]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listQuotations();
      setQuotations(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديد نوع الطلب (عادي أو خدمة سريعة)
  const getRequestType = (requestId: string): 'regular' | 'quick' => {
    const regularRequest = mockRequests.find(r => r.id === requestId);
    if (regularRequest) return 'regular';
    const quickOrder = mockQuickServiceOrders.find(q => q.id === requestId);
    if (quickOrder) return 'quick';
    return 'regular'; // افتراضي
  };

  // Get unique contractors for searchable select
  const uniqueContractors = useMemo(() => {
    const contractorMap = new Map();
    mockQuotations.forEach(q => {
      if (!contractorMap.has(q.contractorId)) {
        contractorMap.set(q.contractorId, {
          label: q.contractorName,
          value: q.contractorId
        });
      }
    });
    return Array.from(contractorMap.values());
  }, []);

  // Get unique requests for searchable select
  const uniqueRequests = useMemo(() => {
    const requestMap = new Map();
    mockRequests.forEach(r => {
      requestMap.set(r.id, {
        label: r.title,
        value: r.id
      });
    });
    mockQuickServiceOrders.forEach(q => {
      requestMap.set(q.id, {
        label: q.title || q.serviceTitle,
        value: q.id
      });
    });
    return Array.from(requestMap.values());
  }, []);

  // Get unique clients for searchable select
  const uniqueClients = useMemo(() => {
    const clientMap = new Map();
    mockRequests.forEach(r => {
      const client = mockUsers.find(u => u.id === r.clientId);
      if (client && !clientMap.has(client.id)) {
        clientMap.set(client.id, {
          label: client.name,
          value: client.id
        });
      }
    });
    mockQuickServiceOrders.forEach(q => {
      const client = mockUsers.find(u => u.id === q.clientId);
      if (client && !clientMap.has(client.id)) {
        clientMap.set(client.id, {
          label: client.name,
          value: client.id
        });
      }
    });
    return Array.from(clientMap.values());
  }, []);

  // فلترة العروض
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;
    
    // فلترة حسب الحالة من Tab
    if (statusTab !== 'all') {
      filtered = filtered.filter(q => q.status === statusTab);
    }
    
    // فلترة حسب الحالة من FilterBar
    if (status) {
      filtered = filtered.filter(q => q.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.contractorName.toLowerCase().includes(searchLower) ||
        (mockRequests.find(r => r.id === q.requestId)?.title || '').toLowerCase().includes(searchLower) ||
        (mockQuickServiceOrders.find(qo => qo.id === q.requestId)?.title || '').toLowerCase().includes(searchLower) ||
        (q.notes || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (contractor) {
      filtered = filtered.filter(q => q.contractorId === contractor);
    }
    
    if (request) {
      filtered = filtered.filter(q => q.requestId === request);
    }
    
    if (client) {
      filtered = filtered.filter(q => {
        const regularRequest = mockRequests.find(r => r.id === q.requestId);
        const quickOrder = mockQuickServiceOrders.find(qo => qo.id === q.requestId);
        return (regularRequest && regularRequest.clientId === client) || 
               (quickOrder && quickOrder.clientId === client);
      });
    }
    
    if (requestType) {
      filtered = filtered.filter(q => {
        const type = getRequestType(q.requestId);
        return requestType === 'regular' ? type === 'regular' : type === 'quick';
      });
    }
    
    if (priceMin) {
      filtered = filtered.filter(q => q.price >= parseFloat(priceMin));
    }
    
    if (priceMax) {
      filtered = filtered.filter(q => q.price <= parseFloat(priceMax));
    }
    
    if (createdFrom) {
      filtered = filtered.filter(q => q.createdAt >= createdFrom);
    }
    
    if (createdTo) {
      filtered = filtered.filter(q => q.createdAt <= createdTo);
    }
    
    return filtered;
  }, [quotations, statusTab, search, status, contractor, request, client, requestType, priceMin, priceMax, createdFrom, createdTo]);

  // أعمدة الجدول
  const columns = [
    {
      key: 'id',
      label: 'رقم العرض',
      render: (quotation: Quotation) => (
        <Link to={`/quotations/${quotation.id}`} className="text-blue-600 hover:underline font-medium">
          {quotation.id}
        </Link>
      )
    },
    { 
      key: 'contractor', 
      label: 'المقاول',
      render: (quotation: Quotation) => (
        <Link to={`/users/contractors/${quotation.contractorId}`} className="text-blue-600 hover:underline">
          {quotation.contractorName}
        </Link>
      )
    },
    { 
      key: 'request', 
      label: 'الطلب المرتبط',
      render: (quotation: Quotation) => {
        const regularRequest = mockRequests.find(r => r.id === quotation.requestId);
        const quickOrder = mockQuickServiceOrders.find(q => q.id === quotation.requestId);
        const requestTitle = regularRequest?.title || quickOrder?.title || quickOrder?.serviceTitle || '-';
        const requestType = regularRequest ? 'regular' : 'quick';
        const path = requestType === 'regular' ? `/requests/regular/${quotation.requestId}` : `/requests/quick/${quotation.requestId}`;
        return (
          <Link to={path} className="text-blue-600 hover:underline">
            {requestTitle}
          </Link>
        );
      }
    },
    { 
      key: 'requestType', 
      label: 'نوع الطلب',
      render: (quotation: Quotation) => {
        const type = getRequestType(quotation.requestId);
        return (
          <span className={`text-xs px-2 py-1 rounded ${
            type === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            {type === 'regular' ? 'عادي' : 'خدمة سريعة'}
          </span>
        );
      }
    },
    { 
      key: 'price', 
      label: 'السعر',
      render: (quotation: Quotation) => formatSar(quotation.price)
    },
    { 
      key: 'duration', 
      label: 'المدة',
      render: (quotation: Quotation) => {
        const type = getRequestType(quotation.requestId);
        if (type === 'regular') {
          return `${typeof quotation.duration === 'number' ? quotation.duration : quotation.duration} يوم`;
        } else {
          return typeof quotation.duration === 'string' ? quotation.duration : `${quotation.duration} ساعة`;
        }
      }
    },
    // المواد مشمولة - يحددها العميل في الطلب، ليس في العرض - hidden from offer
    { 
      key: 'status', 
      label: 'الحالة',
      render: (quotation: Quotation) => {
        // Map QuotationStatus to correct labels
        if (quotation.status === QuotationStatus.PENDING) {
          return <StatusBadge status={quotation.status} customLabel="بانتظار التأكيد" />;
        }
        return <StatusBadge status={quotation.status} />;
      }
    },
    { 
      key: 'createdAt', 
      label: 'تاريخ الإنشاء',
      render: (quotation: Quotation) => formatDate(quotation.createdAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (quotation: Quotation) => (
        <div className="flex gap-2">
          <Link to={`/quotations/${quotation.id}`}>
            <Button variant="secondary">عرض التفاصيل</Button>
          </Link>
        </div>
      ),
    },
  ];

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`Exporting ${format}...`);
    // TODO: Implement export functionality
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setContractor('');
    setRequest('');
    setClient('');
    setRequestType('');
    setPriceMin('');
    setPriceMax('');
    setCreatedFrom('');
    setCreatedTo('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة العروض</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs 
        tabs={STATUS_TABS} 
        value={statusTab} 
        onChange={setStatusTab} 
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="البحث برقم العرض ، عنوان الطلب ، اسم المقاول ..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'status',
            label: 'الحالة',
            options: [
              { label: 'الكل', value: '' },
              { label: 'بانتظار التأكيد', value: QuotationStatus.PENDING },
              { label: 'مقبولة', value: QuotationStatus.ACCEPTED },
              { label: 'مرفوضة', value: QuotationStatus.REJECTED },
            ],
            value: status,
            onChange: setStatus,
          },
          {
            type: 'searchable-select',
            key: 'contractor',
            label: 'المقاول',
            options: uniqueContractors,
            value: contractor,
            onChange: setContractor,
          },
          {
            type: 'searchable-select',
            key: 'request',
            label: 'الطلب',
            options: uniqueRequests,
            value: request,
            onChange: setRequest,
          },
          {
            type: 'searchable-select',
            key: 'client',
            label: 'العميل',
            options: uniqueClients,
            value: client,
            onChange: setClient,
          },
          {
            type: 'select',
            key: 'requestType',
            label: 'نوع الطلب',
            options: [
              { label: 'الكل', value: '' },
              { label: 'عادي', value: 'regular' },
              { label: 'خدمة سريعة', value: 'quick' },
            ],
            value: requestType,
            onChange: setRequestType,
          },
          {
            type: 'text',
            key: 'priceMin',
            label: 'السعر (من)',
            value: priceMin,
            onChange: setPriceMin,
          },
          {
            type: 'text',
            key: 'priceMax',
            label: 'السعر (إلى)',
            value: priceMax,
            onChange: setPriceMax,
          },
          {
            type: 'date',
            key: 'createdFrom',
            label: 'تاريخ الإنشاء من',
            value: createdFrom,
            onChange: setCreatedFrom,
          },
          {
            type: 'date',
            key: 'createdTo',
            label: 'تاريخ الإنشاء إلى',
            value: createdTo,
            onChange: setCreatedTo,
          },
        ]}
        onReset={resetFilters}
      />

      {filteredQuotations.length === 0 && !loading ? (
        <EmptyState title="لا توجد عروض" />
      ) : (
        <Table
          columns={columns}
          data={filteredQuotations}
          loading={loading}
        />
      )}
    </div>
  );
};
