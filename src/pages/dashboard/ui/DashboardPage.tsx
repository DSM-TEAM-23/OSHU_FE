import { Megaphone, Store, Tag } from 'lucide-react';
import type { MerchantData, MenuKey } from '../../../entities/owner/types/ui';
import { TimeSaleTable } from '../../../shared/ui/tables';
import { congestionLabel } from '../../../shared/lib/format';

export function DashboardPage({
  merchantData,
  setActiveMenu,
  onEditTimeSale,
}: {
  merchantData: MerchantData;
  setActiveMenu: (menu: MenuKey) => void;
  onEditTimeSale: (timeSaleId: number) => void;
}) {
  const activeTimeSale = merchantData.timeSales.find((item) => item.status === 'ACTIVE');
  const scheduledTimeSaleCount = merchantData.timeSales.filter((item) => item.status === 'SCHEDULED').length;

  return (
    <div className="dashboard-layout">
      <section className="dashboard-overview">
        <div className="store-line">
          <div>
            <p className="eyebrow">오늘의 관리</p>
            <h2>{merchantData.store?.name || '가게 등록 필요'}</h2>
          </div>
          <div className="profile-badges">
            <span className={`plain-badge congestion-${merchantData.store?.crowdStatus?.level ?? 'RELAXED'}`}>
              혼잡도 {congestionLabel(merchantData.store?.crowdStatus?.level)}
            </span>
            {typeof merchantData.store?.crowdStatus?.estimatedWaitingMinutes === 'number' && (
              <span className="plain-badge">예상 대기 {merchantData.store.crowdStatus.estimatedWaitingMinutes}분</span>
            )}
          </div>
        </div>

        <div className="metric-row">
          <div>
            <span>진행중</span>
            <strong>{activeTimeSale ? '1' : '0'}</strong>
          </div>
          <div>
            <span>예약</span>
            <strong>{scheduledTimeSaleCount}</strong>
          </div>
          <div>
            <span>홍보</span>
            <strong>{merchantData.promotions.length}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading slim">
          <div><p className="eyebrow">바로가기</p><h3>자주 쓰는 작업</h3></div>
        </div>
        <div className="compact-actions">
          <button onClick={() => setActiveMenu('store')}><Store size={18} /><span>가게 정보</span></button>
          <button onClick={() => setActiveMenu('timesale')}><Tag size={18} /><span>타임세일</span></button>
          <button onClick={() => setActiveMenu('promotion')}><Megaphone size={18} /><span>홍보 등록</span></button>
        </div>
      </section>

      <section className="card">
        <div className="section-heading slim">
          <div><p className="eyebrow">최근 행사</p><h3>타임세일</h3></div>
          <button className="ghost-button" onClick={() => setActiveMenu('timesale')}>전체 보기</button>
        </div>
        <TimeSaleTable items={merchantData.timeSales} compact onEdit={(item) => onEditTimeSale(item.timeSaleId)} />
      </section>
    </div>
  );
}
