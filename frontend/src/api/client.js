/**
 * API client configuration for AI WasteWise Backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export async function classifyWasteImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/classify`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const errorMsg = data?.error?.message || data?.detail || 'Failed to classify image';
    throw new Error(errorMsg);
  }
  return data;
}

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

  const res = await fetch(`${API_BASE_URL}/api/v1/history?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
  return res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete record ${id}`);
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/api/v1/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export function getImageUrl(filename) {
  if (!filename) return null;
  return `${API_BASE_URL}/uploads/${filename}`;
}
