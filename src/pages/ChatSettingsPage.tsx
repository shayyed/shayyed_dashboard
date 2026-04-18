import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { ArrowRight } from 'lucide-react';
import { adminApi } from '../services/api';
import type { ChatPlatformSettings } from '../types';

const defaultSettings: ChatPlatformSettings = {
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
  const [settings, setSettings] = useState<ChatPlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const s = await adminApi.getChatSettings();
        if (!cancelled) setSettings({ ...defaultSettings, ...s });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'تعذر تحميل الإعدادات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = async <K extends keyof ChatPlatformSettings>(key: K, value: ChatPlatformSettings[K]) => {
    const prev = settings;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setError(null);
    try {
      const saved = await adminApi.updateChatSettings({ [key]: value });
      setSettings({ ...defaultSettings, ...saved });
    } catch (e) {
      setSettings(prev);
      setError(e instanceof Error ? e.message : 'تعذر حفظ الإعداد');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/chats" className="text-[#666666] hover:text-[#111111]">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">إعدادات المحادثات</h1>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}

      <Card title="إعدادات عامة">
        {loading ? (
          <p className="text-[#666666] py-6 text-center">جاري التحميل…</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
              <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                <span className="text-[#111111] font-medium">
                  إخفاء زر المحادثة للعميل والمقاول عند مرحلة تلقي العروض
                </span>
                <ToggleSwitch
                  checked={settings.hideChatDuringOffers}
                  onChange={(v) => void updateSetting('hideChatDuringOffers', v)}
                  disabled={settings.disableChatCompletely}
                />
              </div>
              <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
                <p>
                  <strong>مفعّل:</strong> لن يظهر زر المحادثة للعميل والمقاول أثناء مرحلة تلقي العروض على الطلب.
                </p>
                <p>
                  <strong>معطّل:</strong> يظهر زر المحادثة للعميل والمقاول أثناء مرحلة تلقي العروض.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
              <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                <span className="text-[#111111] font-medium">
                  إخفاء زر المحادثة للعميل والمقاول بعد مرحلة ترسية المشروع
                </span>
                <ToggleSwitch
                  checked={settings.hideChatAfterAward}
                  onChange={(v) => void updateSetting('hideChatAfterAward', v)}
                  disabled={settings.disableChatCompletely}
                />
              </div>
              <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
                <p>
                  <strong>مفعّل:</strong> لن يظهر زر المحادثة للعميل والمقاول بعد ترسية المشروع.
                </p>
                <p>
                  <strong>معطّل:</strong> يظهر زر المحادثة للعميل والمقاول بعد ترسية المشروع.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-[#E5E5E5]">
              <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                <span className="text-[#111111] font-medium">
                  تعطيل خاصية المحادثات بشكل كامل بين العملاء والمقاولين
                </span>
                <ToggleSwitch
                  checked={settings.disableChatCompletely}
                  onChange={(v) => void updateSetting('disableChatCompletely', v)}
                />
              </div>
              <div className="text-sm text-[#666666] bg-[#F7F7F7] p-3 rounded-lg min-w-0 space-y-1">
                <p>
                  <strong>مفعّل:</strong> لن يتمكن أي عميل أو مقاول من المحادثة مع بعضهم البعض في النظام.
                </p>
                <p>
                  <strong>معطّل:</strong> المحادثات تعمل بشكل طبيعي بين العملاء والمقاولين.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
