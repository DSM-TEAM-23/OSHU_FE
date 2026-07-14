export type StoreCategory = string;
export type StoreApprovalStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
export type CrowdLevel = 'RELAXED' | 'NORMAL' | 'BUSY' | 'VERY_BUSY';
export type PromotionType = string;
export type PromotionStatus = string;
export type TimeSaleStatus = string;

export type SignUpRequest = {
  loginId: string;
  password: string;
};

export type LoginRequest = {
  loginId: string;
  password: string;
};

export type MessageResponse = {
  message?: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType?: string;
};

export type CreateStoreRequest = {
  name: string;
  category: StoreCategory;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  openingHours?: string;
};

export type UpdateStoreRequest = {
  description?: string;
  phone?: string;
  openingHours?: string;
};

export type OwnerStore = {
  storeId: number;
  name: string;
  category: StoreCategory;
  address?: string;
  latitude?: number;
  longitude?: number;
  crowdLevel?: CrowdLevel;
  timeSaleActive?: boolean;
  externalData?: boolean;
};

export type CrowdStatusRequest = {
  level: CrowdLevel;
  estimatedWaitingMinutes: number;
};

export type CrowdStatusResponse = {
  level: CrowdLevel;
  label?: string;
  estimatedWaitingMinutes?: number;
};

export type StoreDetail = {
  storeId: number;
  name: string;
  category: StoreCategory;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  openingHours?: string;
  crowdStatus?: CrowdStatusResponse;
  promotions?: PromotionDetail[];
  timeSales?: TimeSale[];
  status?: StoreApprovalStatus;
};

export type PromotionRequest = {
  type: PromotionType;
  title: string;
  content: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
};

export type PromotionDetail = {
  promotionId: number;
  storeId: number;
  storeName: string;
  type: string;
  title: string;
  imageUrl?: string;
  status: PromotionStatus;
  content?: string;
  startAt?: string;
  endAt?: string;
};

export type TimeSaleRequest = {
  productName: string;
  originalPrice: number;
  salePrice: number;
  startAt: string;
  endAt: string;
  notice?: string;
};

export type TimeSale = TimeSaleRequest & {
  timeSaleId: number;
  storeId?: number;
  status: TimeSaleStatus;
};

export type ErrorResponse = {
  code: string;
  message: string;
  status: number;
  timestamp: string;
};
