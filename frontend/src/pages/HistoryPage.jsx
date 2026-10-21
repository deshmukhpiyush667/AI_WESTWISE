import React, { useState, useEffect } from 'react';
import {
  fetchHistory,
  deleteHistoryItem,
  exportHistoryCsv,
  getImageUrl,
} from '../api/client';
import {
  History,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Download,
  Search,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

const FILTER_CATEGORIES = ['All', 'Organic', 'Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste'];

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uncertainOnly, setUncertainOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(page, 9, selectedCategory, uncertainOnly ? true : null);
      setHistory(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not load classification history. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, selectedCategory, uncertainOnly]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classification record?')) return;
    try {
      await deleteHistoryItem(id);
      loadHistory();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportHistoryCsv();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Local filtering by search query if user searches by name/class
  const displayItems = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesClass = item.predicted_class?.toLowerCase().includes(query);
    const matchesName = item.original_filename?.toLowerCase().includes(query);
    return matchesClass || matchesName;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7] text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#183B2B] tracking-tight">
            Prediction History
          </h1>
          <p className="text-xs sm:text-sm text-[#52705F]">
            Total {total} waste items classified and stored in database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting || total === 0}
            className="px-4 py-2.5 rounded-2xl bg-[#16845B] hover:bg-[#126e4b] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-3xl border border-[#D3EAD7] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#52705F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category or filename..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-xs text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#52705F] shrink-0">
            <input
              type="checkbox"
              checked={uncertainOnly}
              onChange={(e) => {
                setUncertainOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded text-[#16845B] focus:ring-[#16845B] w-4 h-4 accent-[#16845B]"
            />
            <span>Uncertain Predictions (&lt;60%) Only</span>
          </label>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F2F9F3] scrollbar-none">
          <Filter className="w-4 h-4 text-[#52705F] shrink-0 ml-1" />
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#16845B] text-white shadow-xs'
                  : 'bg-[#F7FAF7] text-[#52705F] hover:bg-[#EAF5EC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#D3EAD7] animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-[#EAF5EC] rounded-2xl"></div>
              <div className="h-4 bg-[#EAF5EC] rounded-full w-2/3"></div>
              <div className="h-3 bg-[#F7FAF7] rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayItems.length === 0 && (
        <div className="bg-[#FFFFFF] rounded-3xl p-12 border border-[#D3EAD7] text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#183B2B]">No Classifications Found</h3>
          <p className="text-xs sm:text-sm text-[#52705F] mt-1">
            {selectedCategory === 'All'
              ? 'No waste images have been classified yet. Upload or snap a picture in the Classify tab.'
              : `No classifications found under category "${selectedCategory}".`}
          </p>
        </div>
      )}

      {/* History Grid */}
      {!isLoading && displayItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const colorTheme = CATEGORY_COLORS[item.predicted_class] || CATEGORY_COLORS['Uncertain'];
            const confidencePct = Math.round(item.confidence * 100);
            const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex flex-col justify-between hover:border-[#16845B]/60 transition-all duration-200 group"
              >
                <div>
                  {/* Image thumbnail */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7FAF7] border border-[#D3EAD7] mb-4">
                    <img
                      src={getImageUrl(item.image_filename)}
                      alt={item.predicted_class}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs"
                        style={{
                          backgroundColor: colorTheme?.bg || '#EAF5EC',
                          color: colorTheme?.text || '#16845B',
                          borderColor: colorTheme?.border || '#D3EAD7',
                        }}
                      >
                        {item.predicted_class}
                      </span>
                    </div>

                    {item.is_uncertain && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          Low Confidence
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-extrabold text-[#183B2B]">
                      {item.predicted_class}
                    </span>
                    <span className="text-xs font-bold text-[#16845B]">
                      {confidencePct}% Confident
                    </span>
                  </div>

                  {/* Bin info */}
                  {item.disposal_guidance && (
                    <div className="text-xs font-semibold text-[#52705F] mb-3">
                      Target: <span className="text-[#183B2B]">{item.disposal_guidance.bin_color} Bin</span>
                    </div>
                  )}
                </div>

                {/* Footer with date and delete */}
                <div className="pt-3 border-t border-[#F2F9F3] flex items-center justify-between text-xs text-[#52705F]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#16845B]" />
                    <span>{formattedDate}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-[#D3EAD7] bg-[#FFFFFF] text-[#183B2B] hover:bg-[#EAF5EC] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-[#183B2B]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl border border-[#D3EAD7] bg-[#FFFFFF] text-[#183B2B] hover:bg-[#EAF5EC] disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
