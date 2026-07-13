import type { MerchantData, MockAccount, SignupDraft } from '../types/ui';

export const initialAccounts: MockAccount[] = [
  { loginId: 'oshu_bakery', password: 'pass1234', accessToken: 'mock-token-bakery', refreshToken: 'mock-refresh-bakery' },
  { loginId: 'oshu_kitchen', password: 'pass1234', accessToken: 'mock-token-restaurant', refreshToken: 'mock-refresh-restaurant' },
];

export const merchantByToken: Record<string, MerchantData> = {
  'mock-token-bakery': {
    store: {
      storeId: 1,
      name: 'OSHU 베이커리 유성점',
      category: 'BAKERY',
      status: 'ACTIVE',
      activePromotionCount: 2,
      businessNumber: '123-45-67890',
      description: '유성구 궁동에 위치한 베이커리 카페입니다. 매장 기본 정보와 행사 정보를 관리합니다.',
      address: '대전광역시 유성구 궁동로 123',
      phone: '042-123-4567',
      openingHours: '09:00-21:00',
      imageUrls: [],
    },
    timeSales: [
      {
        timeSaleId: 21,
        productName: '클래식 크루아상',
        originalPrice: 4500,
        salePrice: 2800,
        startAt: '2026-07-13T15:00:00',
        endAt: '2026-07-13T17:00:00',
        notice: '매장 방문 고객에 한함',
        status: 'ACTIVE',
        remainingMinutes: 42,
      },
      {
        timeSaleId: 22,
        productName: '사워도우 세트',
        originalPrice: 8000,
        salePrice: 5900,
        startAt: '2026-07-13T18:00:00',
        endAt: '2026-07-13T19:30:00',
        notice: '소진 시 조기 종료',
        status: 'SCHEDULED',
      },
    ],
    promotions: [
      {
        promotionId: 101,
        storeId: 1,
        storeName: 'OSHU 베이커리 유성점',
        type: 'EVENT',
        title: '신메뉴 판매 안내',
        status: 'ACTIVE',
        content: '신규 메뉴 판매 안내 문구를 입력합니다.',
        startAt: '2026-07-13T09:00:00',
        endAt: '2026-07-20T21:00:00',
      },
    ],
  },
  'mock-token-restaurant': {
    store: {
      storeId: 2,
      name: '오슈키친 궁동점',
      category: 'FOOD',
      status: 'PENDING_APPROVAL',
      activePromotionCount: 1,
      businessNumber: '987-65-43210',
      description: '점심 식사와 저녁 세트를 운영하는 유성구 음식점입니다.',
      address: '대전광역시 유성구 대학로 45',
      phone: '042-987-6543',
      openingHours: '11:00-22:00',
      imageUrls: [],
    },
    timeSales: [
      {
        timeSaleId: 31,
        productName: '점심 세트',
        originalPrice: 12000,
        salePrice: 9900,
        startAt: '2026-07-13T13:30:00',
        endAt: '2026-07-13T15:00:00',
        status: 'SCHEDULED',
      },
    ],
    promotions: [],
  },
};

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
  businessNumber: '',
  category: 'BAKERY',
  description: '',
  address: '',
  latitude: 36.3628,
  longitude: 127.3441,
  phone: '',
  openingHours: '',
});
