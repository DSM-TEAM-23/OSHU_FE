import type { PromotionRequest, StoreCategory } from '../types';

export const categoryOptions: Array<{ value: StoreCategory; label: string }> = [
  { value: 'BAKERY', label: '베이커리' },
  { value: 'FOOD', label: '음식점' },
  { value: 'CAFE', label: '카페' },
  { value: 'MART', label: '마트' },
  { value: 'MARKET', label: '시장·식료품' },
];

export const promotionTypeOptions: Array<{ value: PromotionRequest['type']; label: string }> = [
  { value: 'DISCOUNT', label: '할인' },
  { value: 'EVENT', label: '이벤트' },
  { value: 'NEW_MENU', label: '신메뉴' },
  { value: 'NOTICE', label: '공지사항' },
];
