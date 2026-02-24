import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Tabs } from '../components/Tabs';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { ArrowRight, Check, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../services/api';
import type { Project, ProjectReport, Invoice, Complaint, ContractorProfile } from '../types';
import { ProjectStatus, ComplaintStatus, ComplaintType, InvoiceStatus } from '../types';
import { mockUsers, mockContractors, mockContracts, mockRequests, mockQuotations, mockInvoices, mockComplaints, mockProjectReports } from '../mock/data';
import { formatDate, formatSar, formatDateTime } from '../utils/formatters';

const TABS = [
  { label: 'نظرة عامة', value: 'overview' },
  { label: 'الجدول الزمني', value: 'timeline' },
  { label: 'التقارير', value: 'reports' },
  { label: 'الفواتير', value: 'invoices' },
  { label: 'الشكاوى', value: 'complaints' },
];

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (id) {
      loadProject();
      loadRelatedData();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProject(id!);
      if (data) {
        setProject(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = () => {
    if (!id) return;
    const projectReports = mockProjectReports.filter(r => r.projectId === id);
    const projectInvoices = mockInvoices.filter(i => i.projectId === id);
    const projectComplaints = mockComplaints.filter(c => c.projectId === id);
    
    setReports(projectReports);
    setInvoices(projectInvoices);
    setComplaints(projectComplaints);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="المشروع غير موجود" />
      </div>
    );
  }

  const contract = mockContracts.find(c => c.id === project.contractId);
  const request = mockRequests.find(r => r.id === project.requestId);
  const quotation = request ? mockQuotations.find(q => q.requestId === request.id && q.status === 'ACCEPTED') : null;
  const client = mockUsers.find(u => u.id === project.clientId);
  const contractor = mockContractors.find(c => c.id === project.contractorId);

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Request Details */}
            {request && (
              <Card>
                <h3 className="text-lg font-semibold text-[#111111] mb-4">تفاصيل الطلب</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[100px]">رقم الطلب:</span>
                    <span className="text-[#111111]">{request.id}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[100px]">نوع الخدمة:</span>
                    <span className="text-[#111111]">{request.serviceName}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[100px]">العنوان:</span>
                    <span className="text-[#111111]">{request.location.city}، {request.location.district}</span>
                  </div>
                  {request.title && (
                    <div className="flex items-start gap-4">
                      <span className="text-[#666666] min-w-[100px]">عنوان الطلب:</span>
                      <span className="text-[#111111]">{request.title}</span>
                    </div>
                  )}
                  {request.description && (
                    <div className="flex items-start gap-4">
                      <span className="text-[#666666] min-w-[100px]">الوصف:</span>
                      <span className="text-[#111111]">{request.description}</span>
                    </div>
                  )}
                  {request.materialsIncluded !== undefined && (
                    <div className="flex items-start gap-4">
                      <span className="text-[#666666] min-w-[100px]">المواد مشمولة:</span>
                      <span className={`text-xs px-2 py-1 rounded inline-block ${
                        request.materialsIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {request.materialsIncluded ? 'مشمولة' : 'غير مشمولة'}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Contractor Info */}
            {contractor && (
              <Card>
                <h3 className="text-lg font-semibold text-[#111111] mb-4">معلومات المقاول</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[#111111] font-medium text-lg mb-2">{contractor.companyName || contractor.name}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        const filled = starValue <= Math.round(contractor.rating || 0);
                        return (
                          <span
                            key={i}
                            className={`text-lg ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        );
                      })}
                      <span className="text-sm text-[#666666] mr-1">
                        {(contractor.rating || 0).toFixed(1)}
                      </span>
                      {contractor.totalRatings && (
                        <span className="text-xs text-[#666666]">
                          ({contractor.totalRatings} تقييم)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#666666] block mb-1">مناطق التغطية:</span>
                    {contractor.coverageAreasWithDistricts && contractor.coverageAreasWithDistricts.length > 0 ? (
                      <div className="text-[#111111]">
                        <div className="font-medium">{contractor.coverageAreasWithDistricts[0].city}</div>
                        {contractor.coverageAreasWithDistricts[0].districts && contractor.coverageAreasWithDistricts[0].districts.length > 0 && (
                          <div className="text-sm text-[#666666] mr-4 mt-1">
                            {contractor.coverageAreasWithDistricts[0].districts.join('، ')}
                          </div>
                        )}
                      </div>
                    ) : contractor.coverageAreas && contractor.coverageAreas.length > 0 ? (
                      <div className="text-[#111111] font-medium">
                        {contractor.coverageAreas[0]}
                      </div>
                    ) : (
                      <span className="text-[#111111]">-</span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Accepted Offer */}
            {quotation && (
              <Card>
                <h3 className="text-lg font-semibold text-[#111111] mb-4">العرض المقبول</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[80px]">السعر:</span>
                    <span className="text-[#111111] font-bold">{formatSar(quotation.price)}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[80px]">المدة:</span>
                    <span className="text-[#111111]">{quotation.duration} يوم</span>
                  </div>
                  {/* المواد مشمولة - يحددها العميل في الطلب، ليس في العرض - hidden from offer */}
                  {/* <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[80px]">المواد:</span>
                    <span className="text-[#111111]">
                      {quotation.materialsIncluded ? 'مشمولة' : 'غير مشمولة'}
                    </span>
                  </div> */}
                  {quotation.notes && (
                    <div className="flex items-start gap-4">
                      <span className="text-[#666666] min-w-[80px]">ملاحظات:</span>
                      <span className="text-[#111111]">{quotation.notes}</span>
                    </div>
                  )}
                  {quotation.additionalTerms && (
                    <div className="flex items-start gap-4">
                      <span className="text-[#666666] min-w-[80px]">شروط اضافية:</span>
                      <span className="text-[#111111]">{quotation.additionalTerms}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Contract Summary */}
            {contract && (
              <Card>
                <h3 className="text-lg font-semibold text-[#111111] mb-4">ملخص العقد</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[140px]">رقم العقد:</span>
                    <span className="text-[#111111]">{contract.id}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[#666666] min-w-[140px]">القيمة الإجمالية:</span>
                    <span className="text-[#111111] font-bold">{formatSar(contract.totalPrice)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Summary */}
            {contract && (
              <Card>
                <h3 className="text-lg font-semibold text-[#111111] mb-4">ملخص الدفعات</h3>
                <div className="space-y-4">
                  {contract.milestones.map((milestone, index) => {
                    const isLast = index === contract.milestones.length - 1;
                    const statusText = milestone.status === 'Paid' 
                      ? 'مدفوعة' 
                      : milestone.status === 'Due' 
                      ? 'مستحقة' 
                      : milestone.status === 'NotDue'
                      ? 'بالانتظار'
                      : 'بالانتظار';
                    const statusColor = milestone.status === 'Paid' 
                      ? '#05C4AF' 
                      : milestone.status === 'Due' 
                      ? '#F59E0B' 
                      : '#9CA3AF';
                    
                    // Find invoice for this milestone (match by amount and project)
                    // Try exact match first, then match within 100 SAR tolerance, then any invoice for this project
                    let relatedInvoice = invoices.find(inv => 
                      inv.projectId === project.id && 
                      (Math.abs(inv.totalAmount - milestone.amount) < 1 || 
                       Math.abs(inv.amount - milestone.amount) < 1)
                    );
                    
                    // If no exact match, try with tolerance
                    if (!relatedInvoice) {
                      relatedInvoice = invoices.find(inv => 
                        inv.projectId === project.id && 
                        Math.abs(inv.totalAmount - milestone.amount) < 100
                      );
                    }
                    
                    // If still no match, get the first paid invoice for this project
                    if (!relatedInvoice && milestone.status === 'Paid') {
                      relatedInvoice = invoices.find(inv => 
                        inv.projectId === project.id && inv.status === InvoiceStatus.PAID
                      );
                    }
                    
                    return (
                      <div 
                        key={milestone.id} 
                        className={`${!isLast ? 'border-b border-[#E5E5E5] pb-4' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#111111] font-medium text-lg">
                            الدفعة {index + 1}: {milestone.name}
                          </span>
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: hexToRgba(statusColor, 0.1),
                              color: statusColor
                            }}
                          >
                            {statusText}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-[#666666]">المبلغ:</span>
                            <span className="text-[#111111] font-bold">{formatSar(milestone.amount)}</span>
                          </div>
                          {milestone.dueDate && (
                            <div className="flex items-center gap-4">
                              <span className="text-[#666666]">تاريخ الاستحقاق:</span>
                              <span className="text-[#111111]">{formatDate(milestone.dueDate)}</span>
                            </div>
                          )}
                          {milestone.paidAt && (
                            <div className="flex items-center gap-4">
                              <span className="text-[#666666]">تاريخ الدفع:</span>
                              <span className="text-[#111111]">{formatDate(milestone.paidAt)}</span>
                            </div>
                          )}
                          {milestone.description && (
                            <div className="flex items-center gap-4">
                              <span className="text-[#666666]">الوصف:</span>
                              <span className="text-[#111111]">{milestone.description}</span>
                            </div>
                          )}
                        </div>
                        {milestone.status === 'Paid' && (
                          <div className="mt-3">
                            {relatedInvoice ? (
                              <Link to={`/invoices/${relatedInvoice.id}`}>
                                <Button variant="secondary">
                                  عرض فاتورة PDF
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="secondary" disabled>
                                عرض فاتورة PDF
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        );

      case 'timeline':
        const executionPhases = contract ? [
          {
            id: '1',
            title: 'المرحلة الأولى: الإعداد والتحضير',
            duration: Math.ceil(contract.duration * 0.15),
            description: [
              'الحصول على التصاريح اللازمة',
              'تجهيز الموقع وإعداد الأدوات',
              'فحص المواد والتأكد من جودتها',
              'وضع علامات وقياسات دقيقة',
            ],
            payment: 'الدفعة الأولى (عربون)',
            status: contract.milestones[0]?.status === 'Paid' ? 'completed' : 'pending',
          },
          {
            id: '2',
            title: 'المرحلة الثانية: التنفيذ الأساسي',
            duration: Math.ceil(contract.duration * 0.35),
            description: [
              'أعمال الحفر والردم والتسوية',
              'أعمال البناء والخرسانة',
              'أعمال السباكة والكهرباء الأساسية',
              'أعمال العزل والمواد الأساسية',
            ],
            payment: 'الدفعة الثانية (منتصف العمل)',
            status: contract.milestones[1]?.status === 'Paid' ? 'completed' : contract.milestones[1]?.status === 'Due' ? 'in_progress' : 'pending',
          },
          {
            id: '3',
            title: 'المرحلة الثالثة: التشطيبات النهائية',
            duration: Math.ceil(contract.duration * 0.35),
            description: [
              'أعمال الدهانات والطلاء',
              'تركيب البلاط والسيراميك',
              'أعمال النجارة والألمنيوم',
              'التركيبات النهائية والتشطيبات الدقيقة',
            ],
            payment: 'الدفعة الثانية (منتصف العمل)',
            status: contract.milestones[1]?.status === 'Paid' ? 'completed' : 'pending',
          },
          {
            id: '4',
            title: 'المرحلة الرابعة: التسليم والضمان',
            duration: Math.ceil(contract.duration * 0.15),
            description: [
              'الفحص النهائي والجودة',
              'أعمال التنظيف والتجهيز',
              'تسليم المفاتيح والوثائق',
              'تفعيل الضمان لمدة سنة واحدة',
            ],
            payment: 'الدفعة الثالثة (التسليم النهائي)',
            status: contract.milestones[2]?.status === 'Paid' ? 'completed' : 'pending',
          },
        ] : [];

        return (
          <div className="space-y-6">
            {executionPhases.map((phase, index) => {
              const statusColor = phase.status === 'completed' 
                ? '#05C4AF' 
                : phase.status === 'in_progress' 
                ? '#F59E0B' 
                : '#9CA3AF';
              const isLast = index === executionPhases.length - 1;
              
              return (
                <div key={phase.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: phase.status === 'completed' ? '#05C4AF' : phase.status === 'in_progress' ? '#F59E0B' : '#E5E5E5'
                      }}
                    >
                      {phase.status === 'completed' && (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      )}
                    </div>
                    {!isLast && (
                      <div 
                        className="w-0.5 flex-1 mt-2"
                        style={{ 
                          backgroundColor: phase.status === 'completed' ? '#05C4AF' : '#E5E5E5'
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <Card>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[#111111] font-medium">{phase.title}</h4>
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: hexToRgba(statusColor, 0.1),
                            color: statusColor
                          }}
                        >
                          {phase.status === 'completed' 
                            ? 'مكتملة' 
                            : phase.status === 'in_progress' 
                            ? 'قيد التنفيذ' 
                            : 'بالانتظار'}
                        </span>
                      </div>
                      <p className="text-sm text-[#666666] mb-3">المدة: {phase.duration} أيام</p>
                      <div className="space-y-1 mb-3">
                        {phase.description.map((item, idx) => (
                          <p key={idx} className="text-sm text-[#111111]">• {item}</p>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#666666]">الدفعة المرتبطة: </span>
                        <span className="text-sm text-[#111111] font-medium">{phase.payment}</span>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <EmptyState title="لا توجد تقارير" />
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[#111111] font-medium">{report.title}</h4>
                    <span className="text-sm text-[#666666]">{formatDate(report.createdAt)}</span>
                  </div>
                  {report.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#666666]">نسبة إنجاز المشروع</span>
                        <span className="text-sm font-medium text-[#111111]">{report.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${report.progress}%`, backgroundColor: '#05C4AF' }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-[#111111] mb-3">{report.description}</p>
                  {report.attachments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
                        <Paperclip className="w-4 h-4" />
                        <span>{report.attachments.length} {report.attachments.length === 1 ? 'مرفق' : 'مرفقات'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.attachments.map((attachment, idx) => {
                          const fileName = attachment.split('/').pop() || attachment;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                          const isPdf = /\.pdf$/i.test(fileName);
                          
                          return (
                            <a
                              key={idx}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-[#E5E5E5] rounded hover:bg-[#F7F7F7] hover:border-[#111111] transition-colors text-[#111111]"
                            >
                              {isPdf ? (
                                <FileText className="w-4 h-4 text-red-500" />
                              ) : isImage ? (
                                <ImageIcon className="w-4 h-4 text-[#666666]" />
                              ) : (
                                <Paperclip className="w-4 h-4 text-[#666666]" />
                              )}
                              <span className="max-w-[150px] truncate">{fileName}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <EmptyState title="لا توجد فواتير" />
            ) : (
              invoices.map((invoice) => {
                const statusText = (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.APPROVED)
                  ? 'بانتظار الدفع'
                  : invoice.status === InvoiceStatus.PAID
                  ? 'مدفوعة'
                  : 'أخرى';
                const statusColor = invoice.status === InvoiceStatus.PAID 
                  ? '#05C4AF' 
                  : (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.APPROVED)
                  ? '#F59E0B' 
                  : '#9CA3AF';

                // Find related milestone by matching amount
                let relatedMilestone = null;
                if (contract) {
                  relatedMilestone = contract.milestones.find((milestone, index) => {
                    // Try exact match first
                    if (Math.abs(milestone.amount - invoice.totalAmount) < 1 || 
                        Math.abs(milestone.amount - invoice.amount) < 1) {
                      return true;
                    }
                    // Try tolerance match
                    if (Math.abs(milestone.amount - invoice.totalAmount) < 100 ||
                        Math.abs(milestone.amount - invoice.amount) < 100) {
                      return true;
                    }
                    return false;
                  });
                }

                return (
                  <Card key={invoice.id}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-[#111111] font-medium mb-1">{invoice.title}</h4>
                        <p className="text-sm text-[#666666]">رقم الفاتورة: {invoice.id}</p>
                      </div>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: hexToRgba(statusColor, 0.1),
                          color: statusColor
                        }}
                      >
                        {statusText}
                      </span>
                    </div>
                    
                    {/* Amount Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#666666]">المبلغ الاساسي:</span>
                        <span className="text-[#111111] font-medium">{formatSar(invoice.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#666666]">الضريبة 15%:</span>
                        <span className="text-[#111111] font-medium">{formatSar(invoice.vatAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#666666] font-medium">المبلغ الإجمالي:</span>
                        <span className="text-[#111111] font-bold text-lg">{formatSar(invoice.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Related Payment */}
                    {relatedMilestone && contract && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-[#666666]">الدفعة المتعلقة:</span>
                          <span className="text-sm text-[#111111] font-medium">
                            الدفعة {contract.milestones.findIndex(m => m.id === relatedMilestone.id) + 1} - {relatedMilestone.name}
                          </span>
                        </div>
                        {relatedMilestone.description && (
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-[#666666]">الوصف:</span>
                            <span className="text-sm text-[#111111]">{relatedMilestone.description}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Due Date */}
                    <div className="flex items-center gap-4 text-sm text-[#666666] mb-4">
                      <span>تاريخ الاستحقاق: {formatDate(invoice.dueDate)}</span>
                    </div>

                    {/* View PDF Button for Paid Invoices */}
                    {invoice.status === InvoiceStatus.PAID && (
                      <div className="pt-3 border-t border-[#E5E5E5]">
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            // TODO: Open PDF invoice viewer
                            console.log('View PDF invoice:', invoice.id);
                          }}
                        >
                          <FileText className="w-4 h-4 ml-2" />
                          عرض فاتورة PDF
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        );

      case 'complaints':
        return (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <EmptyState title="لا توجد شكاوى" />
            ) : (
              complaints.map((complaint) => {
                // If there's a customer service reply, status should be "تم الرد" with success color
                const hasResponse = !!complaint.response;
                const statusText = hasResponse || complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED
                  ? 'تم الرد'
                  : 'بانتظار الرد';
                const statusColor = hasResponse || complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED
                  ? '#05C4AF'
                  : '#F59E0B';
                
                const complaintTypeText = complaint.type === ComplaintType.DELAY ? 'تأخير' :
                  complaint.type === ComplaintType.QUALITY ? 'جودة' :
                  complaint.type === ComplaintType.SCOPE ? 'نطاق العمل' :
                  complaint.type === ComplaintType.PAYMENT ? 'فواتير/دفع' : 'أخرى';

                // Get requester details
                const requesterId = complaint.raisedBy === 'CLIENT' ? complaint.clientId : complaint.contractorId;
                const requester = complaint.raisedBy === 'CLIENT' 
                  ? mockUsers.find(u => u.id === requesterId)
                  : mockContractors.find(c => c.id === requesterId);
                const requesterTypeText = complaint.raisedBy === 'CLIENT' ? 'العميل' : 'المقاول';

                return (
                  <Card key={complaint.id}>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-sm font-medium text-[#111111]">{complaintTypeText}</span>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: hexToRgba(statusColor, 0.1),
                          color: statusColor
                        }}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* Requester Information */}
                    {requester && (
                      <div className="space-y-2 mb-4 pb-4 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666666]">مقدم الطلب:</span>
                          <span className="text-sm text-[#111111] font-medium">{requester.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666666]">رقم الجوال:</span>
                          <span className="text-sm text-[#111111]">{requester.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666666]">نوع مقدم الطلب:</span>
                          <span className="text-sm text-[#111111] font-medium">{requesterTypeText}</span>
                        </div>
                      </div>
                    )}

                    {/* Complaint Description */}
                    <div className="mb-4">
                      <p className="text-sm text-[#111111] whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {/* Customer Service Reply */}
                    {complaint.response && (
                      <div className="mb-4 pt-4 border-t border-[#E5E5E5]">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-[#111111]">رد خدمة العملاء:</span>
                        </div>
                        <p className="text-sm text-[#111111] whitespace-pre-wrap bg-[#F7F7F7] p-3 rounded-md">{complaint.response}</p>
                        {complaint.respondedAt && (
                          <p className="text-xs text-[#666666] mt-2">تاريخ الرد: {formatDateTime(complaint.respondedAt)}</p>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    <p className="text-xs text-[#666666]">{formatDate(complaint.createdAt)}</p>
                  </Card>
                );
              })
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">تفاصيل المشروع</h1>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};
