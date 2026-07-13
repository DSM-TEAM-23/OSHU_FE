import { ImagePlus, Save } from 'lucide-react';
import type { StoreCategory, StoreDetail } from '../../../entities/owner/types';
import { categoryOptions } from '../../../entities/owner/model/options';
import { storeStatusLabel } from '../../../shared/lib/format';
import { ValidationCard } from '../../../shared/ui/cards';

export function StorePage({ store, updateStore }: { store: StoreDetail | null; updateStore: (patch: Partial<StoreDetail>) => void }) {
  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Owner Store API</p><h3>가게 등록 정보</h3></div>
          <button className="primary-button"><Save size={18} />저장</button>
        </div>

        <div className="form-grid">
          <label>사업자등록번호 *<input value={store?.businessNumber ?? ''} readOnly /></label>
          <label>상호명 *<input value={store?.name ?? ''} onChange={(event) => updateStore({ name: event.target.value })} /></label>
          <label>
            업종 *
            <select value={store?.category ?? 'BAKERY'} onChange={(event) => updateStore({ category: event.target.value as StoreCategory })}>
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>연락처<input value={store?.phone ?? ''} onChange={(event) => updateStore({ phone: event.target.value })} /></label>
          <label className="wide">주소 *<input value={store?.address ?? ''} readOnly /></label>
          <label>영업시간<input value={store?.openingHours ?? ''} onChange={(event) => updateStore({ openingHours: event.target.value })} /></label>
          <label>상태<input value={storeStatusLabel(store?.status)} readOnly /></label>
          <label className="wide">가게 소개<textarea value={store?.description ?? ''} onChange={(event) => updateStore({ description: event.target.value })} /></label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <p className="eyebrow">UpdateStoreRequest</p>
          <h3>이미지 정보</h3>
          <div className="upload-row"><button className="upload-box"><ImagePlus size={28} />imageUrls 추가</button></div>
        </div>
        <ValidationCard title="사용 API" items={['GET /owner/stores', 'POST /owner/stores', 'GET /owner/stores/{storeId}', 'PATCH /owner/stores/{storeId}']} />
      </section>
    </div>
  );
}
