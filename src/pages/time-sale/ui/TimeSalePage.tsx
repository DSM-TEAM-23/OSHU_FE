import { useEffect, useMemo, useState } from 'react';
import { Bot, Plus, Save, Sparkles } from 'lucide-react';
import type {
  DailyOrderStatisticsRequest,
  DiscountRecommendationResponse,
  HourlyOrderCountRequest,
  TimeSale,
  TimeSaleRequest,
} from '../../../entities/owner/types';
import { formatHourRange, toDatetimeLocalValue, todayDateValue } from '../../../shared/lib/format';
import { getOperatingHours } from '../../../shared/lib/openingHours';
import { TimeSaleTable } from '../../../shared/ui/tables';

const buildHourlyOrderCounts = (hours: number[], previousItems?: HourlyOrderCountRequest[]) => {
  const previousMap = new Map(previousItems?.map((item) => [item.hour, item.orderCount]) ?? []);
  return hours.map((hour) => ({ hour, orderCount: previousMap.get(hour) ?? 0 }));
};

export function TimeSalePage({
  storeId,
  openingHours,
  timeSales,
  onSubmit,
  onUpdate,
  onClose,
  onSaveOrderStatistics,
  onRecommendDiscount,
  editingTimeSaleId,
  onEditConsumed,
  onNotify,
}: {
  storeId?: number;
  openingHours?: string;
  timeSales: TimeSale[];
  onSubmit: (body: TimeSaleRequest) => Promise<string | undefined>;
  onUpdate: (timeSaleId: number, body: TimeSaleRequest) => Promise<string | undefined>;
  onClose: (timeSaleId: number) => Promise<void>;
  onSaveOrderStatistics: (body: DailyOrderStatisticsRequest) => Promise<string | undefined>;
  onRecommendDiscount: (orderDate: string) => Promise<DiscountRecommendationResponse>;
  editingTimeSaleId?: number | null;
  onEditConsumed?: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
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
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [statisticsDate, setStatisticsDate] = useState(todayDateValue());
  const operatingHours = useMemo(() => getOperatingHours(openingHours), [openingHours]);
  const [hourlyOrderCounts, setHourlyOrderCounts] = useState<HourlyOrderCountRequest[]>(() => buildHourlyOrderCounts(operatingHours));
  const [statisticsMessage, setStatisticsMessage] = useState('');
  const [statisticsError, setStatisticsError] = useState('');
  const [isSavingStatistics, setIsSavingStatistics] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<DiscountRecommendationResponse | null>(null);

  const resetForm = () => {
    setForm({ productName: '', originalPrice: 0, salePrice: 0, startAt: '', endAt: '', notice: '' });
    setEditingId(null);
  };

  const updateForm = (patch: Partial<TimeSaleRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const openCreateModal = () => {
    resetForm();
    setMessage('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: TimeSale) => {
    setForm({
      productName: item.productName,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      startAt: toDatetimeLocalValue(item.startAt),
      endAt: toDatetimeLocalValue(item.endAt),
      notice: item.notice ?? '',
    });
    setMessage('');
    setError('');
    setEditingId(item.timeSaleId);
    setIsModalOpen(true);
  };

  const submit = async () => {
    if (!form.productName.trim() || !form.startAt || !form.endAt || form.originalPrice <= 0 || form.salePrice <= 0) {
      const warning = '필수 항목과 가격 정보를 올바르게 입력해주세요.';
      setError(warning);
      onNotify(warning, 'error');
      return;
    }

    if (editingId) {
      const warning = await onUpdate(editingId, form);
      if (warning) {
        setMessage('');
        setError(warning);
        onNotify(warning, 'error');
        return;
      }
      setMessage('수정되었습니다.');
      setError('');
      onNotify('타임세일을 수정했습니다.', 'success');
    } else {
      const warning = await onSubmit(form);
      if (warning) {
        setMessage('');
        setError(warning);
        onNotify(warning, 'error');
        return;
      }
      setMessage('등록되었습니다.');
      setError('');
      onNotify('타임세일을 등록했습니다.', 'success');
    }
    setIsModalOpen(false);
    resetForm();
  };

  const updateHourlyOrderCount = (hour: number, orderCount: number) => {
    setHourlyOrderCounts((prev) => prev.map((item) => (item.hour === hour
      ? { ...item, orderCount: Number.isNaN(orderCount) ? 0 : Math.max(0, orderCount) }
      : item)));
  };

  const saveStatistics = async () => {
    if (!storeId) {
      const warning = '가게 등록 후 사용할 수 있습니다.';
      setStatisticsError(warning);
      onNotify(warning, 'error');
      return;
    }

    setIsSavingStatistics(true);
    const warning = await onSaveOrderStatistics({
      orderDate: statisticsDate,
      hourlyOrderCounts,
    });
    setIsSavingStatistics(false);

    if (warning) {
      setStatisticsMessage('');
      setStatisticsError(warning);
      onNotify(warning, 'error');
      return;
    }

    setStatisticsError('');
    setStatisticsMessage('주문 데이터가 저장되었습니다. 이제 AI 추천을 받아보세요.');
    onNotify('하루 주문 데이터를 저장했습니다.', 'success');
  };

  const requestRecommendation = async () => {
    if (!storeId) {
      const warning = '가게 등록 후 사용할 수 있습니다.';
      setStatisticsError(warning);
      onNotify(warning, 'error');
      return;
    }

    setIsLoadingRecommendation(true);
    try {
      const nextRecommendation = await onRecommendDiscount(statisticsDate);
      setRecommendation(nextRecommendation);
      setStatisticsError('');
      setStatisticsMessage('');
      onNotify('AI 할인 추천을 불러왔습니다.', 'success');
    } catch (error) {
      const warning = error instanceof Error ? error.message : 'AI 추천을 불러오지 못했습니다.';
      setStatisticsError(warning);
      onNotify(warning, 'error');
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  useEffect(() => {
    if (!editingTimeSaleId) return;
    const target = timeSales.find((item) => item.timeSaleId === editingTimeSaleId);
    if (target) openEditModal(target);
    onEditConsumed?.();
  }, [editingTimeSaleId, onEditConsumed, timeSales]);

  useEffect(() => {
    setHourlyOrderCounts((prev) => buildHourlyOrderCounts(operatingHours, prev));
  }, [operatingHours]);

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">타임세일</p><h3>등록 내역</h3></div>
          <button className="primary-button" onClick={openCreateModal}><Plus size={18} />새 타임세일</button>
        </div>
        <TimeSaleTable items={timeSales} onEdit={openEditModal} onClose={onClose} />
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
      </section>

      <section className="card ai-recommendation-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI 할인 추천</p>
            <h3>주문이 비는 시간대를 자동으로 찾아드려요</h3>
          </div>
          <div className="ai-badge"><Bot size={16} />Claude 분석</div>
        </div>

        <div className="ai-grid">
          <div className="ai-input-panel">
            <div className="recommendation-date-row">
              <label>
                분석 날짜
                <input type="date" value={statisticsDate} onChange={(event) => setStatisticsDate(event.target.value)} />
              </label>
              <div className="ai-summary-chip">
                총 주문 {hourlyOrderCounts.reduce((sum, item) => sum + item.orderCount, 0)}건
              </div>
            </div>

            <p className="eyebrow">
              운영시간 기준 입력 {openingHours?.trim() || '00:00 - 24:00'}
            </p>

            <div className="hourly-grid">
              {hourlyOrderCounts.map((item) => (
                <label key={item.hour} className="hourly-cell">
                  <span>{String(item.hour).padStart(2, '0')}:00</span>
                  <input
                    type="number"
                    min={0}
                    value={item.orderCount}
                    onChange={(event) => updateHourlyOrderCount(item.hour, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>

            <div className="recommendation-actions">
              <button className="ghost-button" onClick={saveStatistics} disabled={isSavingStatistics}>
                <Save size={18} />
                {isSavingStatistics ? '저장 중' : '주문 데이터 저장'}
              </button>
              <button className="primary-button" onClick={requestRecommendation} disabled={isLoadingRecommendation}>
                <Sparkles size={18} />
                {isLoadingRecommendation ? '분석 중' : 'AI 추천 받기'}
              </button>
            </div>

            {statisticsMessage && <p className="form-success">{statisticsMessage}</p>}
            {statisticsError && <p className="form-error">{statisticsError}</p>}
          </div>

          <div className="ai-result-panel">
            {recommendation ? (
              <>
                <div className="recommendation-hero">
                  <p className="eyebrow">추천 결과</p>
                  <h4>{recommendation.recommendedDay} {formatHourRange(recommendation.startHour, recommendation.endHour)}</h4>
                  <strong>{recommendation.discountRate}% 할인</strong>
                </div>
                <div className="recommendation-meta">
                  <span className="plain-badge">분석 날짜 {recommendation.analysisDate}</span>
                  <span className="plain-badge">분석 시간대 {recommendation.analyzedHours}개</span>
                </div>
                <div className="recommendation-reason">
                  <p>{recommendation.reason}</p>
                </div>
              </>
            ) : (
              <div className="recommendation-empty">
                <Sparkles size={28} />
                <strong>주문 데이터를 저장한 뒤 추천을 받아보세요</strong>
                <p>AI가 최근 주문 패턴을 보고 손님이 비교적 적은 요일과 시간대를 골라 할인 운영 시간을 제안합니다.</p>
              </div>
            )}
          </div>
        </div>
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
