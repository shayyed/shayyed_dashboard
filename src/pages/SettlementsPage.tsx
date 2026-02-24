import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { FilterBar } from '../components/FilterBar';
import { Badge } from '../components/Badge';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { adminApi } from '../services/api';
import type { Settlement } from '../types';
import { formatSar, formatDate, formatStatus } from '../utils/formatters';

const TABS = [
  { label: 'مستحقة', value: 'Pending' },
  { label: 'قيد المعالجة', value: 'Processing' },
  { label: 'مكتملة', value: 'Paid' },
  { label: 'مرفوضة', value: 'Rejected' },
];

export const SettlementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractorFilter, setContractorFilter] = useState('');

  useEffect(() => {
    loadSettlements();
  }, [activeTab, periodFrom, periodTo, statusFilter, contractorFilter]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listSettlements();
      const filtered = data.filter(s => s.status === activeTab);
      setSettlements(filtered);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcessing = async (id: string) => {
    try {
      await adminApi.updateSettlementStatus(id, 'Processing');
      loadSettlements();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      await adminApi.updateSettlementStatus(id, 'Paid');
      loadSettlements();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedSettlement || !rejectReason) return;
    try {
      await adminApi.updateSettlementStatus(selectedSettlement.id, 'Rejected');
      setShowRejectModal(false);
      setRejectReason('');
      loadSettlements();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    { key: 'id', label: 'رقم التسوية' },
    { key: 'contractorName', label: 'المقاول' },
    {
      key: 'period',
      label: 'الفترة',
      render: (settlement: Settlement) =>
        `${formatDate(settlement.periodStart)} - ${formatDate(settlement.periodEnd)}`,
    },
    { key: 'grossAmount', label: 'الإجمالي', render: (s: Settlement) => formatSar(s.grossAmount) },
    { key: 'netPayout', label: 'صافي التحويل', render: (s: Settlement) => formatSar(s.netPayout) },
    { key: 'status', label: 'الحالة', render: (s: Settlement) => <Badge label={formatStatus(s.status)} /> },
    { key: 'createdAt', label: 'تاريخ الإنشاء', render: (s: Settlement) => formatDate(s.createdAt) },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (settlement: Settlement) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedSettlement(settlement)}>
            عرض التفاصيل
          </Button>
          {settlement.status === 'Pending' && (
            <Button variant="secondary" onClick={() => handleStartProcessing(settlement.id)}>
              بدء المعالجة
            </Button>
          )}
          {settlement.status === 'Processing' && (
            <Button variant="primary" onClick={() => handleConfirmPayment(settlement.id)}>
              تأكيد التحويل
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedSettlement(settlement);
              setShowRejectModal(true);
            }}
          >
            رفض
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">التسويات</h1>
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      <FilterBar
        filters={[
          {
            type: 'date',
            key: 'periodFrom',
            label: 'من تاريخ',
            value: periodFrom,
            onChange: setPeriodFrom,
          },
          {
            type: 'date',
            key: 'periodTo',
            label: 'إلى تاريخ',
            value: periodTo,
            onChange: setPeriodTo,
          },
          {
            type: 'select',
            key: 'status',
            label: 'الحالة',
            options: [
              { label: 'الكل', value: '' },
              { label: 'مستحقة', value: 'Pending' },
              { label: 'قيد المعالجة', value: 'Processing' },
              { label: 'مكتملة', value: 'Paid' },
              { label: 'مرفوضة', value: 'Rejected' },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            type: 'text',
            key: 'contractor',
            label: 'المقاول',
            value: contractorFilter,
            onChange: setContractorFilter,
          },
        ]}
        onReset={() => {
          setPeriodFrom('');
          setPeriodTo('');
          setStatusFilter('');
          setContractorFilter('');
        }}
      />
      {settlements.length === 0 && !loading ? (
        <EmptyState title="لا توجد تسويات في هذا القسم" />
      ) : (
        <Table columns={columns} data={settlements} loading={loading} />
      )}
      <Drawer
        isOpen={selectedSettlement !== null}
        onClose={() => setSelectedSettlement(null)}
        title="تفاصيل التسوية"
      >
        {selectedSettlement && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">المقاول</p>
              <p className="text-[#111111]">{selectedSettlement.contractorName}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">الفترة</p>
              <p className="text-[#111111]">
                {formatDate(selectedSettlement.periodStart)} - {formatDate(selectedSettlement.periodEnd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">إجمالي الفواتير</p>
              <p className="text-[#111111]">{formatSar(selectedSettlement.grossAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">عمولة المنصة</p>
              <p className="text-[#111111]">{formatSar(selectedSettlement.platformFee)}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">ضريبة VAT</p>
              <p className="text-[#111111]">{formatSar(selectedSettlement.vatAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">صافي التحويل</p>
              <p className="text-[#111111] font-semibold">{formatSar(selectedSettlement.netPayout)}</p>
            </div>
            <div className="pt-4 border-t border-[#E5E5E5]">
              <p className="text-sm font-semibold text-[#111111] mb-3">قائمة الفواتير الداخلة في التسوية</p>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-[#F7F7F7] rounded">
                    <span className="text-sm text-[#111111]">فاتورة #{i}</span>
                    <span className="text-sm text-[#111111]">{formatSar(1000)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[#E5E5E5]">
              <p className="text-sm font-semibold text-[#111111] mb-3">سجل الإجراءات</p>
              <div className="space-y-2">
                <div className="text-sm text-[#666666]">
                  {formatDate(selectedSettlement.createdAt)} - تم إنشاء التسوية
                </div>
                {selectedSettlement.processedAt && (
                  <div className="text-sm text-[#666666]">
                    {formatDate(selectedSettlement.processedAt)} - تمت المعالجة
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              {selectedSettlement.status === 'Processing' && (
                <Button variant="primary" onClick={() => handleConfirmPayment(selectedSettlement.id)}>
                  تأكيد التحويل
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => {
                  setShowRejectModal(true);
                }}
              >
                رفض التسوية
              </Button>
              <Button variant="secondary" onClick={() => {}}>
                تحميل كشف
              </Button>
            </div>
          </div>
        )}
      </Drawer>
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="رفض التسوية"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              رفض
            </Button>
          </>
        }
      >
        <Input
          label="سبب الرفض"
          value={rejectReason}
          onChange={setRejectReason}
          required
        />
      </Modal>
    </div>
  );
};
