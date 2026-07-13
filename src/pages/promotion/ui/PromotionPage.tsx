import { Save } from 'lucide-react';
import type { PromotionDetail } from '../../../entities/owner/types';
import { promotionTypeOptions } from '../../../entities/owner/model/options';
import { ValidationCard } from '../../../shared/ui/cards';
import { PromotionTable } from '../../../shared/ui/tables';

export function PromotionPage({ promotions }: { promotions: PromotionDetail[] }) {
  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">PromotionRequest</p><h3>홍보 게시물 등록</h3></div>
          <button className="primary-button"><Save size={18} />게시물 저장</button>
        </div>

        <div className="form-grid">
          <label>
            type *
            <select defaultValue="NEW_MENU">
              {promotionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>imageUrl<input placeholder="https://..." /></label>
          <label className="wide">title *<input defaultValue="신메뉴 판매 안내" /></label>
          <label className="wide">content *<textarea defaultValue="신규 메뉴 판매 안내 문구를 입력합니다." /></label>
          <label>startAt *<input type="datetime-local" defaultValue="2026-07-13T09:00" /></label>
          <label>endAt *<input type="datetime-local" defaultValue="2026-07-20T21:00" /></label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <div className="section-heading"><div><p className="eyebrow">게시물 목록</p><h3>홍보 등록 내역</h3></div></div>
          <PromotionTable items={promotions} />
        </div>
        <ValidationCard title="사용 API" items={['POST /owner/stores/{storeId}/promotions', 'PATCH /owner/promotions/{promotionId}', 'DELETE /owner/promotions/{promotionId}']} />
      </section>
    </div>
  );
}
