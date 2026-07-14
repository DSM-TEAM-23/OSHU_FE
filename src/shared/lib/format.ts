import type { CrowdLevel, PromotionDetail, PromotionRequest, TimeSale } from '../../entities/owner/types';

export const formatPrice = (price: number) => `${price.toLocaleString()}원`;

export const toDatetimeLocalValue = (value?: string) => {
  if (!value) return '';
  return value.replace(' ', 'T').slice(0, 16);
};

export const toDateValue = (value?: string) => {
  if (!value) return '';
  return value.slice(0, 10);
};

export const formatPeriod = (startAt?: string, endAt?: string) =>
  `${toDatetimeLocalValue(startAt)?.slice(5).replace('T', ' ') || '-'} - ${toDatetimeLocalValue(endAt)?.slice(11) || '-'}`;

export function congestionLabel(status?: CrowdLevel) {
  if (status === 'VERY_BUSY') return '매우 혼잡';
  if (status === 'BUSY') return '혼잡';
  if (status === 'NORMAL') return '보통';
  return '여유';
}

export function promotionTypeLabel(type: PromotionDetail['type'] | PromotionRequest['type']) {
  if (type === 'DISCOUNT') return '할인';
  if (type === 'EVENT') return '이벤트';
  if (type === 'NEW_MENU') return '신메뉴';
  if (type === 'NOTICE') return '공지';
  return '타임세일';
}

export function statusLabel(status: TimeSale['status'] | PromotionDetail['status']) {
  if (status === 'ACTIVE') return '진행중';
  if (status === 'SCHEDULED') return '예약됨';
  if (status === 'SOLD_OUT') return '품절';
  return '종료됨';
}
