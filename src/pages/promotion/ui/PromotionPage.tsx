import { useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Plus, Save } from 'lucide-react';
import type { PromotionDetail, PromotionRequest } from '../../../entities/owner/types';
import { promotionTypeOptions } from '../../../entities/owner/model/options';
import { toDateValue, toDatetimeLocalValue } from '../../../shared/lib/format';
import { PromotionTable } from '../../../shared/ui/tables';

const normalizePromotionSchedule = (type: PromotionRequest['type'], startAt: string, endAt: string): Pick<PromotionRequest, 'startAt' | 'endAt'> => {
  if (type !== 'NEW_MENU') {
    return { startAt, endAt };
  }

  return {
    startAt: `${startAt}T00:00`,
    endAt: `${endAt}T23:59`,
  };
};

export function PromotionPage({
  promotions,
  onSubmit,
  onUpdate,
  onUploadImage,
  onNotify,
}: {
  promotions: PromotionDetail[];
  onSubmit: (body: PromotionRequest) => Promise<string | undefined>;
  onUpdate: (promotionId: number, body: PromotionRequest) => Promise<string | undefined>;
  onUploadImage: (image: File) => Promise<string>;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateForm = (patch: Partial<PromotionRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const resetForm = () => {
    setForm({ type: 'NEW_MENU', title: '', content: '', imageUrl: '', startAt: '', endAt: '' });
    setEditingId(null);
    setIsUploadingImage(false);
  };

  const openCreateModal = () => {
    resetForm();
    setMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PromotionDetail) => {
    const isNewMenu = item.type === 'NEW_MENU';
    setForm({
      type: item.type,
      title: item.title,
      content: item.content ?? '',
      imageUrl: item.imageUrl ?? '',
      startAt: isNewMenu ? toDateValue(item.startAt) : toDatetimeLocalValue(item.startAt),
      endAt: isNewMenu ? toDateValue(item.endAt) : toDatetimeLocalValue(item.endAt),
    });
    setMessage('');
    setEditingId(item.promotionId);
    setIsModalOpen(true);
  };

  const submit = async () => {
    if (isUploadingImage) {
      onNotify('이미지 업로드가 끝난 뒤 다시 시도해주세요.', 'error');
      return;
    }
    if (!form.title.trim() || !form.startAt || !form.endAt) {
      onNotify('제목과 노출 기간을 모두 입력해주세요.', 'error');
      return;
    }

    const normalizedSchedule = normalizePromotionSchedule(form.type, form.startAt, form.endAt);
    const requestBody = { ...form, ...normalizedSchedule };
    const warning = editingId ? await onUpdate(editingId, requestBody) : await onSubmit(requestBody);
    if (warning) {
      setMessage('');
      onNotify(warning, 'error');
      return;
    }
    const message = `${editingId ? '수정' : '등록'}되었습니다.`;
    setMessage(message);
    onNotify(`홍보 게시물을 ${editingId ? '수정' : '등록'}했습니다.`, 'success');
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await onUploadImage(image);
      updateForm({ imageUrl });
      onNotify('이미지를 업로드했습니다.', 'success');
    } catch (error) {
      onNotify(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">가게 홍보</p><h3>등록 내역</h3></div>
          <button className="primary-button" onClick={openCreateModal}><Plus size={18} />새 홍보</button>
        </div>
        <PromotionTable items={promotions} onEdit={openEditModal} />
        {message && <p className="form-success">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="홍보 게시물 등록">
            <header className="modal-header">
              <div>
                <p className="eyebrow">{editingId ? '정보 수정' : '신규 등록'}</p>
                <h3>홍보 게시물</h3>
              </div>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); resetForm(); }} aria-label="닫기">×</button>
            </header>

            <div className="form-grid modal-body">
              <label>
                유형 *
                <select
                  value={form.type}
                  onChange={(event) => {
                    const nextType = event.target.value as PromotionRequest['type'];
                    updateForm({
                      type: nextType,
                      startAt: nextType === 'NEW_MENU' ? toDateValue(form.startAt) : form.startAt,
                      endAt: nextType === 'NEW_MENU' ? toDateValue(form.endAt) : form.endAt,
                    });
                  }}
                >
                  {promotionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <div className="wide">
                <p className="field-title">대표 이미지</p>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageSelection} hidden />
                <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                  <ImagePlus size={18} />{isUploadingImage ? '업로드 중...' : '이미지 선택'}
                </button>
                {form.imageUrl && (
                  <>
                    <img src={form.imageUrl} alt="홍보 이미지 미리보기" style={{ width: '100%', maxWidth: '240px', borderRadius: '16px', objectFit: 'cover' }} />
                    <p className="eyebrow">{form.imageUrl}</p>
                  </>
                )}
              </div>
              <label className="wide">제목 *<input value={form.title} onChange={(event) => updateForm({ title: event.target.value })} /></label>
              <label className="wide">내용 *<textarea value={form.content} onChange={(event) => updateForm({ content: event.target.value })} /></label>
              <label>
                {form.type === 'NEW_MENU' ? '출시 시작일 *' : '시작 일시 *'}
                <input type={form.type === 'NEW_MENU' ? 'date' : 'datetime-local'} value={form.startAt} onChange={(event) => updateForm({ startAt: event.target.value })} />
              </label>
              <label>
                {form.type === 'NEW_MENU' ? '출시 종료일 *' : '종료 일시 *'}
                <input type={form.type === 'NEW_MENU' ? 'date' : 'datetime-local'} value={form.endAt} onChange={(event) => updateForm({ endAt: event.target.value })} />
              </label>
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
