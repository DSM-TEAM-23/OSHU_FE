import { CheckCircle2, Clock3, Megaphone, ShieldCheck, Store, Tag } from 'lucide-react';
import type { MerchantData, MenuKey } from '../../../entities/owner/types/ui';
import { QuickAction, SummaryCard } from '../../../shared/ui/cards';
import { TimeSaleTable } from '../../../shared/ui/tables';
import { storeStatusLabel } from '../../../shared/lib/format';

export function DashboardPage({ merchantData, setActiveMenu }: { merchantData: MerchantData; setActiveMenu: (menu: MenuKey) => void }) {
  const activeTimeSale = merchantData.timeSales.find((item) => item.status === 'ACTIVE');

  return (
    <div className="panel-stack">
      <section className="hero-card">
        <div>
          <span className="live-pill">관리 현황</span>
          <h2>{merchantData.store?.name || '가게 등록 필요'} 관리 현황</h2>
          <p>로그인한 점주 토큰에 연결된 가게 정보와 진행 중인 타임세일, 홍보 게시물 상태를 확인합니다.</p>
        </div>
        <div className="hero-status">
          <CheckCircle2 size={22} />
          <strong>{storeStatusLabel(merchantData.store?.status)}</strong>
          <span>{merchantData.store ? '노출 가능' : '등록 필요'}</span>
        </div>
      </section>

      <div className="summary-grid">
        <SummaryCard title="등록 상태" value={storeStatusLabel(merchantData.store?.status)} detail="토큰 기준 가게 정보" icon={ShieldCheck} />
        <SummaryCard title="진행 타임세일" value={`${activeTimeSale ? 1 : 0}건`} detail={activeTimeSale?.productName ?? '진행 중인 행사 없음'} icon={Tag} />
        <SummaryCard title="홍보 게시물" value={`${merchantData.promotions.length}건`} detail="가게 상세·홍보 피드 노출" icon={Megaphone} />
        <SummaryCard title="최근 수정" value="14:18" detail="오늘 저장된 변경사항" icon={Clock3} />
      </div>

      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">빠른 작업</p><h3>주요 작업</h3></div></div>
        <div className="quick-actions">
          <QuickAction icon={Store} title="가게 정보 수정" detail="가게 기본 정보" onClick={() => setActiveMenu('store')} />
          <QuickAction icon={Tag} title="타임세일 등록" detail="TimeSale" onClick={() => setActiveMenu('timesale')} />
          <QuickAction icon={Megaphone} title="홍보 게시물 등록" detail="Promotion" onClick={() => setActiveMenu('promotion')} />
        </div>
      </section>

      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">타임세일 현황</p><h3>최근 행사</h3></div><button className="ghost-button" onClick={() => setActiveMenu('timesale')}>전체 보기</button></div>
        <TimeSaleTable items={merchantData.timeSales} compact />
      </section>
    </div>
  );
}
