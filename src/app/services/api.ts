/**
 * EquipDriver API Service Layer
 * Centralized HTTP client for all backend API calls.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Token management ──────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) localStorage.setItem('ed_token', token);
    else localStorage.removeItem('ed_token');
}

export function getAccessToken(): string | null {
    if (!accessToken) accessToken = localStorage.getItem('ed_token');
    return accessToken;
}

export function clearAuth() {
    accessToken = null;
    localStorage.removeItem('ed_token');
    localStorage.removeItem('ed_refresh');
    localStorage.removeItem('ed_user');
}

// ── Generic fetch wrapper ─────────────────────────────

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Don't set Content-Type for FormData (browser will set multipart boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const json = await res.json().catch(() => ({
            success: false,
            message: res.status === 504 || res.status === 502
                ? 'Backend server is unreachable. Please ensure the backend is running on port 5000.'
                : 'Invalid server response (not JSON)',
        }));

        if (!res.ok) {
            // If 401, try refreshing
            if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry the original request
                    headers['Authorization'] = `Bearer ${getAccessToken()}`;
                    const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
                    return retryRes.json();
                } else {
                    clearAuth();
                }
            }
            return { success: false, message: json.message || `Error ${res.status}`, ...json };
        }

        return json;
    } catch (error: any) {
        return { success: false, message: error.message || 'Network error' };
    }
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('ed_refresh');
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        const json = await res.json();
        if (json.success && json.data?.accessToken) {
            setAccessToken(json.data.accessToken);
            return true;
        }
    } catch { }
    return false;
}

// ── Auth API ──────────────────────────────────────────

export const authApi = {
    registerDriver(data: {
        email: string;
        password: string;
        full_name: string;
        phone: string;
        location: string;
        state: string;
        city: string;
        license_number: string;
        machine_type: string;
        experience_years: number;
    }) {
        return request('/auth/register/driver', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    registerCompany(data: {
        email: string;
        password: string;
        company_name: string;
        contact_person: string;
        phone: string;
        location: string;
        state: string;
        city: string;
        gst_number?: string;
    }) {
        return request('/auth/register/company', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login(email: string, password: string) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    logout() {
        const refreshToken = localStorage.getItem('ed_refresh');
        clearAuth();
        return request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    },

    getMe() {
        return request('/auth/me');
    },
};

// ── Drivers API ───────────────────────────────────────

export const driversApi = {
    getAll(params?: {
        page?: number;
        limit?: number;
        status?: string;
        machine_type?: string;
        city?: string;
        state?: string;
        search?: string;
    }) {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
            });
        }
        return request(`/drivers?${qs.toString()}`);
    },

    getById(id: string) {
        return request(`/drivers/${id}`);
    },

    getMyProfile() {
        return request('/drivers/me/profile');
    },

    updateProfile(data: Record<string, any>) {
        return request('/drivers/me/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    getMyStats() {
        return request('/drivers/me/stats');
    },

    verify(id: string, status: 'verified' | 'rejected', rejection_reason?: string) {
        return request(`/drivers/${id}/verify`, {
            method: 'PUT',
            body: JSON.stringify({ status, rejection_reason }),
        });
    },
};

// ── Jobs API ──────────────────────────────────────────

export const jobsApi = {
    getAll(params?: {
        page?: number;
        limit?: number;
        status?: string;
        machine_type?: string;
        state?: string;
        search?: string;
    }) {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
            });
        }
        return request(`/jobs?${qs.toString()}`);
    },

    getById(id: string) {
        return request(`/jobs/${id}`);
    },

    create(data: {
        machine_type: string;
        location: string;
        state: string;
        city: string;
        duration: string;
        budget_min: number;
        budget_max: number;
        budget_display: string;
        description: string;
        title?: string;
        accommodation_provided?: boolean;
        food_provided?: boolean;
        night_shifts?: boolean;
        transport_provided?: boolean;
        start_date?: string;
    }) {
        return request('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    apply(jobId: string, cover_note?: string) {
        return request(`/jobs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify({ cover_note }),
        });
    },

    assign(jobId: string, driverId: string) {
        return request(`/jobs/${jobId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ driver_id: driverId }),
        });
    },

    getCompanyJobs() {
        return request('/jobs/company/mine');
    },
};

// ── Payments API ──────────────────────────────────────

export const paymentsApi = {
    createOrder(data: {
        job_id: string;
        driver_id: string;
        amount: number;
        for_month: string;
        description?: string;
    }) {
        return request('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    verifyPayment(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        payment_id: string;
    }) {
        return request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getAll(params?: { page?: number; limit?: number; status?: string }) {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
            });
        }
        return request(`/payments?${qs.toString()}`);
    },

    getMyPayments() {
        return request('/payments/my-payments');
    },
};

// ── Notifications API ─────────────────────────────────

export const notificationsApi = {
    getAll() {
        return request('/notifications');
    },

    markAsRead(id: string) {
        return request(`/notifications/${id}/read`, { method: 'PUT' });
    },

    markAllRead() {
        return request('/notifications/read-all', { method: 'PUT' });
    },

    send(data: { user_id: string; type: string; title: string; message: string }) {
        return request('/notifications/send', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// ── Admin API ─────────────────────────────────────────

export const adminApi = {
    getStats() {
        return request('/admin/stats');
    },

    getUsers(params?: { page?: number; limit?: number; role?: string }) {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
            });
        }
        return request(`/admin/users?${qs.toString()}`);
    },

    updateUserStatus(id: string, is_active: boolean) {
        return request(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ is_active }),
        });
    },

    approveJob(id: string) {
        return request(`/admin/jobs/${id}/approve`, { method: 'PUT' });
    },

    getAnalytics() {
        return request('/admin/analytics');
    },
};
