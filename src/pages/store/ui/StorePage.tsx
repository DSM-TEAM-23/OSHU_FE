import { useState } from 'react';
import { MapPin, Pencil, Save, Store } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(!store);

  const updateForm = (patch: Partial<CreateStoreRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    await onSubmit(form);
    setMessage('저장되었습니다.');
    setIsModalOpen(false);
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">가게 관리</p><h3>{store ? store.name : '가게 등록 필요'}</h3></div>
          <button className="primary-button" onClick={() => setIsModalOpen(true)}><Pencil size={18} />{store ? '수정하기' : '등록하기'}</button>
        </div>

        {store ? (
          <div className="profile-summary">
            <div className="profile-mark"><Store size={24} /></div>
            <div>
              <strong>{store.name}</strong>
              <p>{categoryOptions.find((option) => option.value === store.category)?.label} · {store.phone || '연락처 미입력'}</p>
              <p><MapPin size={14} />{store.address}</p>
            </div>
            <span className="plain-badge">{storeStatusLabel(store.status)}</span>
          </div>
        ) : (
          <div className="empty-state">
            <strong>등록된 가게가 없습니다.</strong>
            <p>가게 등록을 완료하면 타임세일과 홍보 게시물을 만들 수 있습니다.</p>
          </div>
        )}
        {message && <p className="form-success">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="가게 정보 입력">
            <header className="modal-header">
              <div>
                <p className="eyebrow">{store ? '정보 수정' : '신규 등록'}</p>
                <h3>가게 정보</h3>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="닫기">×</button>
            </header>

            <div className="form-grid modal-body">
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
              <label className="wide">가게 소개<textarea value={form.description ?? ''} onChange={(event) => updateForm({ description: event.target.value })} /></label>
            </div>

            <footer className="modal-actions">
              <button className="ghost-button" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="primary-button" onClick={submit}><Save size={18} />저장</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
