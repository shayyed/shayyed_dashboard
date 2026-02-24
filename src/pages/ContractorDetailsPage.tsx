import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { adminApi } from '../services/api';
import type { ContractorProfile, Rating, PortfolioItem, QuickServiceOrder, ClientProfile, ServiceRequest } from '../types';
import { mockQuickServiceOrders, mockRatings, mockPortfolioItems, mockClients, mockRequests, mockQuotations } from '../mock/data';
import { QuickServiceOrderStatus } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

export const ContractorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickServiceOrder[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [activeRequestType, setActiveRequestType] = useState<'regular' | 'quick'>('regular');


  useEffect(() => {
    if (id) {
      loadContractor();
      loadRelatedData();
    }
  }, [id]);

  const loadContractor = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getContractor(id!);
      if (data) {
        setContractor(data);
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
      const ratingsData = await adminApi.getContractorRatings(id);
      setRatings(ratingsData);

      const portfolioData = await adminApi.getContractorPortfolio(id);
      setPortfolioItems(portfolioData);

      const contractorQuickOrders = mockQuickServiceOrders.filter(q => q.contractorId === id);
      
      // Get requests that contractor has quoted on
      const contractorQuotations = mockQuotations.filter(q => q.contractorId === id);
      const requestIds = contractorQuotations.map(q => q.requestId);
      const contractorRequests = mockRequests.filter(r => requestIds.includes(r.id));

      setQuickOrders(contractorQuickOrders);
      setRequests(contractorRequests);
      setClients(mockClients);
    } catch (error) {
      console.error('Load related data error:', error);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="المقاول غير موجود" />
      </div>
    );
  }

  const ratingsColumns = [
    {
      key: 'rating',
      label: 'النجوم',
      render: (item: any) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < item.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm font-medium text-[#111111] mr-1">
            {item.rating}
          </span>
        </div>
      ),
    },
    {
      key: 'clientId',
      label: 'المقيّم',
      render: (item: any) => (
        <Link 
          to={`/users/clients/${item.clientId}`} 
          className="text-blue-600 hover:underline"
        >
          {item.clientName}
        </Link>
      ),
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (item: any) => (
        <span className="text-[#666666]">{formatDate(item.createdAt)}</span>
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
            العودة إلى المستخدمين
          </Button>
          <h1 className="text-2xl font-bold text-[#111111]">تفاصيل المقاول</h1>
        </div>
      </div>

      {/* User Info Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-4">معلومات المستخدم الكاملة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">معرف المستخدم (رقم الهوية)</p>
            <p className="text-[#111111]">{contractor.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">الاسم</p>
            <p className="text-[#111111]">{contractor.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">رقم الجوال</p>
            <p className="text-[#111111]">{contractor.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">الدور</p>
            <p className="text-[#111111]">مقاول</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">تاريخ التسجيل</p>
            <p className="text-[#111111]">{formatDate(contractor.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">حالة الحساب</p>
            <StatusBadge status={contractor.isActive ? 'نشط' : 'معطل'} />
          </div>
        </div>
      </Card>

      {/* Company Info Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-4">معلومات الشركة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">اسم الشركة</p>
            <p className="text-[#111111]">{contractor.companyName || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">وصف الشركة</p>
            <p className="text-[#111111]">{contractor.companyDescription || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">رقم السجل التجاري</p>
            <p className="text-[#111111]">{contractor.commercialRegistration || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">الرقم الضريبي</p>
            <p className="text-[#111111]">{contractor.taxId || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">عنوان الشركة</p>
            <p className="text-[#111111]">{contractor.companyAddress || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">هاتف الشركة</p>
            <p className="text-[#111111]">{contractor.companyPhone || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">البريد الإلكتروني للشركة</p>
            <p className="text-[#111111]">{contractor.companyEmail || 'غير محدد'}</p>
          </div>
        </div>
      </Card>

      {/* Rating Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-6">التقييم</h2>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600 mb-2">التقييم المتوسط</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(contractor.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : i < contractor.rating
                        ? 'fill-yellow-200 text-yellow-200'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-[#111111]">
                {contractor.rating.toFixed(1)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">عدد التقييمات</p>
            <p className="text-2xl font-bold text-[#111111]">{contractor.totalRatings || 0}</p>
          </div>
        </div>

        {/* Detailed Ratings */}
        {ratings.length > 0 ? (
          <div>
            <h3 className="text-md font-semibold text-[#111111] mb-4">تفاصيل التقييمات</h3>
            <Table
              columns={ratingsColumns}
              data={ratings.map(rating => {
                const client = clients.find(c => c.id === rating.clientId);
                const clientName = client ? client.name : rating.clientId;
                
                return {
                  id: rating.id,
                  rating: rating.rating,
                  clientId: rating.clientId,
                  clientName: clientName,
                  createdAt: rating.createdAt,
                };
              })}
            />
          </div>
        ) : (
          <EmptyState title="لا توجد تقييمات" />
        )}
      </Card>

      {/* Services Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-4">الخدمات المقدمة</h2>
        {contractor.services && contractor.services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contractor.services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
              >
                <span>{service}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد خدمات" />
        )}
      </Card>

      {/* Coverage Areas Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-4">مناطق التغطية</h2>
        {contractor.coverageAreasWithDistricts && contractor.coverageAreasWithDistricts.length > 0 ? (
          <div className="space-y-3">
            {contractor.coverageAreasWithDistricts.map((coverage, idx) => (
              <div key={idx} className="border rounded p-3">
                <p className="font-medium text-[#111111] mb-2">{coverage.city}</p>
                <div className="flex flex-wrap gap-2">
                  {coverage.districts.map((district, dIdx) => (
                    <span key={dIdx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                      {district}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد مناطق تغطية" />
        )}
      </Card>

      {/* Portfolio Section */}
      <Card>
        <h2 className="text-lg font-semibold text-[#111111] mb-4">معرض الأعمال</h2>
        {portfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioItems.map(item => (
              <div key={item.id} className="border rounded p-4">
                {item.imageUri ? (
                  <div className="w-full h-48 rounded mb-2 overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUri}
                      alt={item.title}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(item.imageUri, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-sm">لا توجد صورة</span></div>';
                        }
                      }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">لا توجد صورة</span>
                  </div>
                )}
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{item.city}</span>
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد عناصر في المعرض" />
        )}
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

      {/* Regular Requests (مناقصات) Section */}
      {activeRequestType === 'regular' && (
        <Card
          title="المناقصات (آخر 10)"
          action={
            <Link to={`/requests?contractor=${id}`}>
              <Button variant="secondary">عرض الكل</Button>
            </Link>
          }
        >
          {requests.length === 0 ? (
            <EmptyState title="لا توجد مناقصات" />
          ) : (
            <Table 
              columns={[
                {
                  key: 'id',
                  label: 'رقم الطلب',
                  render: (request: ServiceRequest) => (
                    <Link to={`/requests/regular/${request.id}`} className="text-blue-600 hover:underline">
                      {request.id}
                    </Link>
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
                  key: 'status',
                  label: 'الحالة',
                  render: (request: ServiceRequest) => <StatusBadge status={request.status} />,
                },
                {
                  key: 'createdAt',
                  label: 'تاريخ الإنشاء',
                  render: (request: ServiceRequest) => (
                    <span className="text-[#666666]">{formatDate(request.createdAt)}</span>
                  ),
                },
              ]} 
              data={requests.slice(0, 10)} 
            />
          )}
        </Card>
      )}

      {/* Quick Service Orders Section */}
      {activeRequestType === 'quick' && (
        <Card
          title="الخدمات السريعة (آخر 10)"
          action={
            <Link to={`/requests?contractor=${id}&type=quick`}>
              <Button variant="secondary">عرض الكل</Button>
            </Link>
          }
        >
          {quickOrders.length === 0 ? (
            <EmptyState title="لا توجد طلبات خدمات سريعة" />
          ) : (
            <Table 
              columns={[
                {
                  key: 'id',
                  label: 'رقم الطلب',
                  render: (order: QuickServiceOrder) => (
                    <Link to={`/requests/quick/${order.id}`} className="text-blue-600 hover:underline">
                      {order.id}
                    </Link>
                  ),
                },
                {
                  key: 'title',
                  label: 'العنوان',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#111111] font-medium">{order.title || order.serviceTitle}</span>
                  ),
                },
                {
                  key: 'serviceTitle',
                  label: 'اسم الخدمة',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#666666]">{order.serviceTitle}</span>
                  ),
                },
                {
                  key: 'price',
                  label: 'السعر',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#111111] font-medium">{formatCurrency(order.price)}</span>
                  ),
                },
                {
                  key: 'duration',
                  label: 'المدة',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#666666]">{order.duration}</span>
                  ),
                },
                {
                  key: 'location',
                  label: 'الموقع',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#666666]">{order.location?.city} - {order.location?.district}</span>
                  ),
                },
                {
                  key: 'status',
                  label: 'الحالة',
                  render: (order: QuickServiceOrder) => <StatusBadge status={order.status} />,
                },
                {
                  key: 'createdAt',
                  label: 'تاريخ الإنشاء',
                  render: (order: QuickServiceOrder) => (
                    <span className="text-[#666666]">{formatDate(order.createdAt)}</span>
                  ),
                },
              ]} 
              data={quickOrders.slice(0, 10)} 
            />
          )}
        </Card>
      )}

    </div>
  );
};
