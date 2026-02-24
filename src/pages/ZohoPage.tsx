import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { Invoice } from '../types';
import { formatSar, formatDate } from '../utils/formatters';

export const ZohoPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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

  const getSyncStatus = (invoice: Invoice): string => {
    return invoice.zohoId ? 'Synced' : 'NotSynced';
  };

  const columns = [
    { key: 'id', label: 'رقم الفاتورة' },
    { key: 'clientId', label: 'العميل' },
    { key: 'totalAmount', label: 'المبلغ', render: (inv: Invoice) => formatSar(inv.totalAmount) },
    {
      key: 'syncStatus',
      label: 'حالة المزامنة',
      render: (invoice: Invoice) => {
        const status = getSyncStatus(invoice);
        return (
          <Badge
            label={status === 'Synced' ? 'متزامن' : status === 'Failed' ? 'فشل' : 'غير متزامن'}
            variant={status === 'Synced' ? 'default' : 'muted'}
          />
        );
      },
    },
    { key: 'zohoId', label: 'Zoho ID', render: (inv: Invoice) => inv.zohoId || '-' },
    { key: 'createdAt', label: 'تاريخ الإنشاء', render: (inv: Invoice) => formatDate(inv.createdAt) },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (invoice: Invoice) => {
        const status = getSyncStatus(invoice);
        return (
          <div className="flex gap-2">
            {status === 'NotSynced' && (
              <Button variant="primary" onClick={() => {}}>
                إنشاء في Zoho
              </Button>
            )}
            {status === 'Synced' && (
              <Button variant="secondary" onClick={() => {}}>
                إعادة المزامنة
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">Zoho Invoices</h1>
      {invoices.length === 0 && !loading ? (
        <EmptyState title="لا توجد فواتير" />
      ) : (
        <Table columns={columns} data={invoices} loading={loading} />
      )}
    </div>
  );
};
