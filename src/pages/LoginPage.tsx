import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (admin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="شيّد" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-xl font-semibold text-[#111111] text-center mb-1">لوحة التحكم</h1>
        <p className="text-sm text-[#666666] text-center mb-8">تسجيل دخول المسؤول</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="text-sm text-[#D34D72] bg-[#D34D72]/10 border border-[#D34D72]/20 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : null}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#111111] mb-1.5">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#111111] text-white text-sm font-medium py-3 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
};
