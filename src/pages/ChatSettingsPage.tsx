import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { ArrowRight } from 'lucide-react';

const CHAT_SETTINGS_KEY = 'shayyed_chat_settings';

export interface ChatSettings {
  hideChatDuringOffers: boolean;
  hideChatAfterAward: boolean;
  disableChatCompletely: boolean;
}

const defaultSettings: ChatSettings = {
  hideChatDuringOffers: false,
  hideChatAfterAward: false,
  disableChatCompletely: false,
};

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
      disabled ? 'bg-gray-200 cursor-not-allowed opacity-60' : checked ? 'bg-[#05C4AF]' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
        checked ? 'left-[22px]' : 'left-[2px]'
      }`}
    />
  </button>
);

export const ChatSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSettings;
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/chats" className="text-[#666666] hover:text-[#111111]">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">إعدادات المحادثات</h1>
      </div>

      <Card title="إعدادات عامة">
        <div className="space-y-6">
          {/* Toggle 1 */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
            <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
              <span className="text-[#111111] font-medium">
                إخفاء زر المحادثة للعميل والمقاول عند مرحلة تلقي العروض
              </span>
              <ToggleSwitch
                checked={settings.hideChatDuringOffers}
                onChange={(v) => updateSetting('hideChatDuringOffers', v)}
                disabled={settings.disableChatCompletely}
              />
            </div>
            <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
              <p><strong>مفعّل:</strong> لن يظهر زر المحادثة للعميل والمقاول أثناء مرحلة تلقي العروض على الطلب.</p>
              <p><strong>معطّل:</strong> يظهر زر المحادثة للعميل والمقاول أثناء مرحلة تلقي العروض.</p>
            </div>
          </div>

          {/* Toggle 2 */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
            <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
              <span className="text-[#111111] font-medium">
                إخفاء زر المحادثة للعميل والمقاول بعد مرحلة ترسية المشروع
              </span>
              <ToggleSwitch
                checked={settings.hideChatAfterAward}
                onChange={(v) => updateSetting('hideChatAfterAward', v)}
                disabled={settings.disableChatCompletely}
              />
            </div>
            <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
              <p><strong>مفعّل:</strong> لن يظهر زر المحادثة للعميل والمقاول بعد ترسية المشروع.</p>
              <p><strong>معطّل:</strong> يظهر زر المحادثة للعميل والمقاول بعد ترسية المشروع.</p>
            </div>
          </div>

          {/* Toggle 3 */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
            <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
              <span className="text-[#111111] font-medium">
                تعطيل خاصية المحادثات بشكل كامل بين العملاء والمقاولين
              </span>
              <ToggleSwitch
                checked={settings.disableChatCompletely}
                onChange={(v) => updateSetting('disableChatCompletely', v)}
              />
            </div>
            <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
              <p><strong>مفعّل:</strong> لن يتمكن أي عميل أو مقاول من المحادثة مع بعضهم البعض في النظام.</p>
              <p><strong>معطّل:</strong> المحادثات تعمل بشكل طبيعي بين العملاء والمقاولين.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
