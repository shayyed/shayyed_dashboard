import React, { useState } from 'react';
import { Modal } from './Modal';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  thumbnail?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'صورة',
  className = '',
  thumbnail = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setShowModal(true)}
        className={`${thumbnail ? 'w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80' : ''} ${className}`}
      />
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={alt}
        size="lg"
      >
        <div className="flex justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[70vh] object-contain rounded-md"
          />
        </div>
      </Modal>
    </>
  );
};
