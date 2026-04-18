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
import type { Quotation, ServiceRequest, QuickServiceOrder } from '../types';
import { QuotationStatus } from '../types';
import { formatSar, formatDate } from '../utils/formatters';

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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickServiceOrder[]>([]);
  
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qRows, rRows, oRows] = await Promise.all([
        adminApi.listQuotations(),
        adminApi.listRequests(),
        adminApi.listQuickServiceOrders(),
      ]);
      setQuotations(qRows);
      setRequests(rRows);
      setQuickOrders(oRows);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestType = (q: Quotation): 'regular' | 'quick' => {
    if (q.requestKind === 'regular') return 'regular';
    if (q.requestKind === 'quick') return 'quick';
    if (requests.some((r) => r.id === q.requestId)) return 'regular';
    if (quickOrders.some((o) => o.id === q.requestId)) return 'quick';
    return 'regular';
  };

  const requestTitleFor = (q: Quotation): string => {
    if (q.requestTitle) return q.requestTitle;
    const r = requests.find((x) => x.id === q.requestId);
    if (r) return r.title;
    const o = quickOrders.find((x) => x.id === q.requestId);
    return o?.title || o?.serviceTitle || '-';
  };

  // Get unique contractors for searchable select
  const uniqueContractors = useMemo(() => {
    const contractorMap = new Map<string, { label: string; value: string }>();
    quotations.forEach((q) => {
      if (!contractorMap.has(q.contractorId)) {
        contractorMap.set(q.contractorId, {
          label: q.contractorName,
          value: q.contractorId,
        });
      }
    });
    return Array.from(contractorMap.values());
  }, [quotations]);

  const uniqueRequests = useMemo(() => {
    const requestMap = new Map<string, { label: string; value: string }>();
    requests.forEach((r) => {
      requestMap.set(r.id, { label: r.title, value: r.id });
    });
    quickOrders.forEach((q) => {
      requestMap.set(q.id, { label: q.title || q.serviceTitle, value: q.id });
    });
    return Array.from(requestMap.values());
  }, [requests, quickOrders]);

  const uniqueClients = useMemo(() => {
    const clientMap = new Map<string, { label: string; value: string }>();
    requests.forEach((r) => {
      const name = r.clientName || r.clientId;
      if (r.clientId && !clientMap.has(r.clientId)) {
        clientMap.set(r.clientId, { label: name, value: r.clientId });
      }
    });
    quickOrders.forEach((q) => {
      const name = q.clientName || q.clientId;
      if (q.clientId && !clientMap.has(q.clientId)) {
        clientMap.set(q.clientId, { label: name, value: q.clientId });
      }
    });
    quotations.forEach((q) => {
      if (q.clientId && q.clientName && !clientMap.has(q.clientId)) {
        clientMap.set(q.clientId, { label: q.clientName, value: q.clientId });
      }
    });
    return Array.from(clientMap.values());
  }, [requests, quickOrders, quotations]);

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
      filtered = filtered.filter(
        (q) =>
          q.contractorName.toLowerCase().includes(searchLower) ||
          requestTitleFor(q).toLowerCase().includes(searchLower) ||
          (q.notes || '').toLowerCase().includes(searchLower) ||
          (q.quotationNumber || '').toLowerCase().includes(searchLower) ||
          q.id.toLowerCase().includes(searchLower)
      );
    }
    
    if (contractor) {
      filtered = filtered.filter(q => q.contractorId === contractor);
    }
    
    if (request) {
      filtered = filtered.filter(q => q.requestId === request);
    }
    
    if (client) {
      filtered = filtered.filter((q) => {
        if (q.clientId) return q.clientId === client;
        const regularRequest = requests.find((r) => r.id === q.requestId);
        const quickOrder = quickOrders.find((qo) => qo.id === q.requestId);
        return (
          (regularRequest && regularRequest.clientId === client) ||
          (quickOrder && quickOrder.clientId === client)
        );
      });
    }

    if (requestType) {
      filtered = filtered.filter((q) => {
        const type = getRequestType(q);
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
  }, [
    quotations,
    statusTab,
    search,
    status,
    contractor,
    request,
    client,
    requestType,
    priceMin,
    priceMax,
    createdFrom,
    createdTo,
    requests,
    quickOrders,
  ]);

  // أعمدة الجدول
  const displayQuotationRef = (q: Quotation) => q.quotationNumber || q.id;

  const columns = [
    {
      key: 'id',
      label: 'رقم العرض',
      render: (quotation: Quotation) => (
        <Link to={`/quotations/${quotation.id}`} className="text-blue-600 hover:underline font-medium">
          {displayQuotationRef(quotation)}
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
        const title = requestTitleFor(quotation);
        const rt = getRequestType(quotation);
        const path =
          rt === 'regular'
            ? `/requests/regular/${quotation.requestId}`
            : `/requests/quick/${quotation.requestId}`;
        return (
          <Link to={path} className="text-blue-600 hover:underline">
            {title}
          </Link>
        );
      }
    },
    { 
      key: 'requestType', 
      label: 'نوع الطلب',
      render: (quotation: Quotation) => {
        const type = getRequestType(quotation);
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
        const type = getRequestType(quotation);
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
