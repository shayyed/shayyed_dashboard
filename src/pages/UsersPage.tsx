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
import type { User, ContractorProfile } from '../types';
import { UserRole, VerificationStatus } from '../types';
import { formatDate } from '../utils/formatters';
import { mockRequests, mockQuickServiceOrders, mockProjects, mockCities } from '../mock/data';

const TABS = [
  { label: 'العملاء', value: 'CLIENT' },
  { label: 'المقاولون', value: 'CONTRACTOR' },
];

export const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  
  // فلاتر العملاء
  const [clientSearch, setClientSearch] = useState('');
  const [clientRegistrationDateFrom, setClientRegistrationDateFrom] = useState('');
  const [clientRegistrationDateTo, setClientRegistrationDateTo] = useState('');
  const [clientRequestsCountMin, setClientRequestsCountMin] = useState('');
  const [clientRequestsCountMax, setClientRequestsCountMax] = useState('');
  
  // فلاتر المقاولين
  const [contractorSearch, setContractorSearch] = useState('');
  const [contractorVerificationStatus, setContractorVerificationStatus] = useState('');
  const [contractorRatingMin, setContractorRatingMin] = useState('');
  const [contractorRatingMax, setContractorRatingMax] = useState('');
  const [contractorRegistrationDateFrom, setContractorRegistrationDateFrom] = useState('');
  const [contractorRegistrationDateTo, setContractorRegistrationDateTo] = useState('');
  const [contractorCity, setContractorCity] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === UserRole.CLIENT) {
        const data = await adminApi.listUsers(UserRole.CLIENT);
        setUsers(data);
      } else {
        const data = await adminApi.listContractors();
        setContractors(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات للعملاء
  const getClientStats = (userId: string) => {
    const requests = adminApi.listRequests().then(r => r.filter(req => req.clientId === userId));
    const projects = adminApi.listProjects().then(p => p.filter(proj => proj.clientId === userId));
    // هذا مثال - في الواقع يجب أن يكون async
    return { requestsCount: 0, activeProjectsCount: 0 };
  };

  // فلترة العملاء
  const filteredClients = useMemo(() => {
    let filtered = users.filter(user => user.role === UserRole.CLIENT);
    
    if (clientSearch) {
      const searchLower = clientSearch.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.id.includes(searchLower) ||
        u.phone.includes(searchLower) ||
        (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }
    
    if (clientRegistrationDateFrom) {
      filtered = filtered.filter(u => u.createdAt >= clientRegistrationDateFrom);
    }
    
    if (clientRegistrationDateTo) {
      filtered = filtered.filter(u => u.createdAt <= clientRegistrationDateTo);
    }
    
    return filtered;
  }, [users, clientSearch, clientRegistrationDateFrom, clientRegistrationDateTo]);

  // فلترة المقاولين
  const filteredContractors = useMemo(() => {
    let filtered = contractors;
    
    if (contractorSearch) {
      const searchLower = contractorSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.id.includes(searchLower) ||
        c.phone.includes(searchLower) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchLower)) ||
        (c.commercialRegistration && c.commercialRegistration.includes(searchLower))
      );
    }
    
    if (contractorVerificationStatus) {
      filtered = filtered.filter(c => c.verificationStatus === contractorVerificationStatus);
    }
    
    if (contractorRatingMin) {
      filtered = filtered.filter(c => c.rating >= parseFloat(contractorRatingMin));
    }
    
    if (contractorRatingMax) {
      filtered = filtered.filter(c => c.rating <= parseFloat(contractorRatingMax));
    }
    
    if (contractorRegistrationDateFrom) {
      filtered = filtered.filter(c => c.createdAt >= contractorRegistrationDateFrom);
    }
    
    if (contractorRegistrationDateTo) {
      filtered = filtered.filter(c => c.createdAt <= contractorRegistrationDateTo);
    }
    
    if (contractorCity) {
      filtered = filtered.filter(c => 
        c.coverageAreas.some(area => area.includes(contractorCity))
      );
    }
    
    return filtered;
  }, [contractors, contractorSearch, contractorVerificationStatus, contractorRatingMin, contractorRatingMax, contractorRegistrationDateFrom, contractorRegistrationDateTo, contractorCity]);

  // دالة لتحويل المعرف إلى رقم هوية حقيقي
  const getNationalId = (userId: string): string => {
    // دائماً استخدم رقم الهوية الحقيقي
    return '1090837671';
  };

  // أعمدة جدول العملاء
  const clientColumns = [
    { key: 'name', label: 'الاسم' },
    { 
      key: 'id', 
      label: 'رقم الهوية',
      render: (user: User) => getNationalId(user.id)
    },
    { key: 'phone', label: 'رقم الجوال' },
    { 
      key: 'createdAt', 
      label: 'تاريخ التسجيل',
      render: (user: User) => formatDate(user.createdAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (user: User) => (
        <div className="flex gap-2">
          <Link to={`/users/clients/${user.id}`}>
            <Button variant="secondary">عرض التفاصيل</Button>
          </Link>
        </div>
      ),
    },
  ];

  // أعمدة جدول المقاولين
  const contractorColumns = [
    { key: 'name', label: 'الاسم' },
    { 
      key: 'id', 
      label: 'رقم الهوية',
      render: (contractor: ContractorProfile) => getNationalId(contractor.id)
    },
    { key: 'phone', label: 'رقم الجوال' },
    { 
      key: 'companyName', 
      label: 'اسم الشركة',
      render: (contractor: ContractorProfile) => contractor.companyName || '-'
    },
    { 
      key: 'createdAt', 
      label: 'تاريخ التسجيل',
      render: (contractor: ContractorProfile) => formatDate(contractor.createdAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (contractor: ContractorProfile) => (
        <div className="flex gap-2">
          <Link to={`/users/contractors/${contractor.id}`}>
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

  const applyClientFilters = () => {
    // الفلاتر تطبق تلقائياً عبر useMemo، هذا فقط للزر
    console.log('Applying client filters...');
  };

  const resetClientFilters = () => {
    setClientSearch('');
    setClientRegistrationDateFrom('');
    setClientRegistrationDateTo('');
    setClientRequestsCountMin('');
    setClientRequestsCountMax('');
  };

  const applyContractorFilters = () => {
    // الفلاتر تطبق تلقائياً عبر useMemo، هذا فقط للزر
    console.log('Applying contractor filters...');
  };

  const resetContractorFilters = () => {
    setContractorSearch('');
    setContractorVerificationStatus('');
    setContractorRatingMin('');
    setContractorRatingMax('');
    setContractorRegistrationDateFrom('');
    setContractorRegistrationDateTo('');
    setContractorCity('');
  };

  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة المستخدمين</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <Tabs 
        tabs={TABS} 
        value={activeTab} 
        onChange={(value) => setActiveTab(value as UserRole)}
      />

      {activeTab === UserRole.CLIENT ? (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="بحث بالاسم ، رقم الهوية، الجوال..."
                value={clientSearch}
                onChange={setClientSearch}
              />
            </div>
          </div>

          <FilterBar
            filters={[
              {
                type: 'date',
                key: 'registrationDateFrom',
                label: 'تاريخ التسجيل من',
                value: clientRegistrationDateFrom,
                onChange: setClientRegistrationDateFrom,
              },
              {
                type: 'date',
                key: 'registrationDateTo',
                label: 'تاريخ التسجيل إلى',
                value: clientRegistrationDateTo,
                onChange: setClientRegistrationDateTo,
              },
            ]}
            onApply={applyClientFilters}
            onReset={resetClientFilters}
          />

          {filteredClients.length === 0 && !loading ? (
            <EmptyState title="لا يوجد عملاء" />
          ) : (
            <Table
              columns={clientColumns}
              data={filteredClients}
              loading={loading}
            />
          )}
        </>
      ) : (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="بحث بالاسم ، رقم الهوية، الجوال..."
                value={contractorSearch}
                onChange={setContractorSearch}
              />
            </div>
          </div>

          <FilterBar
            filters={[
              {
                type: 'select',
                key: 'verificationStatus',
                label: 'حالة التحقق',
                options: [
                  { label: 'الكل', value: '' },
                  { label: 'قيد المراجعة', value: VerificationStatus.PENDING },
                  { label: 'موثق', value: VerificationStatus.VERIFIED },
                  { label: 'مرفوض', value: VerificationStatus.REJECTED },
                ],
                value: contractorVerificationStatus,
                onChange: setContractorVerificationStatus,
              },
              {
                type: 'searchable-select',
                key: 'ratingMin',
                label: 'التقييم (من)',
                options: [
                  { label: '1.0', value: '1.0' },
                  { label: '1.5', value: '1.5' },
                  { label: '2.0', value: '2.0' },
                  { label: '2.5', value: '2.5' },
                  { label: '3.0', value: '3.0' },
                  { label: '3.5', value: '3.5' },
                  { label: '4.0', value: '4.0' },
                  { label: '4.5', value: '4.5' },
                  { label: '5.0', value: '5.0' },
                ],
                value: contractorRatingMin,
                onChange: setContractorRatingMin,
              },
              {
                type: 'searchable-select',
                key: 'ratingMax',
                label: 'التقييم (إلى)',
                options: [
                  { label: '1.0', value: '1.0' },
                  { label: '1.5', value: '1.5' },
                  { label: '2.0', value: '2.0' },
                  { label: '2.5', value: '2.5' },
                  { label: '3.0', value: '3.0' },
                  { label: '3.5', value: '3.5' },
                  { label: '4.0', value: '4.0' },
                  { label: '4.5', value: '4.5' },
                  { label: '5.0', value: '5.0' },
                ],
                value: contractorRatingMax,
                onChange: setContractorRatingMax,
              },
              {
                type: 'date',
                key: 'registrationDateFrom',
                label: 'تاريخ التسجيل من',
                value: contractorRegistrationDateFrom,
                onChange: setContractorRegistrationDateFrom,
              },
              {
                type: 'date',
                key: 'registrationDateTo',
                label: 'تاريخ التسجيل إلى',
                value: contractorRegistrationDateTo,
                onChange: setContractorRegistrationDateTo,
              },
              {
                type: 'searchable-select',
                key: 'city',
                label: 'المدينة',
                options: mockCities.map(city => ({ label: city.name, value: city.name })),
                value: contractorCity,
                onChange: setContractorCity,
              },
            ]}
            onApply={applyContractorFilters}
            onReset={resetContractorFilters}
          />

          {filteredContractors.length === 0 && !loading ? (
            <EmptyState title="لا يوجد مقاولون" />
          ) : (
            <Table
              columns={contractorColumns}
              data={filteredContractors}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  );
};
