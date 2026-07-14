import type {
  CreateStoreRequest,
  CrowdStatusRequest,
  CrowdStatusResponse,
  DailyOrderStatisticsRequest,
  DiscountRecommendationResponse,
  Inquiry,
  LoginRequest,
  MessageResponse,
  ImageUploadResponse,
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

type RawTokenResponse = TokenResponse & {
  access_token?: string;
  token?: string;
  type?: string;
};

const normalizeBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/$/, '');
  if (!trimmedBaseUrl) return DEFAULT_API_BASE_URL;
  if (/^https?:\/\//.test(trimmedBaseUrl)) return trimmedBaseUrl;
  if (trimmedBaseUrl.startsWith('/')) return trimmedBaseUrl;
  return `http://${trimmedBaseUrl}`;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_OSHU_API_BASE_URL ?? DEFAULT_API_BASE_URL);

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const normalizeTokenResponse = (token: RawTokenResponse): TokenResponse => {
  const accessToken = token.accessToken ?? token.access_token ?? token.token;
  if (!accessToken) {
    throw new Error('LOGIN_TOKEN_MISSING');
  }
  return {
    accessToken,
    tokenType: token.tokenType ?? token.type,
  };
};

async function request<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    Accept: 'application/json',
    ...(!isFormData && options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const payload = errorText
      ? (() => {
        try {
          return JSON.parse(errorText) as unknown;
        } catch {
          return undefined;
        }
      })()
      : undefined;
    const message = typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string'
      ? payload.message
      : errorText || `HTTP ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

function authHeaders(accessToken: string) {
  const authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
  return {
    Authorization: authorization,
  };
}

export const ownerApi = {
  signUp(body: SignUpRequest) {
    return request<MessageResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async login(body: LoginRequest) {
    const token = await request<RawTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return normalizeTokenResponse(token);
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

  saveDailyOrderStatistics(accessToken: string, storeId: number, body: DailyOrderStatisticsRequest) {
    return request<void>(`/owner/stores/${storeId}/order-statistics`, {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  },

  getDiscountRecommendation(accessToken: string, storeId: number, orderDate: string) {
    const query = new URLSearchParams({ orderDate }).toString();
    return request<DiscountRecommendationResponse>(`/owner/stores/${storeId}/discount-recommendations?${query}`, {
      headers: authHeaders(accessToken),
    });
  },

  uploadImage(accessToken: string, image: File) {
    const body = new FormData();
    body.append('image', image);
    return request<ImageUploadResponse>('/owner/uploads/images', {
      method: 'POST',
      headers: authHeaders(accessToken),
      body,
    });
  },

  getStoreInquiries(accessToken: string, storeId: number) {
    return request<Inquiry[]>(`/inquiry/store/${storeId}`, {
      headers: authHeaders(accessToken),
    });
  },

  getInquiry(accessToken: string, inquiryId: number) {
    return request<Inquiry>(`/inquiry/${inquiryId}`, {
      headers: authHeaders(accessToken),
    });
  },
};
