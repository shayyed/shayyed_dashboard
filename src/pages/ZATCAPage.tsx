import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Drawer } from '../components/Drawer';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Invoice } from '../types';
import { formatDate, formatStatus } from '../utils/formatters';

export const ZATCAPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'رقم الفاتورة' },
    { key: 'projectId', label: 'المشروع' },
    { key: 'contractorId', label: 'المقاول' },
    {
      key: 'zatcaStatus',
      label: 'الحالة',
      render: (invoice: Invoice) => <Badge label={formatStatus(invoice.zatcaStatus)} />,
    },
    { key: 'zatcaUuid', label: 'UUID', render: (inv: Invoice) => inv.zatcaUuid || '-' },
    { key: 'zatcaIssuedAt', label: 'تاريخ الإصدار', render: (inv: Invoice) => inv.zatcaIssuedAt ? formatDate(inv.zatcaIssuedAt) : '-' },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (invoice: Invoice) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedInvoice(invoice)}>
            عرض التفاصيل
          </Button>
          {invoice.zatcaStatus === 'NOT_ISSUED' && (
            <Button variant="primary" onClick={() => {}}>
              إصدار
            </Button>
          )}
          {invoice.zatcaStatus === 'PENDING' && (
            <Button variant="secondary" onClick={() => {}}>
              إعادة المحاولة
            </Button>
          )}
          {invoice.zatcaStatus === 'ISSUED' && (
            <Button variant="ghost" onClick={() => {}}>
              عرض XML
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">ZATCA</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <p className="text-sm text-[#666666]">فواتير لم تصدر</p>
          <p className="text-2xl font-semibold text-[#111111]">
            {invoices.filter(i => i.zatcaStatus === 'NOT_ISSUED').length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <p className="text-sm text-[#666666]">قيد الإصدار</p>
          <p className="text-2xl font-semibold text-[#111111]">
            {invoices.filter(i => i.zatcaStatus === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <p className="text-sm text-[#666666]">صادرة</p>
          <p className="text-2xl font-semibold text-[#111111]">
            {invoices.filter(i => i.zatcaStatus === 'ISSUED').length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <p className="text-sm text-[#666666]">مرفوضة</p>
          <p className="text-2xl font-semibold text-[#111111]">
            {invoices.filter(i => i.zatcaStatus === 'REJECTED').length}
          </p>
        </div>
      </div>
      {invoices.length === 0 && !loading ? (
        <EmptyState title="لا توجد فواتير" />
      ) : (
        <Table columns={columns} data={invoices} loading={loading} onRowClick={(invoice) => setSelectedInvoice(invoice)} />
      )}
      <Drawer
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        title="تفاصيل ZATCA"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">رقم الفاتورة</p>
              <p className="text-[#111111]">{selectedInvoice.id}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">المشروع</p>
              <p className="text-[#111111]">{selectedInvoice.projectId}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">المقاول</p>
              <p className="text-[#111111]">{selectedInvoice.contractorId}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">حالة ZATCA</p>
              <Badge label={formatStatus(selectedInvoice.zatcaStatus)} />
            </div>
            {selectedInvoice.zatcaUuid && (
              <div>
                <p className="text-sm text-[#666666]">UUID</p>
                <p className="text-[#111111] font-mono text-xs">{selectedInvoice.zatcaUuid}</p>
              </div>
            )}
            {selectedInvoice.zatcaIssuedAt && (
              <div>
                <p className="text-sm text-[#666666]">تاريخ الإصدار</p>
                <p className="text-[#111111]">{formatDate(selectedInvoice.zatcaIssuedAt)}</p>
              </div>
            )}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <p className="text-sm font-semibold text-[#111111] mb-3">سجل الحالة</p>
              <div className="space-y-2">
                <div className="text-sm text-[#666666]">
                  {formatDate(selectedInvoice.createdAt)} - تم إنشاء الفاتورة
                </div>
                {selectedInvoice.zatcaStatus === 'ISSUED' && selectedInvoice.zatcaIssuedAt && (
                  <div className="text-sm text-[#666666]">
                    {formatDate(selectedInvoice.zatcaIssuedAt)} - تم إصدار الفاتورة
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
