import type { MerchantData, SignupDraft } from '../types/ui';

export const createEmptyMerchantData = (): MerchantData => ({
  store: null,
  timeSales: [],
  promotions: [],
});

export const createEmptySignupDraft = (): SignupDraft => ({
  loginId: '',
  password: '',
  passwordConfirm: '',
  name: '',
  category: '베이커리',
  description: '',
  address: '',
  latitude: 36.3628,
  longitude: 127.3441,
  phone: '',
  openingHours: '',
  openingTime: '',
  closingTime: '',
});
