import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Contract } from '../types';
import { formatSar, formatDate } from '../utils/formatters';
import { mockUsers, mockRequests, mockQuotations, mockProjects, mockQuickServiceOrders } from '../mock/data';

export const ContractsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // فلاتر
  const [search, setSearch] = useState('');
  const [request, setRequest] = useState('');
  const [quotation, setQuotation] = useState('');
  const [client, setClient] = useState('');
  const [contractor, setContractor] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listContracts();
      setContracts(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique requests for searchable select
  const uniqueRequests = useMemo(() => {
    const requestMap = new Map();
    mockRequests.forEach(r => {
      requestMap.set(r.id, {
        label: r.title,
        value: r.id
      });
    });
    // Contracts are only for regular requests, not quick services
    return Array.from(requestMap.values());
  }, []);

  // Get unique quotations for searchable select
  const uniqueQuotations = useMemo(() => {
    const quotationMap = new Map();
    mockQuotations.forEach(q => {
      quotationMap.set(q.id, {
        label: `${q.contractorName} - ${formatSar(q.price)}`,
        value: q.id
      });
    });
    return Array.from(quotationMap.values());
  }, []);

  // Get unique clients for searchable select
  const uniqueClients = useMemo(() => {
    const clientMap = new Map();
    contracts.forEach(c => {
      const client = mockUsers.find(u => u.id === c.clientId);
      if (client && !clientMap.has(client.id)) {
        clientMap.set(client.id, {
          label: client.name,
          value: client.id
        });
      }
    });
    return Array.from(clientMap.values());
  }, [contracts]);

  // Get unique contractors for searchable select
  const uniqueContractors = useMemo(() => {
    const contractorMap = new Map();
    contracts.forEach(c => {
      const contractor = mockUsers.find(u => u.id === c.contractorId);
      if (contractor && !contractorMap.has(contractor.id)) {
        contractorMap.set(contractor.id, {
          label: contractor.name,
          value: contractor.id
        });
      }
    });
    return Array.from(contractorMap.values());
  }, [contracts]);

  // فلترة العقود
  const filteredContracts = useMemo(() => {
    let filtered = contracts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.id.toLowerCase().includes(searchLower) ||
        (mockProjects.find(p => p.contractId === c.id)?.title || '').toLowerCase().includes(searchLower) ||
        (mockUsers.find(u => u.id === c.clientId)?.name || '').toLowerCase().includes(searchLower) ||
        (mockUsers.find(u => u.id === c.contractorId)?.name || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (request) {
      filtered = filtered.filter(c => c.requestId === request);
    }
    
    if (quotation) {
      filtered = filtered.filter(c => c.quotationId === quotation);
    }
    
    if (client) {
      filtered = filtered.filter(c => c.clientId === client);
    }
    
    if (contractor) {
      filtered = filtered.filter(c => c.contractorId === contractor);
    }
    
    if (priceMin) {
      filtered = filtered.filter(c => c.totalPrice >= parseFloat(priceMin));
    }
    
    if (priceMax) {
      filtered = filtered.filter(c => c.totalPrice <= parseFloat(priceMax));
    }
    
    if (createdFrom) {
      filtered = filtered.filter(c => c.createdAt >= createdFrom);
    }
    
    if (createdTo) {
      filtered = filtered.filter(c => c.createdAt <= createdTo);
    }
    
    return filtered;
  }, [contracts, search, request, quotation, client, contractor, priceMin, priceMax, createdFrom, createdTo]);

  // أعمدة الجدول
  const columns = [
    { 
      key: 'id', 
      label: 'رقم العقد',
      render: (contract: Contract) => (
        <Link to={`/contracts/${contract.id}`} className="text-blue-600 hover:underline font-medium">
          {contract.id}
        </Link>
      )
    },
    { 
      key: 'project', 
      label: 'المشروع المرتبط',
      render: (contract: Contract) => {
        const project = mockProjects.find(p => p.contractId === contract.id);
        if (project) {
          return (
            <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
              {project.title}
            </Link>
          );
        }
        return '-';
      }
    },
    { 
      key: 'request', 
      label: 'الطلب المرتبط',
      render: (contract: Contract) => {
        const request = mockRequests.find(r => r.id === contract.requestId);
        if (request) {
          return (
            <Link to={`/requests/regular/${contract.requestId}`} className="text-blue-600 hover:underline">
              {request.title}
            </Link>
          );
        }
        return contract.requestId;
      }
    },
    { 
      key: 'quotation', 
      label: 'العرض المرتبط',
      render: (contract: Contract) => {
        const quotation = mockQuotations.find(q => q.id === contract.quotationId);
        if (quotation) {
          return (
            <Link to={`/quotations/${contract.quotationId}`} className="text-blue-600 hover:underline">
              {quotation.contractorName} - {formatSar(quotation.price)}
            </Link>
          );
        }
        return contract.quotationId;
      }
    },
    { 
      key: 'client', 
      label: 'العميل',
      render: (contract: Contract) => {
        const client = mockUsers.find(u => u.id === contract.clientId);
        return client ? (
          <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        ) : contract.clientId;
      }
    },
    { 
      key: 'contractor', 
      label: 'المقاول',
      render: (contract: Contract) => {
        const contractor = mockUsers.find(u => u.id === contract.contractorId);
        return contractor ? (
          <Link to={`/users/contractors/${contractor.id}`} className="text-blue-600 hover:underline">
            {contractor.name}
          </Link>
        ) : contract.contractorId;
      }
    },
    { 
      key: 'totalPrice', 
      label: 'السعر الإجمالي',
      render: (contract: Contract) => (
        <span className="font-semibold">{formatSar(contract.totalPrice)}</span>
      )
    },
    { 
      key: 'duration', 
      label: 'المدة',
      render: (contract: Contract) => `${contract.duration} يوم`
    },
    { 
      key: 'milestones', 
      label: 'عدد الدفعات',
      render: (contract: Contract) => contract.milestones?.length || 0
    },
    { 
      key: 'createdAt', 
      label: 'تاريخ الإنشاء',
      render: (contract: Contract) => formatDate(contract.createdAt)
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (contract: Contract) => (
        <div className="flex gap-2">
          <Link to={`/contracts/${contract.id}`}>
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
    setRequest('');
    setQuotation('');
    setClient('');
    setContractor('');
    setPriceMin('');
    setPriceMax('');
    setCreatedFrom('');
    setCreatedTo('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">إدارة العقود</h1>
        <ExportButton onExport={handleExport} />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="بحث برقم العقد، عنوان المشروع، اسم العميل، أو اسم المقاول..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <FilterBar
        filters={[
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
            key: 'quotation',
            label: 'العرض',
            options: uniqueQuotations,
            value: quotation,
            onChange: setQuotation,
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
            type: 'searchable-select',
            key: 'contractor',
            label: 'المقاول',
            options: uniqueContractors,
            value: contractor,
            onChange: setContractor,
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

      {filteredContracts.length === 0 && !loading ? (
        <EmptyState title="لا توجد عقود" />
      ) : (
        <Table
          columns={columns}
          data={filteredContracts}
          loading={loading}
        />
      )}
    </div>
  );
};
