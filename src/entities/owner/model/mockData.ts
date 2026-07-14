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
  customCategory: '',
  description: '',
  address: '',
  phone: '',
  openingHours: '',
  openingTime: '',
  closingTime: '',
});
