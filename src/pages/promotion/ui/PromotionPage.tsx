import { useState } from 'react';
import { Save } from 'lucide-react';
import type { PromotionDetail, PromotionRequest } from '../../../entities/owner/types';
import { promotionTypeOptions } from '../../../entities/owner/model/options';
import { PromotionTable } from '../../../shared/ui/tables';

export function PromotionPage({
  promotions,
  onSubmit,
}: {
  promotions: PromotionDetail[];
  onSubmit: (body: PromotionRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<PromotionRequest>({
    type: 'NEW_MENU',
    title: '',
    content: '',
    imageUrl: '',
    startAt: '',
    endAt: '',
  });
  const [message, setMessage] = useState('');

  const updateForm = (patch: Partial<PromotionRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    await onSubmit(form);
    setMessage('등록되었습니다.');
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Promotion</p><h3>홍보 게시물 등록</h3></div>
          <button className="primary-button" onClick={submit}><Save size={18} />등록</button>
        </div>

        <div className="form-grid">
          <label>
            유형 *
            <select value={form.type} onChange={(event) => updateForm({ type: event.target.value as PromotionRequest['type'] })}>
              {promotionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>이미지 URL<input value={form.imageUrl ?? ''} onChange={(event) => updateForm({ imageUrl: event.target.value })} /></label>
          <label className="wide">제목 *<input value={form.title} onChange={(event) => updateForm({ title: event.target.value })} /></label>
          <label className="wide">내용 *<textarea value={form.content} onChange={(event) => updateForm({ content: event.target.value })} /></label>
          <label>시작 일시 *<input type="datetime-local" value={form.startAt} onChange={(event) => updateForm({ startAt: event.target.value })} /></label>
          <label>종료 일시 *<input type="datetime-local" value={form.endAt} onChange={(event) => updateForm({ endAt: event.target.value })} /></label>
        </div>
        {message && <p className="form-success">{message}</p>}
      </section>

      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">목록</p><h3>등록 내역</h3></div></div>
        <PromotionTable items={promotions} />
      </section>
    </div>
  );
}
