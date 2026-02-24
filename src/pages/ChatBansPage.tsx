import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchableSelect } from '../components/SearchableSelect';
import { Table } from '../components/Table';
import { ArrowRight } from 'lucide-react';
import { mockUsers } from '../mock/data';
import { UserRole } from '../types';
import { formatDateTime } from '../utils/formatters';

const CHAT_BANS_KEY = 'shayyed_chat_bans';

export interface ChatBan {
  id: string;
  clientId: string;
  contractorId: string;
  bannedAt: string;
}

export const ChatBansPage: React.FC = () => {
  const [bans, setBans] = useState<ChatBan[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState('');

  const clientOptions = useMemo(() => {
    return mockUsers
      .filter((u) => u.role === UserRole.CLIENT)
      .map((c) => ({ label: `${c.name} - ${c.phone}`, value: c.id }));
  }, []);

  const contractorOptions = useMemo(() => {
    return mockUsers
      .filter((u) => u.role === UserRole.CONTRACTOR)
      .map((c) => ({ label: `${c.name} - ${c.phone}`, value: c.id }));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_BANS_KEY);
      if (stored) {
        setBans(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveBans = (next: ChatBan[]) => {
    setBans(next);
    localStorage.setItem(CHAT_BANS_KEY, JSON.stringify(next));
  };

  const handleConfirmBan = () => {
    if (!selectedClientId || !selectedContractorId) return;
    const exists = bans.some(
      (b) =>
        (b.clientId === selectedClientId && b.contractorId === selectedContractorId) ||
        (b.clientId === selectedContractorId && b.contractorId === selectedClientId)
    );
    if (exists) return;
    const newBan: ChatBan = {
      id: `ban-${Date.now()}`,
      clientId: selectedClientId,
      contractorId: selectedContractorId,
      bannedAt: new Date().toISOString(),
    };
    saveBans([...bans, newBan]);
    setSelectedClientId('');
    setSelectedContractorId('');
  };

  const handleRemoveBan = (id: string) => {
    saveBans(bans.filter((b) => b.id !== id));
  };

  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (ban: ChatBan) => {
        const client = mockUsers.find((u) => u.id === ban.clientId);
        return client ? (
          <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'contractor',
      label: 'المقاول',
      render: (ban: ChatBan) => {
        const contractor = mockUsers.find((u) => u.id === ban.contractorId);
        return contractor ? (
          <Link
            to={`/users/contractors/${contractor.id}`}
            className="text-blue-600 hover:underline"
          >
            {contractor.name}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'bannedAt',
      label: 'تاريخ الحظر',
      render: (ban: ChatBan) => formatDateTime(ban.bannedAt),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (ban: ChatBan) => (
        <Button variant="secondary" onClick={() => handleRemoveBan(ban.id)}>
          إلغاء الحظر
        </Button>
      ),
    },
  ];

  const canConfirm = selectedClientId && selectedContractorId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/chats" className="text-[#666666] hover:text-[#111111]">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">حظر بعض المحادثات</h1>
      </div>

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
        <Button
          variant="primary"
          onClick={handleConfirmBan}
          disabled={!canConfirm}
        >
          تأكيد الحظر
        </Button>
      </Card>

      <Card title="قائمة المحظورين">
        {bans.length === 0 ? (
          <p className="text-[#666666] text-center py-8">لا توجد محادثات محظورة حالياً.</p>
        ) : (
          <Table columns={columns} data={bans} loading={false} />
        )}
      </Card>
    </div>
  );
};
