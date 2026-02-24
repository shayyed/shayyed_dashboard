import React from 'react';
import { Button } from './Button';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onUpdateStatus?: () => void;
  onExport?: () => void;
  onSendNotification?: () => void;
  className?: string;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onDelete,
  onUpdateStatus,
  onExport,
  onSendNotification,
  className = '',
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 p-4 bg-[#F7F7F7] rounded-md border border-[#E5E5E5] ${className}`}>
      <span className="text-sm text-[#111111] font-medium">
        تم تحديد {selectedCount} عنصر
      </span>
      <div className="flex gap-2 mr-auto">
        {onDelete && (
          <Button
            variant="destructive"
            onClick={onDelete}
            className="text-sm"
          >
            حذف المحدد
          </Button>
        )}
        {onUpdateStatus && (
          <Button
            variant="secondary"
            onClick={onUpdateStatus}
            className="text-sm"
          >
            تحديث الحالة
          </Button>
        )}
        {onExport && (
          <Button
            variant="secondary"
            onClick={onExport}
            className="text-sm"
          >
            تصدير المحدد
          </Button>
        )}
        {onSendNotification && (
          <Button
            variant="secondary"
            onClick={onSendNotification}
            className="text-sm"
          >
            إرسال إشعار
          </Button>
        )}
      </div>
    </div>
  );
};
