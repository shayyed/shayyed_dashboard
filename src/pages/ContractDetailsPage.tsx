import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';
import { adminApi } from '../services/api';
import type { Contract, ContractorProfile } from '../types';
import { formatSar, formatDate } from '../utils/formatters';
import { mockUsers, mockRequests, mockQuotations, mockProjects } from '../mock/data';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const contracts = await adminApi.listContracts();
      const found = contracts.find(c => c.id === id);
      setContract(found || null);
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

  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#666666]">العقد غير موجود</div>
      </div>
    );
  }

  // العلاقات
  const relatedRequest = mockRequests.find(r => r.id === contract.requestId);
  const client = mockUsers.find(u => u.id === contract.clientId);
  const contractor = mockUsers.find(u => u.id === contract.contractorId) as ContractorProfile | undefined;
  const contractorCompanyName = contractor?.companyName || contractor?.name || '';

  const handleExportPDF = () => {
    // TODO: Implement PDF export logic
    console.log('Exporting contract to PDF...', contract?.id);
    // This would typically generate and download a PDF file
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/contracts')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-semibold text-[#111111]">العقد</h1>
        </div>
        <Button variant="secondary" onClick={handleExportPDF}>
          تصدير PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Contract Header */}
        <Card>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#111111]">عقد تنفيذ أعمال</h2>
            <p className="text-[#666666]">رقم العقد: {contract.id}</p>
            <p className="text-[#666666]">تاريخ العقد: {formatDate(contract.createdAt)}</p>
          </div>
        </Card>

        {/* Contracting Parties */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">الأطراف المتعاقدة</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[140px]">الطرف الأول - العميل:</span>
              <span className="text-[#111111]">{client?.name || contract.clientId}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[140px]">الطرف الثاني - المقاول:</span>
              <span className="text-[#111111]">{contractorCompanyName || contractor?.name || contract.contractorId}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[140px]">رقم الطلب:</span>
              <span className="text-[#111111]">{contract.requestId}</span>
            </div>
          </div>
        </Card>

        {/* Scope of Work */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">نطاق العمل والمواصفات</h3>
          <p className="text-[#111111] mb-4 leading-relaxed">{contract.scope}</p>
          <p className="text-[#111111] font-semibold mb-2">يشمل نطاق العمل ما يلي:</p>
          <ul className="list-none space-y-2 text-[#111111]">
            <li>• أعمال الحفر والردم والتسوية</li>
            <li>• أعمال البناء والخرسانة والحديد</li>
            <li>• أعمال السباكة والكهرباء</li>
            <li>• أعمال الدهانات والبلاط والسيراميك</li>
            <li>• أعمال النجارة والألمنيوم</li>
            <li>• أعمال التنظيف والتسليم النهائي</li>
          </ul>
        </Card>

        {/* Financial Details */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">التفاصيل المالية</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[180px]">القيمة الإجمالية للعقد:</span>
              <span className="text-[#111111] font-bold text-lg">{formatSar(contract.totalPrice)}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[180px]">المدة الزمنية للتنفيذ:</span>
              <span className="text-[#111111]">{contract.duration} يوم عمل</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[180px]">تاريخ البدء المتوقع:</span>
              <span className="text-[#111111]">خلال 3 أيام من التوقيع</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[#666666] min-w-[180px]">تاريخ التسليم المتوقع:</span>
              <span className="text-[#111111]">بعد {contract.duration} يوم من تاريخ البدء</span>
            </div>
          </div>
        </Card>

        {/* Payment Schedule */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-2">جدول الدفعات</h3>
          <p className="text-[#666666] text-sm mb-4">يتم الدفع على ثلاث دفعات مرتبطة بمراحل التنفيذ</p>
          <div className="space-y-4">
            {contract.milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 bg-[#F7F7F7] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#111111] font-medium">
                    {index === 0 && 'الدفعة الأولى - '}
                    {index === 1 && 'الدفعة الثانية - '}
                    {index === 2 && 'الدفعة الثالثة - '}
                    {milestone.name}
                  </span>
                  <span className="text-[#111111] font-bold">{formatSar(milestone.amount)}</span>
                </div>
                {milestone.description && (
                  <p className="text-[#666666] text-sm mt-2">{milestone.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Execution Plan */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-2">خطة التنفيذ</h3>
          <p className="text-[#666666] text-sm mb-4">الجدول الزمني لمراحل العمل</p>
          <div className="space-y-4">
            <div className="p-4 bg-[#F7F7F7] rounded-lg">
              <h4 className="text-[#111111] font-medium mb-2">المرحلة الأولى: الإعداد والتحضير</h4>
              <p className="text-[#666666] text-sm mb-2">المدة: {Math.ceil(contract.duration * 0.15)} أيام</p>
              <div className="text-[#111111] text-sm space-y-1">
                <p>• الحصول على التصاريح اللازمة</p>
                <p>• تجهيز الموقع وإعداد الأدوات</p>
                <p>• فحص المواد والتأكد من جودتها</p>
                <p>• وضع علامات وقياسات دقيقة</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <span className="text-[#666666] text-sm">الدفعة المرتبطة: </span>
                <span className="text-[#111111] text-sm font-medium">الدفعة الأولى (عربون)</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F7] rounded-lg">
              <h4 className="text-[#111111] font-medium mb-2">المرحلة الثانية: التنفيذ الأساسي</h4>
              <p className="text-[#666666] text-sm mb-2">المدة: {Math.ceil(contract.duration * 0.35)} أيام</p>
              <div className="text-[#111111] text-sm space-y-1">
                <p>• أعمال الحفر والردم والتسوية</p>
                <p>• أعمال البناء والخرسانة</p>
                <p>• أعمال السباكة والكهرباء الأساسية</p>
                <p>• أعمال العزل والمواد الأساسية</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <span className="text-[#666666] text-sm">الدفعة المرتبطة: </span>
                <span className="text-[#111111] text-sm font-medium">الدفعة الثانية (منتصف العمل)</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F7] rounded-lg">
              <h4 className="text-[#111111] font-medium mb-2">المرحلة الثالثة: التشطيبات النهائية</h4>
              <p className="text-[#666666] text-sm mb-2">المدة: {Math.ceil(contract.duration * 0.35)} أيام</p>
              <div className="text-[#111111] text-sm space-y-1">
                <p>• أعمال الدهانات والطلاء</p>
                <p>• تركيب البلاط والسيراميك</p>
                <p>• أعمال النجارة والألمنيوم</p>
                <p>• التركيبات النهائية والتشطيبات الدقيقة</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <span className="text-[#666666] text-sm">الدفعة المرتبطة: </span>
                <span className="text-[#111111] text-sm font-medium">الدفعة الثانية (منتصف العمل)</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F7] rounded-lg">
              <h4 className="text-[#111111] font-medium mb-2">المرحلة الرابعة: التسليم والضمان</h4>
              <p className="text-[#666666] text-sm mb-2">المدة: {Math.ceil(contract.duration * 0.15)} أيام</p>
              <div className="text-[#111111] text-sm space-y-1">
                <p>• الفحص النهائي والجودة</p>
                <p>• أعمال التنظيف والتجهيز</p>
                <p>• تسليم المفاتيح والوثائق</p>
                <p>• تفعيل الضمان لمدة سنة واحدة</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <span className="text-[#666666] text-sm">الدفعة المرتبطة: </span>
                <span className="text-[#111111] text-sm font-medium">الدفعة الثالثة (التسليم النهائي)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Terms */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4">شروط إضافية</h3>
          <ul className="list-none space-y-3 text-[#111111]">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>يتم الدفع خلال 3 أيام عمل من تاريخ استحقاق كل دفعة</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>جميع المواد المستخدمة أصلية ومطابقة للمواصفات السعودية</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>ضمان شامل لمدة سنة واحدة على جميع الأعمال المنفذة</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>التأمين على العمال والموقع خلال فترة التنفيذ</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>التنظيف اليومي للموقع وإزالة المخلفات</span>
            </li>
          </ul>
        </Card>

        {/* Contract Terms and Conditions */}
        <Card>
          <h3 className="text-lg font-semibold text-[#111111] mb-4 text-center">شروط وأحكام العقد</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند الأول: شروط الدفع</h4>
              <p className="text-[#111111] leading-relaxed">
                يتم الدفع على دفعات وفقاً لجدول الدفعات المتفق عليه. يجب أن يتم الدفع خلال 3 أيام عمل من تاريخ استحقاق كل دفعة. في حالة التأخير في الدفع، يحق للمقاول إيقاف العمل حتى يتم سداد المبلغ المستحق.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند الثاني: شروط التنفيذ</h4>
              <p className="text-[#111111] leading-relaxed">
                يتعهد المقاول بتنفيذ جميع الأعمال وفقاً للمواصفات المعتمدة وبأعلى معايير الجودة. يجب الحصول على موافقة العميل قبل البدء في أي مرحلة جديدة. يحق للعميل طلب تعديلات بسيطة شريطة إخطار المقاول كتابياً.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند الثالث: المواد والأدوات</h4>
              <p className="text-[#111111] leading-relaxed">
                يتعهد المقاول بتوفير جميع المواد والأدوات اللازمة للتنفيذ وفقاً للمواصفات المتفق عليها. يجب أن تكون جميع المواد أصلية ومطابقة للمواصفات السعودية. يحق للعميل فحص المواد قبل الاستخدام.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند الرابع: الضمانات</h4>
              <p className="text-[#111111] leading-relaxed">
                يضمن المقاول جودة العمل لمدة لا تقل عن سنة واحدة من تاريخ التسليم النهائي. في حالة ظهور أي عيوب أو مشاكل في التنفيذ خلال فترة الضمان، يتعهد المقاول بإصلاحها على نفقته الخاصة دون أي تكلفة إضافية على العميل.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند الخامس: التأخير والعقوبات</h4>
              <p className="text-[#111111] leading-relaxed">
                في حالة تأخير التسليم عن المدة المتفق عليها لأسباب غير قاهرة، يحق للعميل خصم 0.5% من قيمة العقد عن كل يوم تأخير. في حالة التأخير لأكثر من 15 يوماً، يحق للعميل إلغاء العقد واسترداد المبالغ المدفوعة.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-semibold mb-2">البند السادس: حل النزاعات</h4>
              <p className="text-[#111111] leading-relaxed">
                في حالة حدوث أي نزاع بين الطرفين، يتم محاولة حله ودياً. في حالة عدم التوصل لحل، يتم اللجوء للتحكيم وفقاً لنظام التحكيم السعودي.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
