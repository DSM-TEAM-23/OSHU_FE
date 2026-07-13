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
          <p>오늘 필요한 운영 상태만 간단히 보여줍니다.</p>
        </div>
        <div className="hero-status">
          <CheckCircle2 size={22} />
          <strong>{storeStatusLabel(merchantData.store?.status)}</strong>
          <span>{merchantData.store ? '노출 가능' : '등록 필요'}</span>
        </div>
      </section>

      <div className="summary-grid">
        <SummaryCard title="등록 상태" value={storeStatusLabel(merchantData.store?.status)} detail="가게 노출 준비 상태" icon={ShieldCheck} />
        <SummaryCard title="진행 타임세일" value={`${activeTimeSale ? 1 : 0}건`} detail={activeTimeSale?.productName ?? '진행 중인 행사 없음'} icon={Tag} />
        <SummaryCard title="홍보 게시물" value={`${merchantData.promotions.length}건`} detail="현재 등록된 소식" icon={Megaphone} />
        <SummaryCard title="최근 수정" value="14:18" detail="오늘 저장된 변경사항" icon={Clock3} />
      </div>

      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">빠른 작업</p><h3>주요 작업</h3></div></div>
        <div className="quick-actions">
          <QuickAction icon={Store} title="가게 정보 수정" detail="주소, 연락처, 소개" onClick={() => setActiveMenu('store')} />
          <QuickAction icon={Tag} title="타임세일 등록" detail="상품, 가격, 시간" onClick={() => setActiveMenu('timesale')} />
          <QuickAction icon={Megaphone} title="홍보 게시물 등록" detail="이벤트, 공지, 신메뉴" onClick={() => setActiveMenu('promotion')} />
        </div>
      </section>

      <section className="card">
        <div className="section-heading"><div><p className="eyebrow">타임세일 현황</p><h3>최근 행사</h3></div><button className="ghost-button" onClick={() => setActiveMenu('timesale')}>전체 보기</button></div>
        <TimeSaleTable items={merchantData.timeSales} compact />
      </section>
    </div>
  );
}
