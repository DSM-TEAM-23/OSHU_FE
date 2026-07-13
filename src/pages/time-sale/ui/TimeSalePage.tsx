import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { TimeSale, TimeSaleRequest } from '../../../entities/owner/types';
import { TimeSaleTable } from '../../../shared/ui/tables';

export function TimeSalePage({
  timeSales,
  onSubmit,
  onClose,
}: {
  timeSales: TimeSale[];
  onSubmit: (body: TimeSaleRequest) => Promise<void>;
  onClose: (timeSaleId: number) => Promise<void>;
}) {
  const [form, setForm] = useState<TimeSaleRequest>({
    productName: '',
    originalPrice: 0,
    salePrice: 0,
    startAt: '',
    endAt: '',
    notice: '',
  });
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateForm = (patch: Partial<TimeSaleRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const submit = async () => {
    await onSubmit(form);
    setMessage('등록되었습니다.');
    setIsModalOpen(false);
    setForm({ productName: '', originalPrice: 0, salePrice: 0, startAt: '', endAt: '', notice: '' });
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">타임세일</p><h3>등록 내역</h3></div>
          <button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} />새 타임세일</button>
        </div>
        <TimeSaleTable items={timeSales} onClose={onClose} />
        {message && <p className="form-success">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="타임세일 등록">
            <header className="modal-header">
              <div>
                <p className="eyebrow">신규 등록</p>
                <h3>타임세일</h3>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="닫기">×</button>
            </header>

            <div className="form-grid modal-body">
              <label>상품명 *<input value={form.productName} onChange={(event) => updateForm({ productName: event.target.value })} /></label>
              <label>정상가 *<input type="number" value={form.originalPrice} onChange={(event) => updateForm({ originalPrice: Number(event.target.value) })} /></label>
              <label>할인가 *<input type="number" value={form.salePrice} onChange={(event) => updateForm({ salePrice: Number(event.target.value) })} /></label>
              <label>시작 일시 *<input type="datetime-local" value={form.startAt} onChange={(event) => updateForm({ startAt: event.target.value })} /></label>
              <label>종료 일시 *<input type="datetime-local" value={form.endAt} onChange={(event) => updateForm({ endAt: event.target.value })} /></label>
              <label className="wide">안내 문구<textarea value={form.notice ?? ''} onChange={(event) => updateForm({ notice: event.target.value })} /></label>
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
