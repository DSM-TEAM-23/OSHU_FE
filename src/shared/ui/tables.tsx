import type { Inquiry, PromotionDetail, TimeSale } from '../../entities/owner/types';
import { formatPeriod, formatPrice, promotionTypeLabel, statusLabel } from '../lib/format';

export function TimeSaleTable({
  items,
  compact = false,
  onClose,
  onEdit,
}: {
  items: TimeSale[];
  compact?: boolean;
  onClose?: (timeSaleId: number) => void;
  onEdit?: (item: TimeSale) => void;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr><th>상태</th><th>상품명</th>{!compact && <th>ID</th>}<th>가격</th><th>기간</th><th /></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.timeSaleId}>
              <td><span className={`status-badge ${statusLabel(item.status)}`}>{statusLabel(item.status)}</span></td>
              <td><strong>{item.productName}</strong><p>{item.notice}</p></td>
              {!compact && <td>{item.timeSaleId}</td>}
              <td><span className="price-pair"><del>{formatPrice(item.originalPrice)}</del>{formatPrice(item.salePrice)}</span></td>
              <td>{formatPeriod(item.startAt, item.endAt)}</td>
              <td>
                <div className="table-actions">
                  {onEdit && <button className="table-button" onClick={() => onEdit(item)}>수정</button>}
                  {onClose && <button className="table-button" onClick={() => onClose(item.timeSaleId)}>종료</button>}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={compact ? 5 : 6} className="empty-cell">등록된 타임세일이 없습니다.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function PromotionTable({ items, onEdit }: { items: PromotionDetail[]; onEdit?: (item: PromotionDetail) => void }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr><th>상태</th><th>유형</th><th>제목</th><th>노출 기간</th><th /></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.promotionId}>
              <td><span className={`status-badge ${statusLabel(item.status)}`}>{statusLabel(item.status)}</span></td>
              <td>{promotionTypeLabel(item.type)}</td>
              <td><strong>{item.title}</strong><p>{item.content}</p></td>
              <td>{formatPeriod(item.startAt, item.endAt)}</td>
              <td>{onEdit && <button className="table-button" onClick={() => onEdit(item)}>수정</button>}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="empty-cell">등록된 홍보 게시물이 없습니다.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function InquiryTable({
  items,
  selectedId,
  onSelect,
}: {
  items: Inquiry[];
  selectedId?: number | null;
  onSelect?: (item: Inquiry) => void;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr><th>제목</th><th>작성자</th><th>연락처</th><th /></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={selectedId === item.id ? 'is-selected' : ''}>
              <td><strong>{item.title}</strong><p>{item.content}</p></td>
              <td>{item.name}</td>
              <td>{item.number}</td>
              <td>{onSelect && <button className="table-button" onClick={() => onSelect(item)}>상세 보기</button>}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="empty-cell">아직 들어온 문의가 없습니다.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
