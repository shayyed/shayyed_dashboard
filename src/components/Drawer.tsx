import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 w-96 bg-white border-r border-[#E5E5E5] z-50 overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-semibold text-[#111111]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#111111]"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="p-4 border-t border-[#E5E5E5]">{footer}</div>
        )}
      </div>
    </>
  );
};
