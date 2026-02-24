import React from 'react';
import { Modal } from './Modal';

interface PDFViewerProps {
  url: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title = 'عرض PDF',
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full h-[70vh]">
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-full border-0 rounded-md"
          title={title}
        />
        <div className="mt-4 flex justify-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#111111] text-white rounded-md hover:bg-[#222222] transition-colors"
          >
            فتح في نافذة جديدة
          </a>
          <a
            href={url}
            download
            className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#111111] rounded-md hover:bg-[#F7F7F7] transition-colors"
          >
            تحميل
          </a>
        </div>
      </div>
    </Modal>
  );
};
