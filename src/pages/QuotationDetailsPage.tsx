import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { ArrowRight, FileText, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../services/api';
import type { Quotation } from '../types';
import { formatSar, formatDate, getRequestDisplayNumber, getQuotationDisplayNumber } from '../utils/formatters';

export const QuotationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const found = await adminApi.getQuotation(id);
      setQuotation(found);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#666666]">جاري التحميل...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#666666]">العرض غير موجود</div>
      </div>
    );
  }

  const isRegularRequest = quotation.requestKind !== 'quick';
  const requestTitle = quotation.requestTitle || '-';
  const requestPath = isRegularRequest
    ? `/requests/regular/${quotation.requestId}`
    : `/requests/quick/${quotation.requestId}`;

  const client = quotation.client;
  const contractor = quotation.contractor;

  // حساب مجموع الدفعات
  const totalInstallments = quotation.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;
  const installmentsValid = totalInstallments === quotation.price;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/quotations')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل العرض</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الأساسية */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">معلومات العرض</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#666666] mb-1">رقم العرض</p>
                  <p className="text-[#111111] font-medium">{getQuotationDisplayNumber(quotation)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">الحالة</p>
                  <StatusBadge status={quotation.status} />
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">السعر</p>
                  <p className="text-[#111111] font-semibold text-lg">{formatSar(quotation.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">المدة</p>
                  <p className="text-[#111111]">
                    {isRegularRequest 
                      ? `${typeof quotation.duration === 'number' ? quotation.duration : quotation.duration} يوم`
                      : (typeof quotation.duration === 'string' ? quotation.duration : `${quotation.duration} ساعة`)
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">تاريخ الإنشاء</p>
                  <p className="text-[#111111]">{formatDate(quotation.createdAt)}</p>
                </div>
                {/* المواد مشمولة - يحددها العميل في الطلب، ليس في العرض - hidden from offer */}
                {/* <div>
                  <p className="text-sm text-[#666666] mb-1">المواد مشمولة</p>
                  <span className={`text-xs px-2 py-1 rounded inline-block ${
                    quotation.materialsIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {quotation.materialsIncluded ? 'نعم' : 'لا'}
                  </span>
                </div> */}
              </div>


              {quotation.notes && (
                <div>
                  <p className="text-sm text-[#666666] mb-1">الملاحظات</p>
                  <p className="text-[#111111]">{quotation.notes}</p>
                </div>
              )}

              {quotation.additionalTerms && (
                <div>
                  <p className="text-sm text-[#666666] mb-1">الشروط الإضافية</p>
                  <p className="text-[#111111]">{quotation.additionalTerms}</p>
                </div>
              )}

              {(quotation.attachments?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm text-[#666666] mb-2">المرفقات</p>
                  <div className="space-y-2">
                    {(quotation.attachments || []).map((attachment, idx) => {
                      const fileName = attachment.split('/').pop() || attachment;
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                      const isPdf = /\.pdf$/i.test(fileName);
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 border border-[#E5E5E5] rounded">
                          <div className="flex items-center gap-2">
                            {isPdf ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : isImage ? (
                              <ImageIcon className="w-4 h-4 text-[#666666]" />
                            ) : null}
                            <span className="text-sm text-[#111111]">{fileName}</span>
                          </div>
                          <a href={attachment} target="_blank" rel="noopener noreferrer" download>
                            <Button variant="secondary">تحميل</Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* الدفعات (للطلبات العادية فقط) */}
          {isRegularRequest && quotation.installments && quotation.installments.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#111111]">الدفعات</h2>
                {!installmentsValid && (
                  <span className="text-xs text-red-600">
                    تحذير: مجموع الدفعات ({formatSar(totalInstallments)}) لا يساوي السعر ({formatSar(quotation.price)})
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {quotation.installments.map((installment) => (
                  <div key={installment.id} className="p-3 bg-[#F7F7F7] rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#111111]">{installment.title}</h3>
                      <span className="text-lg font-semibold text-[#111111]">{formatSar(installment.amount)}</span>
                    </div>
                    <p className="text-sm text-[#666666] mb-1">{installment.description}</p>
                    {installment.dueDate && (
                      <p className="text-xs text-[#666666]">تاريخ الاستحقاق: {formatDate(installment.dueDate)}</p>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-[#E5E5E5]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#111111]">المجموع</span>
                    <span className="font-semibold text-[#111111]">{formatSar(totalInstallments)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* مراحل التنفيذ (للطلبات العادية فقط) */}
          {isRegularRequest && quotation.executionPhases && quotation.executionPhases.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-[#111111] mb-4">مراحل التنفيذ</h2>
              <div className="space-y-4">
                {quotation.executionPhases.map((phase) => {
                  const linkedInstallment = quotation.installments?.find(inst => inst.id === phase.linkedInstallmentId);
                  return (
                    <div key={phase.id} className="p-3 bg-[#F7F7F7] rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-[#111111]">{phase.title}</h3>
                        <span className="text-sm text-[#666666]">{phase.duration} يوم</span>
                      </div>
                      <p className="text-sm text-[#666666] mb-2">{phase.description}</p>
                      {linkedInstallment && (
                        <p className="text-xs text-[#666666]">
                          الدفعة المرتبطة: {linkedInstallment.title} ({formatSar(linkedInstallment.amount)})
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* المعلومات الجانبية */}
        <div className="space-y-6">
          {/* معلومات المقاول */}
          <Card>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">المقاول</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#666666] mb-1">الشركة / الاسم</p>
                <Link to={`/users/contractors/${quotation.contractorId}`} className="text-blue-600 hover:underline font-medium">
                  {quotation.contractor?.name || quotation.contractorName}
                </Link>
              </div>
              <div>
                <p className="text-sm text-[#666666] mb-1">التقييم</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{quotation.contractorRating.toFixed(1)}</span>
                </div>
              </div>
              {contractor && (
                <>
                  <div>
                    <p className="text-sm text-[#666666] mb-1">رقم الجوال</p>
                    <p className="text-[#111111]">{contractor.phone}</p>
                  </div>
                  {contractor.email && (
                    <div>
                      <p className="text-sm text-[#666666] mb-1">البريد الإلكتروني</p>
                      <p className="text-[#111111]">{contractor.email}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* معلومات الطلب */}
          <Card>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">الطلب المرتبط</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#666666] mb-1">العنوان</p>
                <Link to={requestPath} className="text-blue-600 hover:underline font-medium">
                  {requestTitle}
                </Link>
              </div>
              <div>
                <p className="text-sm text-[#666666] mb-1">رقم الطلب</p>
                <Link to={requestPath} className="text-blue-600 hover:underline">
                  {getRequestDisplayNumber(quotation.requestId, !isRegularRequest)}
                </Link>
              </div>
              <div>
                <p className="text-sm text-[#666666] mb-1">نوع الطلب</p>
                <span className={`text-xs px-2 py-1 rounded inline-block ${
                  isRegularRequest ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {isRegularRequest ? 'عادي' : 'خدمة سريعة'}
                </span>
              </div>
            </div>
          </Card>

          {(client || quotation.clientId) && (
            <Card>
              <h2 className="text-lg font-semibold text-[#111111] mb-4">العميل</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#666666] mb-1">الاسم</p>
                  <Link
                    to={`/users/clients/${client?.id || quotation.clientId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {client?.name || quotation.clientName || quotation.clientId}
                  </Link>
                </div>
                {client?.phone ? (
                  <div>
                    <p className="text-sm text-[#666666] mb-1">رقم الجوال</p>
                    <p className="text-[#111111]">{client.phone}</p>
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {(quotation.relatedContractId || quotation.relatedProjectId) && (
            <Card>
              <h2 className="text-lg font-semibold text-[#111111] mb-4">العقد والمشروع</h2>
              <div className="space-y-3">
                {quotation.relatedContractId && (
                  <div>
                    <p className="text-sm text-[#666666] mb-1">العقد</p>
                    <Link
                      to={`/contracts/${quotation.relatedContractId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {quotation.relatedContractId}
                    </Link>
                  </div>
                )}
                {quotation.relatedProjectId && (
                  <div>
                    <p className="text-sm text-[#666666] mb-1">المشروع</p>
                    <Link
                      to={`/projects/${quotation.relatedProjectId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {quotation.relatedProjectId}
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          )}


          {/* المحادثة */}
          <Card>
            <h2 className="text-lg font-semibold text-[#111111] mb-4">المحادثة</h2>
            <div className="space-y-3">
              <p className="text-sm text-[#666666]">يمكنك عرض المحادثة بين العميل والمقاول</p>
              <Button variant="ghost" className="w-full">
                عرض المحادثة
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};
