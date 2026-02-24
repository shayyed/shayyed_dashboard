import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Tabs } from '../components/Tabs';
import { Badge } from '../components/Badge';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { adminApi } from '../services/api';
import type { ContractorProfile } from '../types';
import { formatDate, formatStatus } from '../utils/formatters';
import { mockContractors } from '../mock/data';

const TABS = [
  { label: 'قيد المراجعة', value: 'PENDING' },
  { label: 'موثق', value: 'VERIFIED' },
  { label: 'مرفوض', value: 'REJECTED' },
];

export const VerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<ContractorProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadContractors();
  }, [activeTab]);

  const loadContractors = async () => {
    setLoading(true);
    const filtered = mockContractors.filter(c => c.verificationStatus === activeTab);
    setContractors(filtered);
    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    try {
      await adminApi.verifyContractor(id, 'VERIFIED');
      loadContractors();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedContractor || !rejectReason) return;
    try {
      await adminApi.verifyContractor(selectedContractor.id, 'REJECTED');
      setShowRejectModal(false);
      setRejectReason('');
      loadContractors();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'الاسم' },
    { key: 'companyName', label: 'اسم الشركة' },
    { key: 'phone', label: 'الهاتف' },
    {
      key: 'verificationStatus',
      label: 'الحالة',
      render: (c: ContractorProfile) => <Badge label={formatStatus(c.verificationStatus)} />,
    },
    { key: 'createdAt', label: 'تاريخ التسجيل', render: (c: ContractorProfile) => formatDate(c.createdAt) },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (contractor: ContractorProfile) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedContractor(contractor)}>
            عرض التفاصيل
          </Button>
          {contractor.verificationStatus === 'PENDING' && (
            <>
              <Button variant="primary" onClick={() => handleVerify(contractor.id)}>
                قبول
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedContractor(contractor);
                  setShowRejectModal(true);
                }}
              >
                رفض
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">التحقق من المقاولين</h1>
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      {contractors.length === 0 && !loading ? (
        <EmptyState title="لا يوجد مقاولون في هذا القسم" />
      ) : (
        <Table columns={columns} data={contractors} loading={loading} />
      )}
      <Drawer
        isOpen={selectedContractor !== null}
        onClose={() => setSelectedContractor(null)}
        title="تفاصيل المقاول"
      >
        {selectedContractor && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">الاسم</p>
              <p className="text-[#111111]">{selectedContractor.name}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">اسم الشركة</p>
              <p className="text-[#111111]">{selectedContractor.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">الهاتف</p>
              <p className="text-[#111111]">{selectedContractor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">الخدمات</p>
              <p className="text-[#111111]">{selectedContractor.services.join('، ')}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">مناطق التغطية</p>
              <p className="text-[#111111]">{selectedContractor.coverageAreas.join('، ')}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">التقييم</p>
              <p className="text-[#111111]">{selectedContractor.rating}</p>
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
        title="رفض التحقق"
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
