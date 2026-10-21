/**
 * API client configuration for AI WasteWise Backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders(token = null) {
  const activeToken = token || localStorage.getItem('wastewise_token');
  const headers = {};
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

// System Health & Category metadata
export async function checkHealth() {
  const res = await fetch(`${API_BASE_URL}/api/v1/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  return res.json();
}

// Authentication APIs
export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.detail || 'Login failed';
    throw new Error(msg);
  }
  return data;
}

export async function registerApi(email, password, fullName) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.detail || 'Registration failed';
    throw new Error(msg);
  }
  return data;
}

export async function getMeApi(token) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Session expired or invalid');
  return res.json();
}

export async function changePasswordApi(token, oldPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || 'Failed to update password');
  }
  return data;
}

export async function forgotPasswordApi(email) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPasswordApi(token, newPassword) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || 'Failed to reset password');
  }
  return data;
}

// Waste Classification
export async function classifyWasteImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/classify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const errorMsg = data?.error?.message || data?.detail || 'Failed to classify image';
    throw new Error(errorMsg);
  }
  return data;
}

// History & Export
export async function fetchHistory(page = 1, pageSize = 10, category = null, uncertainOnly = null) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (category && category !== 'All') {
    params.append('category', category);
  }
  if (uncertainOnly !== null) {
    params.append('uncertain_only', uncertainOnly.toString());
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
  return res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete record ${id}`);
  return res.json();
}

export async function exportHistoryCsv() {
  const res = await fetch(`${API_BASE_URL}/api/v1/history/export`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to export history CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wastewise_scan_history_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Personalized User Dashboard Stats
export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/api/v1/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

// User Feedback (Misclassification triage queue)
export async function submitClassificationFeedback(feedbackData) {
  const res = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(feedbackData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || 'Failed to submit feedback');
  }
  return data;
}

// Recycling Centers Locator
export async function fetchRecyclingCenters({ material = null, lat = null, lng = null } = {}) {
  const params = new URLSearchParams();
  if (material && material !== 'All') params.append('material', material);
  if (lat !== null && lng !== null) {
    params.append('lat', lat.toString());
    params.append('lng', lng.toString());
  }
  const res = await fetch(`${API_BASE_URL}/api/v1/centers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recycling centers');
  return res.json();
}

// Gamification: Challenges, Badges & Leaderboard
export async function fetchGamificationData() {
  const res = await fetch(`${API_BASE_URL}/api/v1/eco/challenges`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch challenges');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE_URL}/api/v1/eco/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

// Admin Oversight Endpoints
export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Admin stats unauthorized or unavailable');
  return res.json();
}

export async function fetchAdminUsers() {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Admin user list unauthorized');
  return res.json();
}

export async function fetchAdminFeedback(status = 'pending') {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/feedback?status=${status}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Admin feedback queue unauthorized');
  return res.json();
}

export async function resolveAdminFeedback(feedbackId, resolutionNotes = '') {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/feedback/${feedbackId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ resolution_notes: resolutionNotes }),
  });
  if (!res.ok) throw new Error('Failed to resolve feedback report');
  return res.json();
}

export async function fetchAdminTelemetry() {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/telemetry`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Admin telemetry unavailable');
  return res.json();
}

// WasteWise Conversational AI Chat APIs
export async function sendChatMessage({ message, sessionId = null, recentScanId = null }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      recent_scan_id: recentScanId,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || 'Failed to send chat message');
  }
  return data;
}

export async function fetchChatHistory(sessionId = null) {
  const params = new URLSearchParams();
  if (sessionId) params.append('session_id', sessionId);
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve chat history');
  return res.json();
}

export async function clearChatHistory(sessionId = null) {
  const params = new URLSearchParams();
  if (sessionId) params.append('session_id', sessionId);
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/history?${params.toString()}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return res.json();
}

export async function fetchChatStatus() {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/status`);
  if (!res.ok) throw new Error('Failed to fetch chat provider status');
  return res.json();
}

export function getImageUrl(filename) {
  if (!filename) return null;
  return `${API_BASE_URL}/uploads/${filename}`;
}
