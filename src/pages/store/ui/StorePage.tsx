import { useState } from 'react';
import { MapPin, Pencil, Save, Store } from 'lucide-react';
import type { CreateStoreRequest, CrowdLevel, CrowdStatusRequest, StoreCategory, StoreDetail } from '../../../entities/owner/types';
import { categoryOptions } from '../../../entities/owner/model/options';
import { congestionLabel } from '../../../shared/lib/format';

const congestionOptions: Array<{ value: CrowdLevel; label: string }> = [
  { value: 'VERY_BUSY', label: '매우 혼잡' },
  { value: 'BUSY', label: '혼잡' },
  { value: 'NORMAL', label: '보통' },
  { value: 'RELAXED', label: '여유' },
];

const splitOpeningHours = (openingHours?: string) => {
  const [openingTime = '', closingTime = ''] = openingHours?.split('-').map((time) => time.trim()) ?? [];
  return { openingTime, closingTime };
};

type StoreFormState = CreateStoreRequest & {
  openingTime: string;
  closingTime: string;
  crowdLevel: CrowdLevel;
  estimatedWaitingMinutes: number;
};

export function StorePage({
  store,
  onSubmit,
  onNotify,
}: {
  store: StoreDetail | null;
  onSubmit: (body: CreateStoreRequest, crowdStatus: CrowdStatusRequest) => Promise<string | undefined>;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}) {
  const initialHours = splitOpeningHours(store?.openingHours);
  const [form, setForm] = useState<StoreFormState>({
    name: store?.name ?? '',
    category: store?.category ?? '베이커리',
    address: store?.address ?? '',
    latitude: store?.latitude ?? 36.3628,
    longitude: store?.longitude ?? 127.3441,
    description: store?.description ?? '',
    phone: store?.phone ?? '',
    openingHours: store?.openingHours ?? '',
    openingTime: initialHours.openingTime,
    closingTime: initialHours.closingTime,
    crowdLevel: store?.crowdStatus?.level ?? 'RELAXED',
    estimatedWaitingMinutes: store?.crowdStatus?.estimatedWaitingMinutes ?? 0,
  });
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(!store);

  const updateForm = (patch: Partial<StoreFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.address.trim() || !Number.isFinite(form.latitude) || !Number.isFinite(form.longitude)) {
      onNotify('상호명, 주소, 좌표를 올바르게 입력해주세요.', 'error');
      return;
    }

    const openingHours = form.openingTime && form.closingTime ? `${form.openingTime} - ${form.closingTime}` : form.openingHours;
    const { openingTime, closingTime, crowdLevel, estimatedWaitingMinutes, ...requestBody } = form;
    const warning = await onSubmit(
      { ...requestBody, openingHours },
      { level: crowdLevel, estimatedWaitingMinutes },
    );
    if (warning) {
      setMessage('');
      onNotify(warning, 'error');
      return;
    }
    const message = '저장되었습니다.';
    setMessage(message);
    onNotify(message, 'success');
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
            <div className="profile-badges">
              <span className={`plain-badge congestion-${store.crowdStatus?.level ?? 'RELAXED'}`}>
                혼잡도 {congestionLabel(store.crowdStatus?.level)}
              </span>
              {typeof store.crowdStatus?.estimatedWaitingMinutes === 'number' && (
                <span className="plain-badge">예상 대기 {store.crowdStatus.estimatedWaitingMinutes}분</span>
              )}
            </div>
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
              <label>오픈 시간<input type="time" value={form.openingTime} onChange={(event) => updateForm({ openingTime: event.target.value })} /></label>
              <label>마감 시간<input type="time" value={form.closingTime} onChange={(event) => updateForm({ closingTime: event.target.value })} /></label>
              <div className="wide">
                <p className="field-title">가게 혼잡도</p>
                <div className="segmented-control">
                  {congestionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={form.crowdLevel === option.value ? 'active' : ''}
                      onClick={() => updateForm({ crowdLevel: option.value })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="wide">예상 대기시간<input type="number" min={0} value={form.estimatedWaitingMinutes} onChange={(event) => updateForm({ estimatedWaitingMinutes: Number(event.target.value) })} /></label>
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
