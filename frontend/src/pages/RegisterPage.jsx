import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, fullName);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#16845B] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#183B2B] tracking-tight">Join AI WasteWise</h2>
          <p className="text-xs text-[#52705F] mt-1">
            Create an account and receive <strong>+50 Welcome Eco-Points</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#183B2B] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-[#52705F]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] placeholder:text-[#52705F]/50 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#52705F]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] placeholder:text-[#52705F]/50 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#183B2B] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#52705F]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] placeholder:text-[#52705F]/50 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F2F9F3] text-center">
          <p className="text-xs text-[#52705F]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#16845B] font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
