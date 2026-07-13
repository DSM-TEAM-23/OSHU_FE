export type StoreCategory = 'FOOD' | 'CAFE' | 'BAKERY' | 'MART' | 'MARKET';
export type StoreApprovalStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
export type StoreCongestionStatus = 'VERY_BUSY' | 'BUSY' | 'NORMAL' | 'RELAXED';
export type PromotionType = 'DISCOUNT' | 'EVENT' | 'NEW_MENU' | 'NOTICE';
export type PromotionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'SOLD_OUT';
export type TimeSaleStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'SOLD_OUT';

export type SignUpRequest = {
  loginId: string;
  password: string;
};

export type LoginRequest = {
  loginId: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  loginId: string;
  nickname: string;
  role: 'CONSUMER' | 'OWNER';
  accessToken: string;
  refreshToken: string;
};

export type CreateStoreRequest = {
  name: string;
  businessNumber: string;
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
  imageUrls?: string[];
};

export type OwnerStore = {
  storeId: number;
  name: string;
  thumbnailUrl?: string;
  category: StoreCategory;
  distanceMeter?: number;
  status: StoreApprovalStatus;
  activePromotionCount: number;
};

export type StoreDetail = OwnerStore & {
  businessNumber?: string;
  description?: string;
  address: string;
  phone?: string;
  openingHours?: string;
  congestionStatus?: StoreCongestionStatus;
  imageUrls?: string[];
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
  type: 'TIME_SALE' | 'DISCOUNT' | 'EVENT' | 'NEW_MENU' | 'NOTICE';
  title: string;
  imageUrl?: string;
  remainingMinutes?: number;
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
  status: TimeSaleStatus;
  remainingMinutes?: number;
};

export type ErrorResponse = {
  code: string;
  message: string;
  status: number;
  timestamp: string;
};
