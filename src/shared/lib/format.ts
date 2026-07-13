import type { PromotionDetail, PromotionRequest, StoreApprovalStatus, TimeSale } from '../../entities/owner/types';

export const formatPrice = (price: number) => `${price.toLocaleString()}원`;

export const formatPeriod = (startAt?: string, endAt?: string) =>
  `${startAt?.slice(5, 16).replace('T', ' ') ?? '-'} - ${endAt?.slice(11, 16) ?? '-'}`;

export function storeStatusLabel(status?: StoreApprovalStatus) {
  if (status === 'ACTIVE') return '승인 완료';
  if (status === 'REJECTED') return '반려';
  return '검토중';
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
