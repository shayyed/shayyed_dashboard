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
import type { ServiceRequest, QuickServiceOrder } from '../types';
import { RequestStatus, QuickServiceOrderStatus } from '../types';
import { formatDate, formatSar } from '../utils/formatters';
import { mockUsers, mockQuotations } from '../mock/data';

const TYPE_TABS = [
  { label: 'المناقصات', value: 'regular' },
  { label: 'الخدمات السريعة', value: 'quick' },
];

const REGULAR_STATUS_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'مسودات', value: RequestStatus.DRAFT },
  { label: 'مرسلة', value: RequestStatus.SUBMITTED },
  { label: 'مقبولة', value: RequestStatus.ACCEPTED },
  { label: 'مكتملة', value: RequestStatus.COMPLETED },
  { label: 'ملغاة', value: RequestStatus.CANCELLED },
];

const QUICK_STATUS_TABS = [
  { label: 'الكل', value: 'all' },
  { label: 'مسودات', value: QuickServiceOrderStatus.DRAFT },
  { label: 'مرسلة', value: QuickServiceOrderStatus.SENT },
  { label: 'مقبولة', value: QuickServiceOrderStatus.ACCEPTED },
  { label: 'مكتملة', value: QuickServiceOrderStatus.COMPLETED },
  { label: 'ملغاة', value: QuickServiceOrderStatus.CANCELLED },
];

export const RequestsPage: React.FC = () => {
  const [typeTab, setTypeTab] = useState<'regular' | 'quick'>('regular');
  const [statusTab, setStatusTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickServiceOrder[]>([]);
  
  // فلاتر الطلبات العادية
  const [regularSearch, setRegularSearch] = useState('');
  const [regularStatus, setRegularStatus] = useState('');
  const [regularServiceType, setRegularServiceType] = useState('');
  const [regularCity, setRegularCity] = useState('');
  const [regularDistrict, setRegularDistrict] = useState('');
  const [regularBudgetMin, setRegularBudgetMin] = useState('');
  const [regularBudgetMax, setRegularBudgetMax] = useState('');
  const [regularUrgency, setRegularUrgency] = useState('');
  const [regularCreatedFrom, setRegularCreatedFrom] = useState('');
  const [regularCreatedTo, setRegularCreatedTo] = useState('');
  const [regularClient, setRegularClient] = useState('');
  
  // فلاتر الخدمات السريعة
  const [quickSearch, setQuickSearch] = useState('');
  const [quickStatus, setQuickStatus] = useState('');
  const [quickServiceType, setQuickServiceType] = useState('');
  const [quickCity, setQuickCity] = useState('');
  const [quickDistrict, setQuickDistrict] = useState('');
  const [quickUrgency, setQuickUrgency] = useState('');
  const [quickCreatedFrom, setQuickCreatedFrom] = useState('');
  const [quickCreatedTo, setQuickCreatedTo] = useState('');
  const [quickUpdatedFrom, setQuickUpdatedFrom] = useState('');
  const [quickUpdatedTo, setQuickUpdatedTo] = useState('');
  const [quickClient, setQuickClient] = useState('');
  const [quickContractor, setQuickContractor] = useState('');
  const [quickPriceMin, setQuickPriceMin] = useState('');
  const [quickPriceMax, setQuickPriceMax] = useState('');

  useEffect(() => {
    loadData();
  }, [typeTab, statusTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (typeTab === 'regular') {
        const data = await adminApi.listRequests();
        setRequests(data);
      } else {
        const data = await adminApi.listQuickServiceOrders();
        setQuickOrders(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب عدد العروض للطلبات العادية
  const getOffersCount = (requestId: string) => {
    return mockQuotations.filter(q => q.requestId === requestId).length;
  };

  // Get unique values for filters - Regular Requests
  const uniqueServiceTypes = useMemo(() => {
    const services = new Set<string>();
    requests.forEach(r => {
      if (r.serviceName) services.add(r.serviceName);
    });
    return Array.from(services).sort().map(s => ({ label: s, value: s }));
  }, [requests]);

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    requests.forEach(r => {
      if (r.location?.city) cities.add(r.location.city);
    });
    return Array.from(cities).sort().map(c => ({ label: c, value: c }));
  }, [requests]);

  const uniqueDistricts = useMemo(() => {
    const districts = new Set<string>();
    requests.forEach(r => {
      if (r.location?.district) districts.add(r.location.district);
    });
    return Array.from(districts).sort().map(d => ({ label: d, value: d }));
  }, [requests]);

  // Get unique values for filters - Quick Services
  const uniqueQuickServiceTypes = useMemo(() => {
    const services = new Set<string>();
    quickOrders.forEach(q => {
      if (q.serviceTitle) services.add(q.serviceTitle);
    });
    return Array.from(services).sort().map(s => ({ label: s, value: s }));
  }, [quickOrders]);

  const uniqueQuickCities = useMemo(() => {
    const cities = new Set<string>();
    quickOrders.forEach(q => {
      if (q.location?.city) cities.add(q.location.city);
    });
    return Array.from(cities).sort().map(c => ({ label: c, value: c }));
  }, [quickOrders]);

  const uniqueQuickDistricts = useMemo(() => {
    const districts = new Set<string>();
    quickOrders.forEach(q => {
      if (q.location?.district) districts.add(q.location.district);
    });
    return Array.from(districts).sort().map(d => ({ label: d, value: d }));
  }, [quickOrders]);

  // فلترة الطلبات العادية
  const filteredRegularRequests = useMemo(() => {
    let filtered = requests;
    
    // فلترة حسب الحالة من Tab
    if (statusTab !== 'all') {
      filtered = filtered.filter(r => r.status === statusTab);
    }
    
    // فلترة حسب الحالة من FilterBar
    if (regularStatus) {
      filtered = filtered.filter(r => r.status === regularStatus);
    }
    
    if (regularSearch) {
      const searchLower = regularSearch.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.serviceName.toLowerCase().includes(searchLower) ||
        (mockUsers.find(u => u.id === r.clientId)?.name || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (regularCity) {
      filtered = filtered.filter(r => r.location.city === regularCity);
    }
    
    if (regularDistrict) {
      filtered = filtered.filter(r => r.location.district === regularDistrict);
    }
    
    if (regularUrgency) {
      filtered = filtered.filter(r => r.urgency === regularUrgency);
    }
    
    if (regularCreatedFrom) {
      filtered = filtered.filter(r => r.createdAt >= regularCreatedFrom);
    }
    
    if (regularCreatedTo) {
      filtered = filtered.filter(r => r.createdAt <= regularCreatedTo);
    }
    
    if (regularServiceType) {
      filtered = filtered.filter(r => r.serviceName === regularServiceType);
    }
    
    // نطاق الميزانية - hidden for now
    // if (regularBudgetMin) {
    //   const minValue = parseFloat(regularBudgetMin.replace(/[^\d.]/g, ''));
    //   if (!isNaN(minValue)) {
    //     filtered = filtered.filter(r => {
    //       const budgetMatch = r.budgetRange.match(/[\d,]+/g);
    //       if (budgetMatch && budgetMatch.length > 0) {
    //         const budgetValue = parseFloat(budgetMatch[0].replace(/,/g, ''));
    //         return budgetValue >= minValue;
    //       }
    //       return false;
    //     });
    //   }
    // }
    // if (regularBudgetMax) {
    //   const maxValue = parseFloat(regularBudgetMax.replace(/[^\d.]/g, ''));
    //   if (!isNaN(maxValue)) {
    //     filtered = filtered.filter(r => {
    //       const budgetMatch = r.budgetRange.match(/[\d,]+/g);
    //       if (budgetMatch && budgetMatch.length > 0) {
    //         const budgetValue = parseFloat(budgetMatch[0].replace(/,/g, ''));
    //         return budgetValue <= maxValue;
    //       }
    //       return false;
    //     });
    //   }
    // }
    
    if (regularClient) {
      filtered = filtered.filter(r => r.clientId === regularClient);
    }
    
    return filtered;
  }, [requests, statusTab, regularSearch, regularStatus, regularServiceType, regularCity, regularDistrict, regularUrgency, regularCreatedFrom, regularCreatedTo, regularClient]);

  // فلترة الخدمات السريعة
  const filteredQuickOrders = useMemo(() => {
    let filtered = quickOrders;
    
    // فلترة حسب الحالة من Tab
    if (statusTab !== 'all') {
      filtered = filtered.filter(q => q.status === statusTab);
    }
    
    // فلترة حسب الحالة من FilterBar
    if (quickStatus) {
      filtered = filtered.filter(q => q.status === quickStatus);
    }
    
    if (quickSearch) {
      const searchLower = quickSearch.toLowerCase();
      filtered = filtered.filter(q => 
        (q.title || '').toLowerCase().includes(searchLower) ||
        (q.description || '').toLowerCase().includes(searchLower) ||
        q.serviceTitle.toLowerCase().includes(searchLower) ||
        (mockUsers.find(u => u.id === q.clientId)?.name || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (quickCity) {
      filtered = filtered.filter(q => q.location.city === quickCity);
    }
    
    if (quickDistrict) {
      filtered = filtered.filter(q => q.location.district === quickDistrict);
    }
    
    if (quickUrgency) {
      filtered = filtered.filter(q => q.urgency === quickUrgency);
    }
    
    if (quickCreatedFrom) {
      filtered = filtered.filter(q => q.createdAt >= quickCreatedFrom);
    }
    
    if (quickCreatedTo) {
      filtered = filtered.filter(q => q.createdAt <= quickCreatedTo);
    }
    
    if (quickClient) {
      filtered = filtered.filter(q => q.clientId === quickClient);
    }
    
    if (quickContractor) {
      filtered = filtered.filter(q => q.contractorId === quickContractor);
    }
    
    if (quickServiceType) {
      filtered = filtered.filter(q => q.serviceTitle === quickServiceType);
    }
    
    return filtered;
  }, [quickOrders, statusTab, quickSearch, quickStatus, quickServiceType, quickCity, quickDistrict, quickUrgency, quickCreatedFrom, quickCreatedTo, quickClient, quickContractor]);

  // أعمدة جدول الطلبات العادية
  const regularColumns = [
    {
      key: 'id',
      label: 'رقم الطلب',
      render: (request: ServiceRequest) => (
        <Link to={`/requests/regular/${request.id}`} className="text-blue-600 hover:underline font-medium">
          {request.id}
        </Link>
      )
    },
    { key: 'title', label: 'العنوان' },
    { 
      key: 'client', 
      label: 'العميل',
      render: (request: ServiceRequest) => {
        const client = mockUsers.find(u => u.id === request.clientId);
        return client ? (
          <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        ) : '-';
      }
    },
    { key: 'serviceName', label: 'اسم الخدمة' },
    { 
      key: 'location', 
      label: 'الموقع',
      render: (request: ServiceRequest) => `${request.location.city}، ${request.location.district}`
    },
    // نطاق الميزانية - hidden for now
    // { key: 'budgetRange', label: 'الميزانية' },
    { 
      key: 'status', 
      label: 'الحالة',
      render: (request: ServiceRequest) => <StatusBadge status={request.status} />
    },
    { 
      key: 'offersCount', 
      label: 'عدد العروض',
      render: (request: ServiceRequest) => {
        const count = getOffersCount(request.id);
        return count > 0 ? (
          <Link to={`/requests/regular/${request.id}`} className="text-blue-600 hover:underline">
            {count} عرض
          </Link>
        ) : '0';
      }
    },
    { 
      key: 'urgency', 
      label: 'الاستعجال',
      render: (request: ServiceRequest) => (
        <span className={`text-xs px-2 py-1 rounded ${
          request.urgency === 'urgent' ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-600'
        }`}>
          {request.urgency === 'urgent' ? 'مستعجل' : 'عادي'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'تاريخ الإنشاء',
      render: (request: ServiceRequest) => formatDate(request.createdAt)
    },
    { 
      key: 'updatedAt', 
      label: 'تاريخ التحديث',
      render: (request: ServiceRequest) => formatDate(request.updatedAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (request: ServiceRequest) => (
        <div className="flex gap-2">
          <Link to={`/requests/regular/${request.id}`}>
            <Button variant="secondary">عرض التفاصيل</Button>
          </Link>
        </div>
      ),
    },
  ];

  // أعمدة جدول الخدمات السريعة
  const quickColumns = [
    {
      key: 'id',
      label: 'رقم الطلب',
      render: (order: QuickServiceOrder) => (
        <Link to={`/requests/quick/${order.id}`} className="text-blue-600 hover:underline font-medium">
          {order.id}
        </Link>
      )
    },
    { 
      key: 'title', 
      label: 'العنوان',
      render: (order: QuickServiceOrder) => order.title || order.serviceTitle
    },
    { 
      key: 'client', 
      label: 'العميل',
      render: (order: QuickServiceOrder) => {
        const client = mockUsers.find(u => u.id === order.clientId);
        return client ? (
          <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        ) : '-';
      }
    },
    { key: 'serviceTitle', label: 'اسم الخدمة' },
    { 
      key: 'location', 
      label: 'الموقع',
      render: (order: QuickServiceOrder) => `${order.location.city}، ${order.location.district}`
    },
    { 
      key: 'status', 
      label: 'الحالة',
      render: (order: QuickServiceOrder) => <StatusBadge status={order.status} />
    },
    { 
      key: 'urgency', 
      label: 'الاستعجال',
      render: (order: QuickServiceOrder) => {
        if (!order.urgency) return '-';
        return (
          <span className={`text-xs px-2 py-1 rounded ${
            order.urgency === 'urgent' ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-600'
          }`}>
            {order.urgency === 'urgent' ? 'مستعجل' : 'عادي'}
          </span>
        );
      }
    },
    { 
      key: 'createdAt', 
      label: 'تاريخ الإنشاء',
      render: (order: QuickServiceOrder) => formatDate(order.createdAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (order: QuickServiceOrder) => (
        <div className="flex gap-2">
          <Link to={`/requests/quick/${order.id}`}>
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

  const resetRegularFilters = () => {
    setRegularSearch('');
    setRegularStatus('');
    setRegularServiceType('');
    setRegularCity('');
    setRegularDistrict('');
    setRegularBudgetMin('');
    setRegularBudgetMax('');
    setRegularUrgency('');
    setRegularCreatedFrom('');
    setRegularCreatedTo('');
    setRegularClient('');
  };

  // Handle budget input - only allow numbers
  const handleBudgetMinChange = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    setRegularBudgetMin(numericValue);
  };

  const handleBudgetMaxChange = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    setRegularBudgetMax(numericValue);
  };

  const resetQuickFilters = () => {
    setQuickSearch('');
    setQuickStatus('');
    setQuickServiceType('');
    setQuickCity('');
    setQuickDistrict('');
    setQuickUrgency('');
    setQuickCreatedFrom('');
    setQuickCreatedTo('');
    setQuickClient('');
    setQuickContractor('');
  };

  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة المناقصات والخدمات السريعة</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs 
        tabs={TYPE_TABS} 
        value={typeTab} 
        onChange={(value) => {
          setTypeTab(value as 'regular' | 'quick');
          setStatusTab('all');
        }} 
      />

      {typeTab === 'regular' ? (
        <>
          <Tabs 
            tabs={REGULAR_STATUS_TABS} 
            value={statusTab} 
            onChange={setStatusTab} 
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="البحث برقم الطلب ، بالعنوان ، اسم الخدمة او اسم العميل"
                value={regularSearch}
                onChange={setRegularSearch}
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
                  { label: 'مسودة', value: RequestStatus.DRAFT },
                  { label: 'مرسلة', value: RequestStatus.SUBMITTED },
                  { label: 'مقبولة', value: RequestStatus.ACCEPTED },
                  { label: 'مكتملة', value: RequestStatus.COMPLETED },
                  { label: 'ملغاة', value: RequestStatus.CANCELLED },
                ],
                value: regularStatus,
                onChange: setRegularStatus,
              },
              {
                type: 'searchable-select',
                key: 'serviceType',
                label: 'نوع الخدمة',
                options: [{ label: 'الكل', value: '' }, ...uniqueServiceTypes],
                value: regularServiceType,
                onChange: setRegularServiceType,
              },
              {
                type: 'searchable-select',
                key: 'city',
                label: 'المدينة',
                options: [{ label: 'الكل', value: '' }, ...uniqueCities],
                value: regularCity,
                onChange: setRegularCity,
              },
              {
                type: 'searchable-select',
                key: 'district',
                label: 'الحي',
                options: [{ label: 'الكل', value: '' }, ...uniqueDistricts],
                value: regularDistrict,
                onChange: setRegularDistrict,
              },
              {
                type: 'select',
                key: 'urgency',
                label: 'الاستعجال',
                options: [
                  { label: 'الكل', value: '' },
                  { label: 'عادي', value: 'normal' },
                  { label: 'مستعجل', value: 'urgent' },
                ],
                value: regularUrgency,
                onChange: setRegularUrgency,
              },
              {
                type: 'date',
                key: 'createdFrom',
                label: 'تاريخ الإنشاء من',
                value: regularCreatedFrom,
                onChange: setRegularCreatedFrom,
              },
              {
                type: 'date',
                key: 'createdTo',
                label: 'تاريخ الإنشاء إلى',
                value: regularCreatedTo,
                onChange: setRegularCreatedTo,
              },
            ]}
            onReset={resetRegularFilters}
          />

          {filteredRegularRequests.length === 0 && !loading ? (
            <EmptyState title="لا توجد مناقصات" />
          ) : (
            <Table
              columns={regularColumns}
              data={filteredRegularRequests}
              loading={loading}
            />
          )}
        </>
      ) : (
        <>
          <Tabs 
            tabs={QUICK_STATUS_TABS} 
            value={statusTab} 
            onChange={setStatusTab} 
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="البحث برقم الطلب ، بالعنوان ، اسم الخدمة او اسم العميل"
                value={quickSearch}
                onChange={setQuickSearch}
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
                  { label: 'مسودة', value: QuickServiceOrderStatus.DRAFT },
                  { label: 'مرسلة', value: QuickServiceOrderStatus.SENT },
                  { label: 'مقبولة', value: QuickServiceOrderStatus.ACCEPTED },
                  { label: 'مكتملة', value: QuickServiceOrderStatus.COMPLETED },
                  { label: 'ملغاة', value: QuickServiceOrderStatus.CANCELLED },
                ],
                value: quickStatus,
                onChange: setQuickStatus,
              },
              {
                type: 'searchable-select',
                key: 'serviceType',
                label: 'نوع الخدمة',
                options: [{ label: 'الكل', value: '' }, ...uniqueQuickServiceTypes],
                value: quickServiceType,
                onChange: setQuickServiceType,
              },
              {
                type: 'searchable-select',
                key: 'city',
                label: 'المدينة',
                options: [{ label: 'الكل', value: '' }, ...uniqueQuickCities],
                value: quickCity,
                onChange: setQuickCity,
              },
              {
                type: 'searchable-select',
                key: 'district',
                label: 'الحي',
                options: [{ label: 'الكل', value: '' }, ...uniqueQuickDistricts],
                value: quickDistrict,
                onChange: setQuickDistrict,
              },
              {
                type: 'select',
                key: 'urgency',
                label: 'الاستعجال',
                options: [
                  { label: 'الكل', value: '' },
                  { label: 'عادي', value: 'normal' },
                  { label: 'مستعجل', value: 'urgent' },
                ],
                value: quickUrgency,
                onChange: setQuickUrgency,
              },
              {
                type: 'date',
                key: 'createdFrom',
                label: 'تاريخ الإنشاء من',
                value: quickCreatedFrom,
                onChange: setQuickCreatedFrom,
              },
              {
                type: 'date',
                key: 'createdTo',
                label: 'تاريخ الإنشاء إلى',
                value: quickCreatedTo,
                onChange: setQuickCreatedTo,
              },
            ]}
            onReset={resetQuickFilters}
          />

          {filteredQuickOrders.length === 0 && !loading ? (
            <EmptyState title="لا توجد طلبات خدمات سريعة" />
          ) : (
            <Table
              columns={quickColumns}
              data={filteredQuickOrders}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  );
};
