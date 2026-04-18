import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Info } from 'lucide-react';
import { adminApi } from '../services/api';
import type { Project, ServiceRequest, Contract, QuickServiceOrder } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

export const ProjectsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickServiceOrder[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [allProjects, r, o, c] = await Promise.all([
        adminApi.listProjects(),
        adminApi.listRequests(),
        adminApi.listQuickServiceOrders(),
        adminApi.listContracts(),
      ]);
      setProjects(allProjects);
      setRequests(r);
      setQuickOrders(o);
      setContracts(c);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const request = requests.find((r) => r.id === p.requestId);
        const qo = quickOrders.find((o) => o.id === p.requestId);
        return (
          (p.projectNumber || '').toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          (request?.title || '').toLowerCase().includes(query) ||
          (request?.serviceName || '').toLowerCase().includes(query) ||
          (request?.id || '').toLowerCase().includes(query) ||
          (qo?.title || '').toLowerCase().includes(query) ||
          (qo?.serviceTitle || '').toLowerCase().includes(query) ||
          (p.clientName || '').toLowerCase().includes(query) ||
          (p.contractorName || '').toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [projects, searchQuery, requests, quickOrders]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export projects:', filteredProjects);
  };

  const displayProjectRef = (p: Project) => p.projectNumber || p.id;

  const linkedRequestLabel = (project: Project) => {
    const request = requests.find((r) => r.id === project.requestId);
    const qo = quickOrders.find((o) => o.id === project.requestId);
    return (
      request?.title ||
      qo?.title ||
      qo?.serviceTitle ||
      project.title ||
      project.requestId
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'رقم المشروع',
      render: (project: Project) => (
        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline font-medium">
          {displayProjectRef(project)}
        </Link>
      ),
    },
    {
      key: 'requestId',
      label: 'الطلب المرتبط',
      render: (project: Project) => {
        const isQuick = quickOrders.some((o) => o.id === project.requestId);
        const path = isQuick
          ? `/requests/quick/${project.requestId}`
          : `/requests/regular/${project.requestId}`;
        const label = linkedRequestLabel(project);
        return (
          <Link to={path} className="text-blue-600 hover:underline">
            {label}
          </Link>
        );
      },
    },
    {
      key: 'title',
      label: 'العنوان',
      render: (project: Project) => {
        const request = requests.find((r) => r.id === project.requestId);
        const qo = quickOrders.find((o) => o.id === project.requestId);
        return (
          <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
            {request?.title || qo?.title || project.title}
          </Link>
        );
      },
    },
    {
      key: 'serviceName',
      label: 'اسم الخدمة',
      render: (project: Project) => {
        const request = requests.find((r) => r.id === project.requestId);
        const qo = quickOrders.find((o) => o.id === project.requestId);
        return request?.serviceName || qo?.serviceTitle || '-';
      },
    },
    {
      key: 'client',
      label: 'العميل',
      render: (project: Project) =>
        project.clientId ? (
          <Link to={`/users/clients/${project.clientId}`} className="text-blue-600 hover:underline">
            {project.clientName || project.clientId}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (project: Project) =>
        project.contractorId ? (
          <Link
            to={`/users/contractors/${project.contractorId}`}
            className="text-blue-600 hover:underline"
          >
            {project.contractorName || project.contractorId}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'totalPrice',
      label: 'السعر الإجمالي',
      render: (project: Project) => {
        const contract = contracts.find((c) => c.id === project.contractId);
        return contract ? formatCurrency(contract.totalPrice) : <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'location',
      label: 'الموقع',
      render: (project: Project) => {
        const request = requests.find((r) => r.id === project.requestId);
        const qo = quickOrders.find((o) => o.id === project.requestId);
        if (request) return `${request.location.city}، ${request.location.district}`;
        if (qo) return `${qo.location.city}، ${qo.location.district}`;
        return '-';
      },
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (project: Project) => formatDate(project.createdAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (project: Project) => (
        <Link to={`/projects/${project.id}`}>
          <Button variant="secondary">عرض التفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">المشاريع</h1>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Pinned Note */}
      <div className="bg-[#FDB022]/10 border-r-4 border-[#FDB022] p-4 rounded-md flex items-start gap-3">
        <Info className="w-5 h-5 text-[#FDB022] mt-0.5 flex-shrink-0" />
        <div className="text-sm text-[#111111]">
          <p className="font-medium mb-1">ملاحظة مهمة:</p>
          <p>المشاريع وهي فقط الطلبات العادية (المناقصات) في حالة = المقبولة</p>
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="البحث برقم المشروع ، برقم الطلب ، بعنوان الطلب"
      />

      <div className="bg-white rounded-lg  border border-gray-200">
        {filteredProjects.length === 0 && !loading ? (
          <EmptyState title="لا توجد مشاريع مطابقة للبحث" />
        ) : (
          <Table columns={columns} data={filteredProjects} loading={loading} />
        )}
      </div>

      {filteredProjects.length > 0 && (
        <div className="text-sm text-gray-600">
          عرض {filteredProjects.length} من {projects.length} مشروع
        </div>
      )}
    </div>
  );
};
