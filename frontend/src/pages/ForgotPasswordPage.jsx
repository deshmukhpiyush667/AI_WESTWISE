import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage({ onNavigate }) {
  const { requestPasswordReset, executePasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || 'If that email exists, a reset token has been dispatched.');
      if (data.dev_reset_token) {
        setResetToken(data.dev_reset_token);
      }
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Failed to request reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await executePasswordReset(resetToken, newPassword);
      setMessage('Password successfully reset! You can now log in.');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Invalid or expired token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)]">
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52705F] hover:text-[#183B2B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#16845B] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#183B2B] tracking-tight">Reset Password</h2>
          <p className="text-xs text-[#52705F] mt-1">
            {step === 'request'
              ? 'Enter your registered email to receive a password reset token.'
              : 'Enter your reset token and your new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] text-xs font-semibold text-[#16845B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#183B2B] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#52705F]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] placeholder:text-[#52705F]/50 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl font-bold shadow-xs hover:shadow-md transition text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#183B2B] mb-1.5">Reset Token</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste reset token here"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl font-bold shadow-xs hover:shadow-md transition text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
