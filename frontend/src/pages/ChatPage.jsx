import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  sendChatMessage,
  fetchChatHistory,
  clearChatHistory,
  fetchChatStatus,
  fetchHistory,
} from '../api/client';

const SUGGESTED_QUESTIONS = [
  'How do I recycle plastic?',
  'What is biodegradable waste?',
  'How should I dispose of batteries?',
  'How does waste segregation work?',
  'How can I reduce household waste?',
];

export default function ChatPage({ onNavigate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [sessionId] = useState(() => {
    let s = localStorage.getItem('wastewise_chat_session');
    if (!s) {
      s = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('wastewise_chat_session', s);
    }
    return s;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat status and initial history
  useEffect(() => {
    async function initChat() {
      try {
        const [statusData, historyData, userScansData] = await Promise.all([
          fetchChatStatus().catch(() => null),
          fetchChatHistory(sessionId).catch(() => []),
          fetchHistory(1, 3).catch(() => ({ items: [] })),
        ]);

        if (statusData) setChatStatus(statusData);
        if (userScansData && userScansData.items) {
          setRecentScans(userScansData.items);
        }

        if (historyData && historyData.length > 0) {
          const formatted = historyData.map((item) => ({
            role: item.role,
            content: item.content,
            isLiveAi: item.is_live_ai,
            timestamp: new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          setMessages(formatted);
        } else {
          // Default Welcome Message
          setMessages([
            {
              role: 'assistant',
              content:
                "Hi! I'm your WasteWise AI Assistant. Ask me anything about waste classification, recycling, and proper disposal.",
              isLiveAi: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        console.warn('Chat initialization warning:', err);
      }
    }

    initChat();
  }, [sessionId, user]);

  const handleSendMessage = async (textToSend = null) => {
    const question = (textToSend || inputValue).trim();
    if (!question || loading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userTurn = {
      role: 'user',
      content: question,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userTurn]);
    setInputValue('');
    setLoading(true);

    try {
      const responseData = await sendChatMessage({
        message: question,
        sessionId: sessionId,
        recentScanId: selectedScanId,
      });

      const aiTurn = {
        role: 'assistant',
        content: responseData.response,
        isLiveAi: responseData.is_live_ai,
        provider: responseData.provider,
        offlineNotice: responseData.offline_notice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiTurn]);
      // Reset selected scan after asking about it
      setSelectedScanId(null);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm sorry, I encountered an issue connecting to the chat service. Please ensure the backend is running and try again.",
          isLiveAi: false,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    if (messages.length <= 1) return;
    if (window.confirm('Start a fresh conversation? This clears current chat history.')) {
      try {
        await clearChatHistory(sessionId);
      } catch (e) {
        console.warn('Could not clear remote history:', e);
      }
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi! I'm your WasteWise AI Assistant. Ask me anything about waste classification, recycling, and proper disposal.",
          isLiveAi: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setSelectedScanId(null);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-center text-[#16845B] shadow-xs shrink-0">
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#183B2B] tracking-tight">
                Chat with WasteWise AI
              </h1>
              {chatStatus?.provider_configured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]">
                  <Sparkles className="w-3 h-3 text-[#16845B]" />
                  Live {chatStatus.provider_name}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F9F3] text-[#52705F] border border-[#D3EAD7]">
                  <Info className="w-3 h-3 text-[#16845B]" />
                  Knowledge Base Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[#52705F] mt-0.5">
              Ask questions on waste segregation, recycling rules, composting, and local disposal.
            </p>
          </div>
        </div>

        <button
          onClick={handleNewConversation}
          className="px-4 py-2 rounded-xl border border-[#D3EAD7] bg-[#FFFFFF] hover:bg-[#EAF5EC] text-[#183B2B] font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#16845B]" />
          New Conversation
        </button>
      </div>

      {/* Configuration Status Banner (if offline mode, clearly labeled and instructive) */}
      {chatStatus && !chatStatus.provider_configured && (
        <div className="bg-[#EAF5EC]/60 border border-[#D3EAD7] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#183B2B]">
          <Info className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#16845B]">Offline Knowledge Base Active:</strong> Answering with verified WasteWise recycling protocols. To connect a live Gemini generative model, obtain a free API key at{' '}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#16845B] font-bold underline"
            >
              Google AI Studio
            </a>{' '}
            and add <code className="bg-[#FFFFFF] px-1.5 py-0.5 rounded font-mono border border-[#D3EAD7]">GEMINI_API_KEY=your_key</code> in your <code className="font-mono">backend/.env</code>.
          </div>
        </div>
      )}

      {/* Main Chat Box Container */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] overflow-hidden flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-[#16845B] text-white'
                      : 'bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[82%] sm:max-w-[75%] space-y-1`}>
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#16845B] text-white rounded-tr-none shadow-xs'
                        : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                        : 'bg-[#F7FAF7] text-[#183B2B] border border-[#D3EAD7] rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Render message with line breaks and markdown boldness */}
                    <div className="whitespace-pre-wrap space-y-1">
                      {msg.content}
                    </div>

                    {/* Offline notice tag if provided */}
                    {msg.offlineNotice && (
                      <div className="mt-2 pt-2 border-t border-[#D3EAD7]/50 text-[10px] text-[#52705F] italic">
                        {msg.offlineNotice}
                      </div>
                    )}
                  </div>

                  {/* Bubble Metadata & Actions */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-[#52705F] px-1 ${
                      isUser ? 'justify-end' : 'justify-between'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#52705F]" />
                      {msg.timestamp}
                    </span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {msg.isLiveAi ? (
                          <span className="text-[#16845B] font-bold">✨ AI Generated</span>
                        ) : (
                          <span className="text-[#52705F]">📖 Knowledge Base</span>
                        )}
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="hover:text-[#183B2B] transition p-0.5"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-[#16845B]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-center text-[#16845B] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F7FAF7] border border-[#D3EAD7] rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Chips & Recent Scan Context Bar */}
        <div className="p-3 bg-[#F7FAF7] border-t border-[#D3EAD7] space-y-2">
          {/* Recent scan attachment option if user has recent scans */}
          {recentScans.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[#52705F] flex items-center gap-1 shrink-0">
                <Layers className="w-3.5 h-3.5 text-[#16845B]" />
                Ask about recent scan:
              </span>
              {recentScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setSelectedScanId(scan.id);
                    handleSendMessage(
                      `Can you explain my recent ${scan.predicted_class} scan and how to properly dispose of it?`
                    );
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition shrink-0 border ${
                    selectedScanId === scan.id
                      ? 'bg-[#16845B] text-white border-[#16845B]'
                      : 'bg-[#FFFFFF] text-[#183B2B] border-[#D3EAD7] hover:bg-[#EAF5EC]'
                  }`}
                >
                  {scan.predicted_class} ({Math.round(scan.confidence * 100)}%)
                </button>
              ))}
            </div>
          )}

          {/* Quick Question Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#52705F] shrink-0 mr-1">
              Suggestions:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFFFF] border border-[#D3EAD7] text-[#183B2B] hover:bg-[#EAF5EC] hover:text-[#16845B] transition shadow-xs whitespace-nowrap disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Send Form */}
        <div className="p-4 bg-[#FFFFFF] border-t border-[#D3EAD7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask a question about recycling, composting, battery disposal... (Press Enter to send)"
              className="flex-1 px-4 py-3 rounded-2xl border border-[#D3EAD7] bg-[#F7FAF7] text-xs sm:text-sm text-[#183B2B] placeholder:text-[#52705F]/60 focus:outline-none focus:ring-2 focus:ring-[#16845B] transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-2xl font-bold shadow-xs hover:shadow-md transition flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#16845B]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
