import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Lock,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { exportHistoryCsv } from '../api/client';

export default function ProfilePage({ onNavigate }) {
  const { user, updatePassword, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 text-center bg-[#FFFFFF] p-8 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4">
        <h3 className="text-xl font-black text-[#183B2B]">Sign In Required</h3>
        <p className="text-xs text-[#52705F]">
          You must be logged in to access your profile settings and data.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);

    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr('Password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(oldPassword, newPassword);
      setPasswordMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordErr(err.message || 'Failed to update password. Verify current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      await exportHistoryCsv();
    } catch (err) {
      alert('Could not export scan history: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#16845B]">
            Account Management
          </span>
          <h2 className="text-3xl font-black text-[#183B2B] tracking-tight mt-1">
            User Profile & Settings
          </h2>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EC] border-2 border-[#16845B] text-[#16845B] flex items-center justify-center font-black text-2xl mx-auto shadow-xs">
              {(user.full_name || user.email)[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#183B2B]">{user.full_name || 'Eco Citizen'}</h3>
              <p className="text-xs text-[#52705F]">{user.email}</p>
            </div>

            <div className="pt-2 border-t border-[#F2F9F3] flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#16845B]">
                <Shield className="w-3.5 h-3.5" />
                {user.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52705F]">Total Scans:</span>
              <span className="font-extrabold text-[#183B2B]">{user.total_scans || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52705F]">Eco-Points:</span>
              <span className="font-extrabold text-[#16845B]">+{user.eco_points || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52705F]">Active Streak:</span>
              <span className="font-extrabold text-[#183B2B]">{user.streak_days || 1} day(s)</span>
            </div>
          </div>

          {/* Data Export Box */}
          <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#183B2B]">
              <FileSpreadsheet className="w-4 h-4 text-[#16845B]" />
              Data Portability
            </div>
            <p className="text-[11px] text-[#52705F] leading-relaxed">
              Export your personal waste classification history into a structured CSV file for audit or research.
            </p>
            <button
              onClick={handleExportHistory}
              disabled={isExporting}
              className="w-full py-2 bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exporting CSV...' : 'Download Scan History (CSV)'}
            </button>
          </div>
        </div>

        {/* Password & Security Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D3EAD7] shadow-card space-y-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#16845B]" />
              <h3 className="text-lg font-bold text-[#183B2B]">Update Password</h3>
            </div>

            {passwordMsg && (
              <div className="p-3 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] text-xs font-semibold text-[#16845B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordErr && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordErr}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
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

              <div>
                <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-2.5 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Note */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#183B2B]">
              Privacy & Data Policy
            </h4>
            <p className="text-xs text-[#52705F] leading-relaxed">
              AI WasteWise stores image classifications strictly associated with your account for personal telemetry and audit history. Uploaded photos are processed securely and never shared or sold to commercial third parties. You may delete individual records from your Scan History at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
