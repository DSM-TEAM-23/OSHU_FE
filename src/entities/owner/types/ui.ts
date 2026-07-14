import type { CreateStoreRequest, Inquiry, LoginRequest, PromotionDetail, StoreDetail, TimeSale } from './index';

export type MenuKey = 'dashboard' | 'store' | 'timesale' | 'promotion' | 'inquiry';
export type AuthMode = 'login' | 'signup';

export type Session = {
  accessToken: string;
  tokenType?: string;
  loginId: string;
};

export type SignupDraft = LoginRequest &
  CreateStoreRequest & {
    passwordConfirm: string;
    openingTime: string;
    closingTime: string;
  };

export type MerchantData = {
  store: StoreDetail | null;
  timeSales: TimeSale[];
  promotions: PromotionDetail[];
  inquiries: Inquiry[];
};
