import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import * as LucideIcons from 'lucide-react';

// قائمة الأيقونات المسطحة من lucide-react
const SUGGESTED_ICONS = [
  { name: 'Palette', component: LucideIcons.Palette },
  { name: 'Hammer', component: LucideIcons.Hammer },
  { name: 'Building2', component: LucideIcons.Building2 },
  { name: 'Wrench', component: LucideIcons.Wrench },
  { name: 'ClipboardList', component: LucideIcons.ClipboardList },
  { name: 'Box', component: LucideIcons.Box },
  { name: 'Home', component: LucideIcons.Home },
  { name: 'UtensilsCrossed', component: LucideIcons.UtensilsCrossed },
  { name: 'Droplet', component: LucideIcons.Droplet },
  { name: 'Paintbrush', component: LucideIcons.Paintbrush },
  { name: 'Square', component: LucideIcons.Square },
  { name: 'Construction', component: LucideIcons.Construction },
  { name: 'Settings', component: LucideIcons.Settings },
  { name: 'Eye', component: LucideIcons.Eye },
  { name: 'Snowflake', component: LucideIcons.Snowflake },
  { name: 'Layers', component: LucideIcons.Layers },
  { name: 'Zap', component: LucideIcons.Zap },
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  className?: string;
}

// Helper function to get icon component by name
const getIconComponent = (iconName: string) => {
  const icon = SUGGESTED_ICONS.find((i) => i.name === iconName);
  return icon ? icon.component : null;
};

export const IconPicker: React.FC<IconPickerProps> = ({
  value = '',
  onChange,
  label = 'اختر الأيقونة',
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = SUGGESTED_ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#111111] mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {value && (() => {
          const IconComponent = getIconComponent(value);
          return IconComponent ? (
            <div className="w-10 h-10 flex items-center justify-center border border-[#E5E5E5] rounded-md bg-[#F7F7F7]">
              <IconComponent className="w-5 h-5 text-[#111111]" />
            </div>
          ) : null;
        })()}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-md text-[#111111] hover:bg-[#F7F7F7] transition-colors"
        >
          {value ? 'تغيير الأيقونة' : 'اختر الأيقونة'}
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="اختر الأيقونة"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            placeholder="بحث عن أيقونة..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredIcons.map((icon) => {
              const IconComponent = icon.component;
              return (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    onChange(icon.name);
                    setShowModal(false);
                  }}
                  className={`p-4 border rounded-md hover:bg-[#F7F7F7] transition-colors ${
                    value === icon.name ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5]'
                  }`}
                >
                  <IconComponent className="w-6 h-6 text-[#111111] block mx-auto mb-2" />
                  <p className="text-xs text-[#666666] text-center">{icon.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
