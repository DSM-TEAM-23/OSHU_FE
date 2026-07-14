import type { PromotionRequest, StoreCategory } from '../types';

export const categoryOptions: Array<{ value: StoreCategory; label: string }> = [
  { value: '베이커리', label: '베이커리' },
  { value: '음식점', label: '음식점' },
  { value: '카페', label: '카페' },
  { value: '마트', label: '마트' },
  { value: '시장·식료품', label: '시장·식료품' },
];

export const promotionTypeOptions: Array<{ value: PromotionRequest['type']; label: string }> = [
  { value: 'DISCOUNT', label: '할인' },
  { value: 'EVENT', label: '이벤트' },
  { value: 'NEW_MENU', label: '신메뉴' },
  { value: 'NOTICE', label: '공지사항' },
];
