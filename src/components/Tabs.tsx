import React from 'react';

interface Tab {
  label: string;
  value?: string;
  id?: string;
}

interface TabsProps {
  tabs: Tab[];
  value?: string;
  activeTab?: string;
  onChange?: (value: string) => void;
  onTabChange?: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  activeTab,
  onChange,
  onTabChange,
  className = '',
}) => {
  const currentValue = activeTab || value || tabs[0]?.id || tabs[0]?.value || '';
  const handleChange = (tabValue: string) => {
    if (onTabChange) {
      onTabChange(tabValue);
    } else if (onChange) {
      onChange(tabValue);
    }
  };

  return (
    <div className={`flex gap-2 border-b border-[#E5E5E5] ${className}`}>
      {tabs.map((tab) => {
        const tabId = tab.id || tab.value || '';
        return (
          <button
            key={tabId}
            onClick={() => handleChange(tabId)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              currentValue === tabId
                ? 'text-[#111111] border-b-2 border-[#111111]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
