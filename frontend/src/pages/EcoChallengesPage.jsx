import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Users,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGamificationData, fetchLeaderboard } from '../api/client';

export default function EcoChallengesPage({ onNavigate }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'leaderboard' | 'badges'

  useEffect(() => {
    async function loadData() {
      setLoading(false);
      try {
        const [cData, lData] = await Promise.all([
          fetchGamificationData().catch(() => []),
          fetchLeaderboard().catch(() => []),
        ]);
        setChallenges(cData);
        setLeaderboard(lData);
      } catch (err) {
        console.warn('Could not load eco data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const BADGES = [
    {
      code: 'FIRST_SCAN',
      title: 'First Step',
      desc: 'Completed your very first AI waste classification scan.',
      icon: '🌱',
      unlocked: (user?.total_scans ?? 0) >= 1,
    },
    {
      code: 'PLASTIC_PRO',
      title: 'Polymer Guardian',
      desc: 'Sorted 5 or more plastic items responsibly.',
      icon: '🧴',
      unlocked: (user?.total_scans ?? 0) >= 5,
    },
    {
      code: 'EWATSE_CHAMP',
      title: 'Circuit Savior',
      desc: 'Identified and safely handled obsolete electronic waste.',
      icon: '💻',
      unlocked: (user?.total_scans ?? 0) >= 10,
    },
    {
      code: 'CENTURY_CLUB',
      title: 'Eco Centurion',
      desc: 'Accumulated over 100 verified eco-points on WasteWise.',
      icon: '🌟',
      unlocked: (user?.eco_points ?? 0) >= 100,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EC] text-xs font-bold text-[#16845B]">
          <Trophy className="w-4 h-4" />
          Sustainability Gamification & Milestones
        </div>
        <h2 className="text-3xl font-black text-[#183B2B] tracking-tight">
          Eco-Challenges & Achievements
        </h2>
        <p className="text-xs sm:text-sm text-[#52705F]">
          Participate in weekly recycling goals, earn verified eco-points, unlock green badges, and inspire the community.
        </p>
      </div>

      {/* User Progress Banner */}
      {user ? (
        <div className="bg-[#16845B] bg-gradient-to-r from-[#16845B] via-[#147852] to-[#105d3f] rounded-3xl p-6 sm:p-8 text-white shadow-card max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              Your Current Standing
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
              {user.full_name || user.email}
            </h3>
            <p className="text-xs text-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Account Streak: <strong className="text-white font-extrabold">{user.streak_days || 1} Day(s) Active</strong>
            </p>
          </div>

          <div className="flex items-center gap-5 bg-black/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/25 shadow-inner">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-xs">{user.eco_points || 0}</div>
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Eco-Points</div>
            </div>
            <div className="w-px h-10 bg-white/25" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-xs">{user.total_scans || 0}</div>
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Total Scans</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card max-w-4xl mx-auto text-center space-y-3">
          <p className="text-xs text-[#52705F]">
            Sign in or register to claim eco-points, join weekly challenges, and earn badges!
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'challenges'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#52705F] border border-[#D3EAD7] hover:bg-[#EAF5EC]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Active Challenges
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'badges'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#52705F] border border-[#D3EAD7] hover:bg-[#EAF5EC]'
          }`}
        >
          <Award className="w-4 h-4" />
          Achievement Badges
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-[#16845B] text-white shadow-xs'
              : 'bg-[#FFFFFF] text-[#52705F] border border-[#D3EAD7] hover:bg-[#EAF5EC]'
          }`}
        >
          <Users className="w-4 h-4" />
          Community Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] p-8">
                <p className="text-xs text-[#52705F]">No active challenges at this moment.</p>
              </div>
            ) : (
              challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4 hover:border-[#16845B] transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#16845B] px-2 py-0.5 rounded-md bg-[#EAF5EC]">
                        {ch.target_category || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-[#16845B]">
                        <Sparkles className="w-3.5 h-3.5" /> +{ch.points_reward} Points
                      </span>
                    </div>

                    <h4 className="text-base font-black text-[#183B2B]">{ch.title}</h4>
                    <p className="text-xs text-[#52705F] leading-relaxed">{ch.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#F2F9F3] flex items-center justify-between text-xs text-[#52705F]">
                    <span>Target: {ch.target_count} action(s)</span>
                    <button
                      onClick={() => onNavigate('classify')}
                      className="text-xs font-bold text-[#16845B] hover:underline"
                    >
                      Start Scan →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGES.map((b) => (
              <div
                key={b.code}
                className={`p-6 rounded-3xl border shadow-card flex items-start gap-4 transition ${
                  b.unlocked
                    ? 'bg-[#FFFFFF] border-[#D3EAD7]'
                    : 'bg-[#F7FAF7] border-gray-200 opacity-60'
                }`}
              >
                <div className="text-4xl p-3 bg-[#EAF5EC] rounded-2xl shrink-0 shadow-xs">
                  {b.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#183B2B]">{b.title}</h4>
                    {b.unlocked ? (
                      <span className="text-[10px] font-extrabold text-[#16845B] bg-[#EAF5EC] px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#52705F]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-card overflow-hidden">
            <div className="p-5 border-b border-[#D3EAD7] bg-[#EAF5EC]/40 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#183B2B]">Eco Champions Ranking</h4>
              <span className="text-xs text-[#52705F]">Updated live</span>
            </div>

            <div className="divide-y divide-[#F2F9F3]">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#52705F]">
                  No leaderboard members recorded yet.
                </div>
              ) : (
                leaderboard.map((champ, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#F7FAF7] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          index === 0
                            ? 'bg-amber-400 text-white'
                            : index === 1
                            ? 'bg-slate-300 text-slate-700'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-[#EAF5EC] text-[#16845B]'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#183B2B]">{champ.name}</div>
                        <div className="text-[10px] text-[#52705F]">{champ.scans} recorded scans</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#16845B]">
                        {champ.points} Points
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
