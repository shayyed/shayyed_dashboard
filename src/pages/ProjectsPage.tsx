import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table';
import { SearchBar } from '../components/SearchBar';
import { ExportButton } from '../components/ExportButton';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Info } from 'lucide-react';
import { adminApi } from '../services/api';
import type { Project, ServiceRequest } from '../types';
import { RequestStatus } from '../types';
import { mockUsers, mockContracts, mockProjects, mockRequests } from '../mock/data';
import { formatDate, formatCurrency } from '../utils/formatters';

export const ProjectsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await adminApi.listProjects();
      // Projects are only for accepted regular requests
      setProjects(allProjects);
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
      filtered = filtered.filter(p => {
        const request = mockRequests.find(r => r.id === p.requestId);
        const client = mockUsers.find(u => u.id === p.clientId);
        const contractor = mockUsers.find(u => u.id === p.contractorId);
        return (
          p.id.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          (request?.title || '').toLowerCase().includes(query) ||
          (request?.serviceName || '').toLowerCase().includes(query) ||
          (request?.id || '').toLowerCase().includes(query) ||
          client?.name.toLowerCase().includes(query) ||
          contractor?.name.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [projects, searchQuery]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export projects:', filteredProjects);
  };

  const columns = [
    {
      key: 'id',
      label: 'رقم المشروع',
      render: (project: Project) => (
        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline font-medium">
          {project.id}
        </Link>
      ),
    },
    {
      key: 'requestId',
      label: 'الطلب المرتبط',
      render: (project: Project) => (
        <Link to={`/requests/regular/${project.requestId}`} className="text-blue-600 hover:underline">
          {project.requestId}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'العنوان',
      render: (project: Project) => {
        const request = mockRequests.find(r => r.id === project.requestId);
        return (
          <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
            {request?.title || project.title}
          </Link>
        );
      },
    },
    {
      key: 'serviceName',
      label: 'اسم الخدمة',
      render: (project: Project) => {
        const request = mockRequests.find(r => r.id === project.requestId);
        return request?.serviceName || '-';
      },
    },
    {
      key: 'client',
      label: 'العميل',
      render: (project: Project) => {
        const client = mockUsers.find(u => u.id === project.clientId);
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
      render: (project: Project) => {
        const contractor = mockUsers.find(u => u.id === project.contractorId);
        return contractor ? (
          <Link to={`/users/contractors/${contractor.id}`} className="text-blue-600 hover:underline">
            {contractor.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'totalPrice',
      label: 'السعر الإجمالي',
      render: (project: Project) => {
        const contract = mockContracts.find(c => c.id === project.contractId);
        return contract ? formatCurrency(contract.totalPrice) : <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'location',
      label: 'الموقع',
      render: (project: Project) => {
        const request = mockRequests.find(r => r.id === project.requestId);
        return request ? `${request.location.city}، ${request.location.district}` : '-';
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
