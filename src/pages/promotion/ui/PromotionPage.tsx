import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { PromotionDetail, PromotionRequest } from '../../../entities/owner/types';
import { promotionTypeOptions } from '../../../entities/owner/model/options';
import { PromotionTable } from '../../../shared/ui/tables';

export function PromotionPage({
  promotions,
  onSubmit,
  onNotify,
}: {
  promotions: PromotionDetail[];
  onSubmit: (body: PromotionRequest) => Promise<string | undefined>;
  onNotify: (message: string, type?: 'success' | 'error') => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateForm = (patch: Partial<PromotionRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    const warning = await onSubmit(form);
    const message = warning ? '화면에는 등록되었습니다.' : '등록되었습니다.';
    setMessage(message);
    onNotify(warning ?? '홍보 게시물을 등록했습니다.', warning ? 'error' : 'success');
    setIsModalOpen(false);
    setForm({ type: 'NEW_MENU', title: '', content: '', imageUrl: '', startAt: '', endAt: '' });
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">가게 홍보</p><h3>등록 내역</h3></div>
          <button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} />새 홍보</button>
        </div>
        <PromotionTable items={promotions} />
        {message && <p className="form-success">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="홍보 게시물 등록">
            <header className="modal-header">
              <div>
                <p className="eyebrow">신규 등록</p>
                <h3>홍보 게시물</h3>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="닫기">×</button>
            </header>

            <div className="form-grid modal-body">
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

            <footer className="modal-actions">
              <button className="ghost-button" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="primary-button" onClick={submit}><Save size={18} />등록</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
