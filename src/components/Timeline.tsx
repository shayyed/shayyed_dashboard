import React from 'react';
import { formatDateTime } from '../utils/formatters';
import { UserRole } from '../types';
import { FileText, Image as ImageIcon } from 'lucide-react';

export interface TimelineEntry {
  id: string;
  projectId: string;
  createdAt: string;
  content: string;
  attachments?: string[];
  userId: string;
  userRole: UserRole | 'ADMIN';
  updateType: 'text' | 'image' | 'file';
}

interface TimelineProps {
  entries: TimelineEntry[];
  onAddEntry?: () => void;
  onDeleteEntry?: (id: string) => void;
  onEditEntry?: (id: string) => void;
  canManage?: boolean;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  onEditEntry,
  canManage = false,
  className = '',
}) => {
  return (
    <div className={className}>
      {canManage && onAddEntry && (
        <div className="mb-4">
          <button
            onClick={onAddEntry}
            className="px-4 py-2 bg-[#111111] text-white rounded-md hover:bg-[#222222] transition-colors"
          >
            إضافة تحديث
          </button>
        </div>
      )}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-[#666666]">
            لا توجد تحديثات
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex gap-4 relative"
            >
              {/* Timeline Line */}
              {index < entries.length - 1 && (
                <div className="absolute right-6 top-12 bottom-0 w-0.5 bg-[#E5E5E5]" />
              )}
              
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-3 h-3 bg-[#111111] rounded-full border-2 border-white" />
              </div>

              {/* Content */}
              <div className="flex-1 bg-white border border-[#E5E5E5] rounded-md p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">
                      {entry.userRole === 'ADMIN' ? 'المشرف' : entry.userRole === 'CLIENT' ? 'العميل' : 'المقاول'}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      {onEditEntry && (
                        <button
                          onClick={() => onEditEntry(entry.id)}
                          className="text-xs text-[#111111] hover:text-[#666666]"
                        >
                          تعديل
                        </button>
                      )}
                      {onDeleteEntry && (
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#111111] mb-2">{entry.content}</p>
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.attachments.map((attachment, idx) => {
                      const fileName = attachment.split('/').pop() || `مرفق ${idx + 1}`;
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                      const isPdf = /\.pdf$/i.test(fileName);
                      
                      return (
                        <a
                          key={idx}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600"
                        >
                          {isPdf ? (
                            <FileText className="w-3.5 h-3.5 text-red-500" />
                          ) : isImage ? (
                            <ImageIcon className="w-3.5 h-3.5 text-[#666666]" />
                          ) : null}
                          <span>{fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
