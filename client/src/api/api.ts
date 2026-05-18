const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (options.body && typeof options.body === 'string') {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    // Melempar error agar bisa ditangkap oleh blok try-catch di UI
    throw new Error(data?.message || `HTTP Error ${response.status}`);
  }

  return data;
}

// ------------------------------------------------------------------
// 1. Auth API
// ------------------------------------------------------------------
export const authApi = {
  register: (data: Record<string, any>) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: Record<string, any>) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetchApi('/auth/me', {
      method: 'GET',
    }),

  updateMe: (data: Record<string, any>) =>
    fetchApi('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------------
// 2. Conversations API
// ------------------------------------------------------------------
export const conversationsApi = {
  getAll: (page = 1, limit = 20) =>
    fetchApi(`/conversations?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  create: (title?: string) =>
    fetchApi('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  getById: (id: string, page = 1, limit = 50) =>
    fetchApi(`/conversations/${id}?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  update: (id: string, title: string) =>
    fetchApi(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }),

  delete: (id: string) =>
    fetchApi(`/conversations/${id}`, {
      method: 'DELETE',
    }),
};

// ------------------------------------------------------------------
// 3. Messages API
// ------------------------------------------------------------------
export const messagesApi = {
  /**
   * Mengirim pesan ke percakapan tertentu.
   * Menggunakan FormData agar mendukung pengiriman file (PDF/Image) ke backend.
   */
  sendMessage: (conversationId: string, content: string, files?: FileList | File[]) => {
    const formData = new FormData();
    formData.append('content', content);

    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        formData.append('files', file); // Pastikan key 'files' sesuai dengan field multer di backend
      });
    }

    return fetchApi(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
    });
  },
};
