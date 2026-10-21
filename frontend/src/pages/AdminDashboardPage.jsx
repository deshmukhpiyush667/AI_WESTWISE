import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  RefreshCw,
  Eye,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminFeedback,
  resolveAdminFeedback,
  fetchAdminTelemetry,
} from '../api/client';

export default function AdminDashboardPage({ onNavigate }) {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [feedbackQueue, setFeedbackQueue] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState('telemetry'); // 'telemetry' | 'feedback' | 'users'
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, feedbackData, telemetryData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAdminUsers().catch(() => []),
        fetchAdminFeedback('pending').catch(() => []),
        fetchAdminTelemetry().catch(() => null),
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setFeedbackQueue(feedbackData);
      setTelemetry(telemetryData);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 text-center bg-[#FFFFFF] p-8 rounded-3xl border border-red-200 shadow-card space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-xl font-black text-[#183B2B]">Access Denied</h3>
        <p className="text-xs text-[#52705F]">
          You need administrator privileges to view this control panel.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 bg-[#16845B] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleResolveFeedback = async (id) => {
    setResolvingId(id);
    try {
      await resolveAdminFeedback(id, resolutionNote || 'Verified and archived by administrator');
      setFeedbackQueue((prev) => prev.filter((item) => item.id !== id));
      setResolutionNote('');
      if (stats) {
        setStats({ ...stats, pending_feedback: Math.max(0, stats.pending_feedback - 1) });
      }
    } catch (err) {
      alert('Failed to resolve feedback: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-[#16845B] mb-1">
            <Cpu className="w-4 h-4" />
            Administrator Control Plane
          </div>
          <h2 className="text-3xl font-black text-[#183B2B] tracking-tight">
            System & Model Governance
          </h2>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#D3EAD7] text-[#183B2B] hover:bg-[#EAF5EC] transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#52705F]">
            Total Users
          </span>
          <div className="text-2xl font-black text-[#183B2B] mt-1">{stats?.total_users ?? '—'}</div>
          <div className="text-[10px] text-[#16845B] mt-1">Platform-wide registrations</div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#52705F]">
            Total Inferences
          </span>
          <div className="text-2xl font-black text-[#183B2B] mt-1">{stats?.total_scans ?? '—'}</div>
          <div className="text-[10px] text-[#16845B] mt-1">Classifications processed</div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#52705F]">
            Test-Set Accuracy
          </span>
          <div className="text-2xl font-black text-[#16845B] mt-1">
            {stats?.test_set_accuracy ? `${(stats.test_set_accuracy * 100).toFixed(2)}%` : '90.65%'}
          </div>
          <div className="text-[10px] text-[#52705F] mt-1">Held-out test split (1,080 imgs)</div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D3EAD7] shadow-card">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#52705F]">
            Feedback Triage
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {feedbackQueue.length}
          </div>
          <div className="text-[10px] text-[#52705F] mt-1">Pending user correction reports</div>
        </div>
      </div>

      {/* Scientific Accuracy Disclaimer Banner */}
      <div className="bg-[#EAF5EC] p-4 rounded-2xl border border-[#D3EAD7] text-xs text-[#183B2B] leading-relaxed flex items-start gap-3">
        <Activity className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold">Scientific Methodology Notice:</span> Confidence scores reflect the neural network's softmax activation on an individual image. Genuine model performance is evaluated strictly on held-out test data (<strong>90.65% Test Accuracy, 0.2868 Test Loss</strong> on 1,080 unseen MWCD images). Unverified user reports are never used to automatically retrain weights.
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D3EAD7] pb-3">
        <button
          onClick={() => setActiveAdminTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeAdminTab === 'telemetry'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'text-[#52705F] hover:bg-[#EAF5EC]'
          }`}
        >
          Model Telemetry & Benchmark
        </button>

        <button
          onClick={() => setActiveAdminTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeAdminTab === 'feedback'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'text-[#52705F] hover:bg-[#EAF5EC]'
          }`}
        >
          Feedback Review Queue
          {feedbackQueue.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {feedbackQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeAdminTab === 'users'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'text-[#52705F] hover:bg-[#EAF5EC]'
          }`}
        >
          User Registry ({usersList.length})
        </button>
      </div>

      {/* Admin Tab Content */}
      {activeAdminTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4">
            <h4 className="text-sm font-black text-[#183B2B] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#16845B]" />
              Model Architecture & Training Run
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Active Model Version:</span>
                <span className="font-bold text-[#183B2B]">{stats?.model_version || 'mobilenetv3-small-finetuned-v1'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Base Backbone:</span>
                <span className="font-bold text-[#183B2B]">MobileNetV3Small (ImageNet pre-trained)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Target Classes:</span>
                <span className="font-bold text-[#183B2B]">6 (Organic, Plastic, Paper, Metal, Glass, E-Waste)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Input Dimension:</span>
                <span className="font-bold text-[#183B2B]">224 × 224 × 3 RGB ([0, 255] float32)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Average Inference Latency:</span>
                <span className="font-bold text-[#16845B]">28.4 ms (CPU)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4">
            <h4 className="text-sm font-black text-[#183B2B] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#16845B]" />
              Held-Out Test Set Metrics (1,080 Images)
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Test Top-1 Accuracy:</span>
                <span className="font-extrabold text-[#16845B]">90.65%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Test Cross-Entropy Loss:</span>
                <span className="font-extrabold text-[#183B2B]">0.2868</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Validation Accuracy (Epoch 10):</span>
                <span className="font-bold text-[#183B2B]">89.17%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Dataset Stratification:</span>
                <span className="font-bold text-[#183B2B]">70% Train (5,040) / 15% Val (1,080) / 15% Test (1,080)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2F9F3]">
                <span className="text-[#52705F]">Leakage Mitigation:</span>
                <span className="font-bold text-[#16845B]">2,488 byte-exact duplicate copies pruned</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'feedback' && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-card overflow-hidden">
          <div className="p-5 border-b border-[#D3EAD7] bg-[#EAF5EC]/40">
            <h4 className="text-sm font-bold text-[#183B2B]">
              User Misclassification Reports (Safe Triage Queue)
            </h4>
            <p className="text-xs text-[#52705F] mt-0.5">
              Review flagged predictions without risking model dataset contamination.
            </p>
          </div>

          <div className="divide-y divide-[#F2F9F3]">
            {feedbackQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#52705F]">
                No pending feedback reports in the queue. All clear!
              </div>
            ) : (
              feedbackQueue.map((item) => (
                <div key={item.id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        Predicted: {item.predicted_category || '—'}
                      </span>
                      <span>→</span>
                      <span className="text-xs font-bold text-[#16845B] bg-[#EAF5EC] px-2 py-0.5 rounded-md border border-[#D3EAD7]">
                        User Suggested: {item.actual_category}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#52705F]">
                      Reported {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#183B2B] bg-[#F7FAF7] p-2.5 rounded-xl border border-[#D3EAD7]">
                      <strong>User Notes:</strong> {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveFeedback(item.id)}
                      disabled={resolvingId === item.id}
                      className="px-4 py-1.5 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 disabled:opacity-50"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      {resolvingId === item.id ? 'Resolving...' : 'Review & Mark Resolved'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-card overflow-hidden">
          <div className="p-5 border-b border-[#D3EAD7] bg-[#EAF5EC]/40">
            <h4 className="text-sm font-bold text-[#183B2B]">Registered Users ({usersList.length})</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-[#52705F] border-b border-[#D3EAD7]">
                <tr>
                  <th className="p-3.5 font-bold">User</th>
                  <th className="p-3.5 font-bold">Role</th>
                  <th className="p-3.5 font-bold">Eco-Points</th>
                  <th className="p-3.5 font-bold">Total Scans</th>
                  <th className="p-3.5 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F9F3]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7FAF7]/60">
                    <td className="p-3.5">
                      <div className="font-bold text-[#183B2B]">{u.full_name || '—'}</div>
                      <div className="text-[11px] text-[#52705F]">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-[#EAF5EC] text-[#16845B]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#16845B]">+{u.eco_points}</td>
                    <td className="p-3.5 font-semibold text-[#183B2B]">{u.total_scans}</td>
                    <td className="p-3.5 text-[#52705F]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
