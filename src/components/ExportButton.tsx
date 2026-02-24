import React, { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ExportButtonProps {
  onExport: (format: 'excel' | 'pdf' | 'csv') => void;
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    onExport(format);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className={className}
      >
        تصدير
      </Button>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="تصدير البيانات"
        size="sm"
      >
        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => handleExport('excel')}
            className="w-full"
          >
            تصدير Excel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport('pdf')}
            className="w-full"
          >
            تصدير PDF
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport('csv')}
            className="w-full"
          >
            تصدير CSV
          </Button>
        </div>
      </Modal>
    </>
  );
};
