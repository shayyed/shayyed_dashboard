import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchableSelect } from '../components/SearchableSelect';
import { Table } from '../components/Table';
import { ArrowRight } from 'lucide-react';
import { adminApi } from '../services/api';
import type { ChatPairBlock } from '../types';
import { formatDateTime } from '../utils/formatters';

export const ChatBansPage: React.FC = () => {
  const [bans, setBans] = useState<ChatPairBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientRows, setClientRows] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [contractorRows, setContractorRows] = useState<{ id: string; name: string; phone: string }[]>([]);

  const loadBlocks = async () => {
    try {
      setListError(null);
      const items = await adminApi.listChatBlocks();
      setBans(items);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'تعذر تحميل القائمة');
      setBans([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [c, co] = await Promise.all([
          adminApi.listAppUserPickList('CLIENT'),
          adminApi.listAppUserPickList('CONTRACTOR'),
        ]);
        if (!cancelled) {
          setClientRows(c);
          setContractorRows(co);
        }
        await loadBlocks();
      } catch (e) {
        if (!cancelled) setListError(e instanceof Error ? e.message : 'تعذر التحميل');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clientOptions = useMemo(
    () => clientRows.map((c) => ({ label: `${c.name} — ${c.phone}`, value: c.id })),
    [clientRows]
  );

  const contractorOptions = useMemo(
    () => contractorRows.map((c) => ({ label: `${c.name} — ${c.phone}`, value: c.id })),
    [contractorRows]
  );

  const handleConfirmBan = async () => {
    if (!selectedClientId || !selectedContractorId) return;
    setActionError(null);
    setSubmitting(true);
    try {
      await adminApi.createChatBlock(selectedClientId, selectedContractorId);
      setSelectedClientId('');
      setSelectedContractorId('');
      await loadBlocks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'تعذر إنشاء الحظر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBan = async (id: string) => {
    setActionError(null);
    try {
      await adminApi.deleteChatBlock(id);
      await loadBlocks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'تعذر إلغاء الحظر');
    }
  };

  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (ban: ChatPairBlock) => {
        const label = ban.clientName?.trim();
        return label ? (
          <Link to={`/users/clients/${ban.clientId}`} className="text-blue-600 hover:underline">
            {label}
          </Link>
        ) : (
          <Link to={`/users/clients/${ban.clientId}`} className="text-blue-600 hover:underline">
            {ban.clientId}
          </Link>
        );
      },
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (ban: ChatPairBlock) => {
        const label = ban.contractorName?.trim();
        return label ? (
          <Link to={`/users/contractors/${ban.contractorId}`} className="text-blue-600 hover:underline">
            {label}
          </Link>
        ) : (
          <Link to={`/users/contractors/${ban.contractorId}`} className="text-blue-600 hover:underline">
            {ban.contractorId}
          </Link>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'تاريخ الحظر',
      render: (ban: ChatPairBlock) => formatDateTime(ban.createdAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (ban: ChatPairBlock) => (
        <Button variant="secondary" onClick={() => void handleRemoveBan(ban.id)}>
          إلغاء الحظر
        </Button>
      ),
    },
  ];

  const canConfirm = selectedClientId && selectedContractorId && !submitting;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/chats" className="text-[#666666] hover:text-[#111111]">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">حظر بعض المحادثات</h1>
      </div>

      {(listError || actionError) && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {actionError || listError}
        </div>
      )}

      <Card title="إضافة حظر جديد">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SearchableSelect
            label="العميل"
            placeholder="ابحث بالاسم أو رقم الجوال..."
            options={clientOptions}
            value={selectedClientId}
            onChange={setSelectedClientId}
          />
          <SearchableSelect
            label="المقاول"
            placeholder="ابحث بالاسم أو رقم الجوال..."
            options={contractorOptions}
            value={selectedContractorId}
            onChange={setSelectedContractorId}
          />
        </div>
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          بعد تأكيد هذا الحظر، لن يتمكن العميل والمقاول من التواصل عبر المحادثة مع بعضهما البعض، ويمكن للمسؤول إلغاء هذا الحظر لاحقاً.
        </div>
        <Button variant="primary" onClick={() => void handleConfirmBan()} disabled={!canConfirm}>
          {submitting ? 'جاري الحفظ…' : 'تأكيد الحظر'}
        </Button>
      </Card>

      <Card title="قائمة المحظورين">
        {loading ? (
          <p className="text-[#666666] text-center py-8">جاري التحميل…</p>
        ) : bans.length === 0 ? (
          <p className="text-[#666666] text-center py-8">لا توجد محادثات محظورة حالياً.</p>
        ) : (
          <Table columns={columns} data={bans} loading={false} />
        )}
      </Card>
    </div>
  );
};
