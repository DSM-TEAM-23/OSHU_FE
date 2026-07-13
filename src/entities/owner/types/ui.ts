import type { CreateStoreRequest, LoginRequest, PromotionDetail, StoreDetail, TimeSale } from './index';

export type MenuKey = 'dashboard' | 'store' | 'timesale' | 'promotion';
export type AuthMode = 'login' | 'signup';

export type Session = {
  accessToken: string;
  refreshToken: string;
  loginId: string;
};

export type MockAccount = LoginRequest & {
  accessToken: string;
  refreshToken: string;
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
};
