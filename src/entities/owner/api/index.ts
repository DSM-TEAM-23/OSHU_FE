import type {
  CreateStoreRequest,
  CrowdStatusRequest,
  CrowdStatusResponse,
  LoginRequest,
  MessageResponse,
  OwnerStore,
  PromotionDetail,
  PromotionRequest,
  SignUpRequest,
  StoreDetail,
  TimeSale,
  TimeSaleRequest,
  TokenResponse,
  UpdateStoreRequest,
} from '../types';

const DEFAULT_API_BASE_URL = '/api';

const normalizeBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/$/, '');
  if (!trimmedBaseUrl) return DEFAULT_API_BASE_URL;
  if (/^https?:\/\//.test(trimmedBaseUrl)) return trimmedBaseUrl;
  if (trimmedBaseUrl.startsWith('/')) return trimmedBaseUrl;
  return `http://${trimmedBaseUrl}`;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_OSHU_API_BASE_URL ?? DEFAULT_API_BASE_URL);

async function request<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText ? `API request failed: ${response.status} ${errorText}` : `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export const ownerApi = {
  signUp(body: SignUpRequest) {
    return request<MessageResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  login(body: LoginRequest) {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getMyStores(accessToken: string) {
    return request<OwnerStore[]>('/owner/stores', {
      headers: authHeaders(accessToken),
    });
  },

  createStore(accessToken: string, body: CreateStoreRequest) {
    return request<StoreDetail>('/owner/stores', {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  getMyStore(accessToken: string, storeId: number) {
    return request<StoreDetail>(`/owner/stores/${storeId}`, {
      headers: authHeaders(accessToken),
    });
  },

  updateStore(accessToken: string, storeId: number, body: UpdateStoreRequest) {
    return request<StoreDetail>(`/owner/stores/${storeId}`, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  updateCrowdStatus(accessToken: string, storeId: number, body: CrowdStatusRequest) {
    return request<CrowdStatusResponse>(`/owner/stores/${storeId}/crowd-status`, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  createPromotion(accessToken: string, storeId: number, body: PromotionRequest) {
    return request<PromotionDetail>(`/owner/stores/${storeId}/promotions`, {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  updatePromotion(accessToken: string, promotionId: number, body: PromotionRequest) {
    return request<PromotionDetail>(`/owner/promotions/${promotionId}`, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  deletePromotion(accessToken: string, promotionId: number) {
    return request<void>(`/owner/promotions/${promotionId}`, {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    });
  },

  createTimeSale(accessToken: string, storeId: number, body: TimeSaleRequest) {
    return request<TimeSale>(`/owner/stores/${storeId}/time-sales`, {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  updateTimeSale(accessToken: string, timeSaleId: number, body: TimeSaleRequest) {
    return request<TimeSale>(`/owner/time-sales/${timeSaleId}`, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  closeTimeSale(accessToken: string, timeSaleId: number) {
    return request<TimeSale>(`/owner/time-sales/${timeSaleId}/close`, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
    });
  },
};
