import { Clock3 } from 'lucide-react';
import type { TimeSale } from '../../../entities/owner/types';
import { ValidationCard } from '../../../shared/ui/cards';
import { TimeSaleTable } from '../../../shared/ui/tables';

export function TimeSalePage({ timeSales, setTimeSales }: { timeSales: TimeSale[]; setTimeSales: (timeSales: TimeSale[]) => void }) {
  const closeFirst = () => {
    setTimeSales(timeSales.map((item, index) => (index === 0 ? { ...item, status: 'ENDED' } : item)));
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">TimeSaleRequest</p><h3>타임세일 등록</h3></div>
          <button className="primary-button" onClick={closeFirst}><Clock3 size={18} />종료 처리</button>
        </div>

        <div className="form-grid">
          <label>productName *<input defaultValue="클래식 아몬드 크루아상" /></label>
          <label>originalPrice *<input type="number" defaultValue="4500" /></label>
          <label>salePrice *<input type="number" defaultValue="2800" /></label>
          <label>startAt *<input type="datetime-local" defaultValue="2026-07-13T15:00" /></label>
          <label>endAt *<input type="datetime-local" defaultValue="2026-07-13T17:00" /></label>
          <label className="wide">notice<textarea defaultValue="매장 방문 고객에 한함" /></label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <div className="section-heading"><div><p className="eyebrow">등록 내역</p><h3>타임세일 목록</h3></div></div>
          <TimeSaleTable items={timeSales} />
        </div>
        <ValidationCard title="사용 API" items={['POST /owner/stores/{storeId}/time-sales', 'PATCH /owner/time-sales/{timeSaleId}', 'PATCH /owner/time-sales/{timeSaleId}/close']} />
      </section>
    </div>
  );
}
