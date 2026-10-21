import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPage from '../pages/ChatPage';
import { AuthProvider } from '../context/AuthContext';

// Mock API client
vi.mock('../api/client', () => ({
  fetchChatStatus: vi.fn().mockResolvedValue({
    provider_configured: false,
    provider_name: 'Offline Knowledge Base',
    model_name: 'wastewise-domain-expert-v1',
    offline_mode: true,
    setup_help: 'Add GEMINI_API_KEY to backend/.env',
  }),
  fetchChatHistory: vi.fn().mockResolvedValue([]),
  fetchHistory: vi.fn().mockResolvedValue({ items: [] }),
  sendChatMessage: vi.fn().mockResolvedValue({
    response: 'Plastic is recyclable if clean and dry (SPI #1, #2, #5).',
    is_live_ai: false,
    provider: 'Offline Knowledge Base',
    offline_notice: 'Operating in Offline Knowledge Base mode.',
    session_id: 'test-session',
  }),
  clearChatHistory: vi.fn().mockResolvedValue({ success: true }),
}));

describe('ChatPage Component', () => {
  it('renders chat header, welcome message, and suggested chips', async () => {
    render(
      <AuthProvider>
        <ChatPage onNavigate={() => {}} />
      </AuthProvider>
    );

    expect(screen.getByText('Chat with WasteWise AI')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm your WasteWise AI Assistant/i)).toBeInTheDocument();
    });

    expect(screen.getByText('How do I recycle plastic?')).toBeInTheDocument();
    expect(screen.getByText('What is biodegradable waste?')).toBeInTheDocument();
    expect(screen.getByText('How should I dispose of batteries?')).toBeInTheDocument();
    expect(screen.getByText('How does waste segregation work?')).toBeInTheDocument();
    expect(screen.getByText('How can I reduce household waste?')).toBeInTheDocument();
  });

  it('sends question when clicking a suggested chip', async () => {
    render(
      <AuthProvider>
        <ChatPage onNavigate={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('How do I recycle plastic?')).toBeInTheDocument();
    });

    const chip = screen.getByText('How do I recycle plastic?');
    fireEvent.click(chip);

    await waitFor(() => {
      expect(screen.getByText('Plastic is recyclable if clean and dry (SPI #1, #2, #5).')).toBeInTheDocument();
    });
  });
});
