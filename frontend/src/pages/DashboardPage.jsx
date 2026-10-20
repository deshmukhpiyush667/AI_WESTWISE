import React, { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../api/client';
import { BarChart3, TrendingUp, Recycle, AlertOctagon, CheckCircle2, Layers, RefreshCw, Sparkles, PieChart } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Could not retrieve statistics. Verify the backend service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const total = stats?.total_classifications || 0;
  const recyclablePercent = total > 0 ? Math.round(((stats?.total_recyclable || 0) / total) * 100) : 0;
  const avgConfidencePercent = Math.round((stats?.average_confidence || 0) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7] text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Live Database Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#183B2B] tracking-tight">
            Classification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#52705F]">
            Real-time segregation metrics aggregated from database records
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="p-3 rounded-2xl bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Classifications */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex items-start justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#52705F]">
              Total Classified
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#183B2B] mt-2">
              {total}
            </div>
            <div className="text-[11px] font-semibold text-[#16845B] mt-1">
              Active image scans
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Recyclables Diverted */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex items-start justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#52705F]">
              Recyclable Items
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#16845B] mt-2">
              {stats?.total_recyclable || 0}
            </div>
            <div className="text-[11px] font-semibold text-[#16845B] mt-1">
              {recyclablePercent}% of total waste
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
            <Recycle className="w-6 h-6" />
          </div>
        </div>

        {/* Hazardous Segregated */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex items-start justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#52705F]">
              Hazardous / E-Waste
            </span>
            <div className="text-3xl sm:text-4xl font-black text-red-600 mt-2">
              {stats?.total_hazardous || 0}
            </div>
            <div className="text-[11px] font-semibold text-red-600 mt-1">
              Safely flagged for treatment
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Average AI Confidence */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex items-start justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#52705F]">
              Avg Model Confidence
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#183B2B] mt-2">
              {avgConfidencePercent}%
            </div>
            <div className="text-[11px] font-semibold text-[#16845B] mt-1">
              MobileNetV3 accuracy rating
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Breakdown */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#183B2B] tracking-tight">
                Category Distribution
              </h3>
              <p className="text-xs text-[#52705F]">
                Proportion of waste types scanned
              </p>
            </div>
            <PieChart className="w-5 h-5 text-[#16845B]" />
          </div>

          {stats?.category_distribution && stats.category_distribution.length > 0 ? (
            <div className="space-y-4">
              {stats.category_distribution.map((cat) => {
                const colorTheme = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Uncertain'];
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-[#183B2B] flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.bin_hex }}
                        />
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="text-[#52705F]">{cat.count} items</span>
                        <span className="text-[#183B2B] font-extrabold">{cat.percentage}%</span>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#EAF5EC] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(cat.percentage, 2)}%`,
                          backgroundColor: cat.bin_hex || '#16845B',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#52705F]">
              No distribution data available yet. Start classifying items to populate real stats.
            </div>
          )}
        </div>

        {/* 7-Day Activity Trend */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#183B2B] tracking-tight">
                7-Day Activity Trend
              </h3>
              <p className="text-xs text-[#52705F]">
                Daily classification volume
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#16845B]" />
          </div>

          {stats?.recent_activity_trend && stats.recent_activity_trend.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-48 pt-6 pb-2 border-b border-[#D3EAD7]">
              {stats.recent_activity_trend.map((day) => {
                const maxCount = Math.max(
                  ...stats.recent_activity_trend.map((d) => d.count),
                  1
                );
                const heightPercent = Math.round((day.count / maxCount) * 100);
                const displayDate = day.date.slice(5); // MM-DD

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#183B2B] opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.count}
                    </span>
                    <div
                      className="w-full max-w-[36px] rounded-t-xl bg-[#EAF5EC] border border-[#D3EAD7] group-hover:bg-[#16845B] transition-colors relative"
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    />
                    <span className="text-[10px] font-medium text-[#52705F] truncate">
                      {displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#52705F]">
              No activity recorded in the past 7 days.
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-between text-xs text-[#183B2B] font-semibold">
            <span className="flex items-center gap-1.5 text-[#16845B]">
              <Sparkles className="w-4 h-4" />
              Automated Segregation Impact
            </span>
            <span>Real-Time Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
