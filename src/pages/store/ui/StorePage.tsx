import { useState } from 'react';
import { Save } from 'lucide-react';
import type { CreateStoreRequest, StoreCategory, StoreDetail } from '../../../entities/owner/types';
import { categoryOptions } from '../../../entities/owner/model/options';
import { storeStatusLabel } from '../../../shared/lib/format';

export function StorePage({
  store,
  onSubmit,
}: {
  store: StoreDetail | null;
  onSubmit: (body: CreateStoreRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateStoreRequest>({
    name: store?.name ?? '',
    businessNumber: store?.businessNumber ?? '',
    category: store?.category ?? 'BAKERY',
    address: store?.address ?? '',
    latitude: 36.3628,
    longitude: 127.3441,
    description: store?.description ?? '',
    phone: store?.phone ?? '',
    openingHours: store?.openingHours ?? '',
  });
  const [message, setMessage] = useState('');

  const updateForm = (patch: Partial<CreateStoreRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    await onSubmit(form);
    setMessage('저장되었습니다.');
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Store</p><h3>{store ? '가게 정보' : '가게 등록'}</h3></div>
          <button className="primary-button" onClick={submit}><Save size={18} />저장</button>
        </div>

        <div className="form-grid">
          <label>상호명 *<input value={form.name} onChange={(event) => updateForm({ name: event.target.value })} /></label>
          <label>사업자등록번호 *<input value={form.businessNumber} onChange={(event) => updateForm({ businessNumber: event.target.value })} /></label>
          <label>
            업종 *
            <select value={form.category} onChange={(event) => updateForm({ category: event.target.value as StoreCategory })}>
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>연락처<input value={form.phone ?? ''} onChange={(event) => updateForm({ phone: event.target.value })} /></label>
          <label className="wide">주소 *<input value={form.address} onChange={(event) => updateForm({ address: event.target.value })} /></label>
          <label>위도 *<input type="number" value={form.latitude} onChange={(event) => updateForm({ latitude: Number(event.target.value) })} /></label>
          <label>경도 *<input type="number" value={form.longitude} onChange={(event) => updateForm({ longitude: Number(event.target.value) })} /></label>
          <label>영업시간<input value={form.openingHours ?? ''} onChange={(event) => updateForm({ openingHours: event.target.value })} /></label>
          <label>승인 상태<input value={storeStatusLabel(store?.status)} readOnly /></label>
          <label className="wide">가게 소개<textarea value={form.description ?? ''} onChange={(event) => updateForm({ description: event.target.value })} /></label>
        </div>
        {message && <p className="form-success">{message}</p>}
      </section>
    </div>
  );
}
