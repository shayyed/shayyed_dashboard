import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Contract, ServiceRequest, Quotation, QuickServiceOrder, Project } from '../types';
import { formatSar, formatDate } from '../utils/formatters';

export const ContractsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickServiceOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
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
      const [c, r, q, o, p] = await Promise.all([
        adminApi.listContracts(),
        adminApi.listRequests(),
        adminApi.listQuotations(),
        adminApi.listQuickServiceOrders(),
        adminApi.listProjects(),
      ]);
      setContracts(c);
      setRequests(r);
      setQuotations(q);
      setQuickOrders(o);
      setProjects(p);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique requests for searchable select
  const uniqueRequests = useMemo(() => {
    const requestMap = new Map<string, { label: string; value: string }>();
    requests.forEach((r) => {
      requestMap.set(r.id, { label: r.title, value: r.id });
    });
    quickOrders.forEach((o) => {
      requestMap.set(o.id, { label: o.title || o.serviceTitle, value: o.id });
    });
    return Array.from(requestMap.values());
  }, [requests, quickOrders]);

  const uniqueQuotations = useMemo(() => {
    const quotationMap = new Map<string, { label: string; value: string }>();
    quotations.forEach((q) => {
      quotationMap.set(q.id, {
        label: `${q.contractorName} - ${formatSar(q.price)}`,
        value: q.id,
      });
    });
    return Array.from(quotationMap.values());
  }, [quotations]);

  const uniqueClients = useMemo(() => {
    const clientMap = new Map<string, { label: string; value: string }>();
    contracts.forEach((c) => {
      if (c.clientId && c.clientName && !clientMap.has(c.clientId)) {
        clientMap.set(c.clientId, { label: c.clientName, value: c.clientId });
      }
    });
    return Array.from(clientMap.values());
  }, [contracts]);

  const uniqueContractors = useMemo(() => {
    const contractorMap = new Map<string, { label: string; value: string }>();
    contracts.forEach((c) => {
      if (c.contractorId && c.contractorName && !contractorMap.has(c.contractorId)) {
        contractorMap.set(c.contractorId, { label: c.contractorName, value: c.contractorId });
      }
    });
    return Array.from(contractorMap.values());
  }, [contracts]);

  // فلترة العقود
  const filteredContracts = useMemo(() => {
    let filtered = contracts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) => {
        const proj = projects.find((p) => p.contractId === c.id);
        return (
          (c.contractNumber || '').toLowerCase().includes(searchLower) ||
          c.id.toLowerCase().includes(searchLower) ||
          (proj?.title || '').toLowerCase().includes(searchLower) ||
          (c.clientName || '').toLowerCase().includes(searchLower) ||
          (c.contractorName || '').toLowerCase().includes(searchLower)
        );
      });
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
  }, [
    contracts,
    search,
    request,
    quotation,
    client,
    contractor,
    priceMin,
    priceMax,
    createdFrom,
    createdTo,
    projects,
  ]);

  const displayContractRef = (c: Contract) => c.contractNumber || c.id;

  // أعمدة الجدول
  const columns = [
    { 
      key: 'id', 
      label: 'رقم العقد',
      render: (contract: Contract) => (
        <Link to={`/contracts/${contract.id}`} className="text-blue-600 hover:underline font-medium">
          {displayContractRef(contract)}
        </Link>
      )
    },
    { 
      key: 'project', 
      label: 'المشروع المرتبط',
      render: (contract: Contract) => {
        const project = projects.find((p) => p.contractId === contract.id);
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
        const reg = requests.find((r) => r.id === contract.requestId);
        const qo = quickOrders.find((o) => o.id === contract.requestId);
        if (reg) {
          return (
            <Link to={`/requests/regular/${contract.requestId}`} className="text-blue-600 hover:underline">
              {reg.title}
            </Link>
          );
        }
        if (qo) {
          return (
            <Link to={`/requests/quick/${contract.requestId}`} className="text-blue-600 hover:underline">
              {qo.title || qo.serviceTitle}
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
        const quotation = quotations.find((q) => q.id === contract.quotationId);
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
      render: (contract: Contract) =>
        contract.clientId ? (
          <Link to={`/users/clients/${contract.clientId}`} className="text-blue-600 hover:underline">
            {contract.clientName || contract.clientId}
          </Link>
        ) : (
          '-'
        )
    },
    { 
      key: 'contractor', 
      label: 'المقاول',
      render: (contract: Contract) =>
        contract.contractorId ? (
          <Link
            to={`/users/contractors/${contract.contractorId}`}
            className="text-blue-600 hover:underline"
          >
            {contract.contractorName || contract.contractorId}
          </Link>
        ) : (
          '-'
        )
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
