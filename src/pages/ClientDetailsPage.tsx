import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Table } from '../components/Table';
import { ArrowRight } from 'lucide-react';
import { adminApi } from '../services/api';
import type { ClientProfile, ServiceRequest } from '../types';
import { mockRequests, mockQuickServiceOrders } from '../mock/data';
import { formatDate, formatSar } from '../utils/formatters';

export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quickOrders, setQuickOrders] = useState<any[]>([]);
  const [activeRequestType, setActiveRequestType] = useState<'regular' | 'quick'>('regular');

  useEffect(() => {
    if (id) {
      loadClient();
      loadRelatedData();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getClient(id!);
      if (data) {
        setClient(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    if (!id) return;
    try {
      const clientRequests = mockRequests.filter(r => r.clientId === id);
      const clientQuickOrders = mockQuickServiceOrders.filter(q => q.clientId === id);

      setRequests(clientRequests.slice(0, 10));
      setQuickOrders(clientQuickOrders.slice(0, 10));
    } catch (error) {
      console.error('Load related data error:', error);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111111] mx-auto mb-4"></div>
          <p className="text-[#666666]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <EmptyState
        title="العميل غير موجود"
        description="العميل المطلوب غير موجود أو تم حذفه"
        action={
          <Button variant="secondary" onClick={() => navigate('/users')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى قائمة المستخدمين
          </Button>
        }
      />
    );
  }

  const requestColumns = [
    {
      key: 'id',
      label: 'رقم الطلب',
      render: (request: ServiceRequest) => (
        <span className="text-[#111111] font-medium">{request.id}</span>
      ),
    },
    {
      key: 'title',
      label: 'العنوان',
      render: (request: ServiceRequest) => (
        <span className="text-[#111111] font-medium">{request.title}</span>
      ),
    },
    {
      key: 'serviceName',
      label: 'اسم الخدمة',
      render: (request: ServiceRequest) => (
        <span className="text-[#666666]">{request.serviceName}</span>
      ),
    },
    {
      key: 'location',
      label: 'الموقع',
      render: (request: ServiceRequest) => (
        <span className="text-[#666666]">{request.location.city} - {request.location.district}</span>
      ),
    },
    {
      key: 'offersCount',
      label: 'عدد العروض',
      render: (request: ServiceRequest) => (
        <span className="text-[#111111] font-medium">{request.offersCount || 0}</span>
      ),
    },
    {
      key: 'urgency',
      label: 'الاستعجال',
      render: (request: ServiceRequest) => (
        <StatusBadge status={request.urgency === 'urgent' ? 'urgent' : 'normal'} />
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (request: ServiceRequest) => <StatusBadge status={request.status} />,
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (request: ServiceRequest) => <span className="text-[#666666]">{formatDate(request.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (request: ServiceRequest) => (
        <Link to={`/requests/regular/${request.id}`}>
          <Button variant="secondary">التفاصيل</Button>
        </Link>
      ),
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate('/users')} className="mb-2">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى قائمة المستخدمين
          </Button>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل العميل</h1>
        </div>
      </div>

      {/* User Information - Client Flow Only */}
      <Card title="معلومات العميل">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#666666] mb-1">الاسم</p>
            <p className="text-[#111111] font-medium">{client.name}</p>
          </div>
          <div>
            <p className="text-sm text-[#666666] mb-1">رقم الهوية الوطنية</p>
            <p className="text-[#111111] font-medium">{client.id}</p>
          </div>
          <div>
            <p className="text-sm text-[#666666] mb-1">رقم الجوال</p>
            <p className="text-[#111111] font-medium">{client.phone}</p>
          </div>
          <div>
            <p className="text-sm text-[#666666] mb-1">العنوان</p>
            <p className="text-[#111111] font-medium">
              {client.addresses && client.addresses.length > 0
                ? `${client.addresses[0].city} - ${client.addresses[0].district}`
                : 'غير محدد'}
            </p>
          </div>
        </div>
      </Card>


      {/* Section Title: الطلبات */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[#111111] mb-4">الطلبات</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveRequestType('regular')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeRequestType === 'regular'
                ? 'bg-[#111111] text-white hover:bg-[#222222]'
                : 'bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F7F7F7]'
            }`}
          >
            المناقصات ({requests.length})
          </button>
          <button
            onClick={() => setActiveRequestType('quick')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeRequestType === 'quick'
                ? 'bg-[#111111] text-white hover:bg-[#222222]'
                : 'bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F7F7F7]'
            }`}
          >
            الخدمات السريعة ({quickOrders.length})
          </button>
        </div>
      </div>

      {/* Recent Regular Requests */}
      {activeRequestType === 'regular' && (
        <Card
          id="regular-requests"
          title="المناقصات (آخر 10)"
          action={
            <Link to={`/requests?client=${client.id}`}>
              <Button variant="secondary">عرض الكل</Button>
            </Link>
          }
        >
          {requests.length > 0 ? (
            <Table columns={requestColumns} data={requests} />
          ) : (
            <EmptyState title="لا توجد مناقصات" />
          )}
        </Card>
      )}

      {/* Recent Quick Service Orders */}
      {activeRequestType === 'quick' && (
        <Card
          id="quick-requests"
          title="الخدمات السريعة (آخر 10)"
          action={
            <Link to={`/requests?client=${client.id}&type=quick`}>
              <Button variant="secondary">عرض الكل</Button>
            </Link>
          }
        >
          {quickOrders.length > 0 ? (
            <Table 
              columns={[
                {
                  key: 'id',
                  label: 'رقم الطلب',
                  render: (order: any) => (
                    <span className="text-[#111111] font-medium">{order.id}</span>
                  ),
                },
                {
                  key: 'title',
                  label: 'العنوان',
                  render: (order: any) => (
                    <span className="text-[#111111] font-medium">{order.title || order.serviceTitle}</span>
                  ),
                },
                {
                  key: 'serviceTitle',
                  label: 'اسم الخدمة',
                  render: (order: any) => (
                    <span className="text-[#666666]">{order.serviceTitle}</span>
                  ),
                },
                {
                  key: 'duration',
                  label: 'المدة',
                  render: (order: any) => (
                    <span className="text-[#666666]">{order.duration}</span>
                  ),
                },
                {
                  key: 'location',
                  label: 'الموقع',
                  render: (order: any) => (
                    <span className="text-[#666666]">{order.location?.city} - {order.location?.district}</span>
                  ),
                },
                {
                  key: 'contractorName',
                  label: 'المقاول',
                  render: (order: any) => (
                    order.contractorName ? (
                      <span className="text-[#111111] font-medium">{order.contractorName}</span>
                    ) : (
                      <span className="text-[#666666]">-</span>
                    )
                  ),
                },
                {
                  key: 'urgency',
                  label: 'الاستعجال',
                  render: (order: any) => (
                    order.urgency ? (
                      <StatusBadge status={order.urgency === 'urgent' ? 'urgent' : 'normal'} />
                    ) : (
                      <span className="text-[#666666]">-</span>
                    )
                  ),
                },
                {
                  key: 'status',
                  label: 'الحالة',
                  render: (order: any) => <StatusBadge status={order.status} />,
                },
                {
                  key: 'createdAt',
                  label: 'تاريخ الإنشاء',
                  render: (order: any) => <span className="text-[#666666]">{formatDate(order.createdAt)}</span>,
                },
                {
                  key: 'actions',
                  label: 'الإجراءات',
                  render: (order: any) => (
                    <Link to={`/requests/quick/${order.id}`}>
                      <Button variant="secondary">التفاصيل</Button>
                    </Link>
                  ),
                },
              ]} 
              data={quickOrders} 
            />
          ) : (
            <EmptyState title="لا توجد طلبات خدمات سريعة" />
          )}
        </Card>
      )}

    </div>
  );
};
