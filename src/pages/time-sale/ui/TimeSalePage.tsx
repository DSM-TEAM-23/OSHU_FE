import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { TimeSale, TimeSaleRequest } from '../../../entities/owner/types';
import { TimeSaleTable } from '../../../shared/ui/tables';

export function TimeSalePage({
  timeSales,
  onSubmit,
  onUpdate,
  onClose,
  editingTimeSaleId,
  onEditConsumed,
}: {
  timeSales: TimeSale[];
  onSubmit: (body: TimeSaleRequest) => Promise<void>;
  onUpdate: (timeSaleId: number, body: TimeSaleRequest) => Promise<void>;
  onClose: (timeSaleId: number) => Promise<void>;
  editingTimeSaleId?: number | null;
  onEditConsumed?: () => void;
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
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setForm({ productName: '', originalPrice: 0, salePrice: 0, startAt: '', endAt: '', notice: '' });
    setEditingId(null);
  };

  const updateForm = (patch: Partial<TimeSaleRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: TimeSale) => {
    setForm({
      productName: item.productName,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      startAt: item.startAt,
      endAt: item.endAt,
      notice: item.notice ?? '',
    });
    setEditingId(item.timeSaleId);
    setIsModalOpen(true);
  };

  const submit = async () => {
    if (editingId) {
      await onUpdate(editingId, form);
      setMessage('수정되었습니다.');
    } else {
      await onSubmit(form);
      setMessage('등록되었습니다.');
    }
    setIsModalOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (!editingTimeSaleId) return;
    const target = timeSales.find((item) => item.timeSaleId === editingTimeSaleId);
    if (target) openEditModal(target);
    onEditConsumed?.();
  }, [editingTimeSaleId, onEditConsumed, timeSales]);

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">타임세일</p><h3>등록 내역</h3></div>
          <button className="primary-button" onClick={openCreateModal}><Plus size={18} />새 타임세일</button>
        </div>
        <TimeSaleTable items={timeSales} onEdit={openEditModal} onClose={onClose} />
        {message && <p className="form-success">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="타임세일 등록">
            <header className="modal-header">
              <div>
                <p className="eyebrow">{editingId ? '정보 수정' : '신규 등록'}</p>
                <h3>타임세일</h3>
              </div>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); resetForm(); }} aria-label="닫기">×</button>
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
              <button className="ghost-button" onClick={() => { setIsModalOpen(false); resetForm(); }}>취소</button>
              <button className="primary-button" onClick={submit}><Save size={18} />{editingId ? '수정' : '등록'}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
