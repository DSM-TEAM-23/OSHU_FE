import { useMemo, useState } from 'react';
import { Bell, LogOut, Plus, Store } from 'lucide-react';
import type { StoreDetail } from '../entities/owner/types';
import type { AuthMode, MenuKey, MerchantData, MockAccount, Session, SignupDraft } from '../entities/owner/types/ui';
import { createEmptyMerchantData, initialAccounts, merchantByToken } from '../entities/owner/model/mockData';
import { storeStatusLabel } from '../shared/lib/format';
import { AuthScreen } from '../pages/auth/ui/AuthScreen';
import { DashboardPage } from '../pages/dashboard/ui/DashboardPage';
import { StorePage } from '../pages/store/ui/StorePage';
import { TimeSalePage } from '../pages/time-sale/ui/TimeSalePage';
import { PromotionPage } from '../pages/promotion/ui/PromotionPage';
import { LayoutDashboard, Megaphone, Tag } from 'lucide-react';

const menuItems = [
  { key: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { key: 'store' as const, label: '가게 등록', icon: Store },
  { key: 'timesale' as const, label: '타임세일', icon: Tag },
  { key: 'promotion' as const, label: '가게 홍보 등록', icon: Megaphone },
];

export function App() {
  const [accounts, setAccounts] = useState<MockAccount[]>(initialAccounts);
  const [session, setSession] = useState<Session | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');

  const pageTitle = useMemo(
    () => menuItems.find((item) => item.key === activeMenu)?.label ?? '대시보드',
    [activeMenu],
  );

  const handleLogin = (loginId: string, password: string) => {
    const account = accounts.find((item) => item.loginId === loginId.trim() && item.password === password);

    if (!account) return false;

    setSession({ accessToken: account.accessToken, refreshToken: account.refreshToken, loginId: account.loginId });
    setMerchantData(merchantByToken[account.accessToken] ?? createEmptyMerchantData());
    setActiveMenu(merchantByToken[account.accessToken]?.store ? 'dashboard' : 'store');
    return true;
  };

  const handleSignup = (draft: SignupDraft) => {
    const accessToken = `mock-token-new-${Date.now()}`;
    const refreshToken = `mock-refresh-${Date.now()}`;
    const nextStore: StoreDetail = {
      storeId: Date.now(),
      name: draft.name,
      businessNumber: draft.businessNumber,
      category: draft.category,
      description: draft.description,
      address: draft.address,
      phone: draft.phone,
      openingHours: draft.openingHours,
      status: 'PENDING_APPROVAL',
      activePromotionCount: 0,
      imageUrls: [],
    };

    setAccounts((prev) => [...prev, { loginId: draft.loginId, password: draft.password, accessToken, refreshToken }]);
    setSession({ accessToken, refreshToken, loginId: draft.loginId });
    setMerchantData({ store: nextStore, timeSales: [], promotions: [] });
    setActiveMenu('store');
  };

  const handleLogout = () => {
    setSession(null);
    setMerchantData(null);
    setActiveMenu('dashboard');
    setAuthMode('login');
  };

  const updateStore = (patch: Partial<StoreDetail>) => {
    setMerchantData((prev) => (prev ? { ...prev, store: prev.store ? { ...prev.store, ...patch } : null } : prev));
  };

  const addTimeSale = () => {
    setMerchantData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timeSales: [
          {
            timeSaleId: Date.now(),
            productName: '당일 생산 베이커리',
            originalPrice: 5000,
            salePrice: 3500,
            startAt: '2026-07-13T16:00:00',
            endAt: '2026-07-13T17:00:00',
            notice: '매장 방문 고객에 한함',
            status: 'SCHEDULED',
          },
          ...prev.timeSales,
        ],
      };
    });
    setActiveMenu('timesale');
  };

  if (!session || !merchantData) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <div><strong>OSHU</strong><span>점주센터</span></div>
        </div>

        <nav className="nav-list" aria-label="점주센터 메뉴">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.key} className={`nav-item ${activeMenu === item.key ? 'active' : ''}`} onClick={() => setActiveMenu(item.key)}><Icon size={18} />{item.label}</button>;
          })}
        </nav>

        <div className="owner-card">
          <div className="owner-icon"><Store size={21} /></div>
          <div><strong>{merchantData.store?.name || '가게 미등록'}</strong><p>{session.loginId} · {storeStatusLabel(merchantData.store?.status)}</p></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">OSHU Business</p><h1>{pageTitle}</h1></div>
          <div className="topbar-actions">
            <button className="ghost-button"><Bell size={18} />알림</button>
            <button className="primary-button" onClick={addTimeSale}><Plus size={18} />타임세일 등록</button>
            <button className="ghost-button" onClick={handleLogout}><LogOut size={18} />로그아웃</button>
          </div>
        </header>

        <section className="workspace">
          {activeMenu === 'dashboard' && <DashboardPage merchantData={merchantData} setActiveMenu={setActiveMenu} />}
          {activeMenu === 'store' && <StorePage store={merchantData.store} updateStore={updateStore} />}
          {activeMenu === 'timesale' && <TimeSalePage timeSales={merchantData.timeSales} setTimeSales={(timeSales) => setMerchantData((prev) => (prev ? { ...prev, timeSales } : prev))} />}
          {activeMenu === 'promotion' && <PromotionPage promotions={merchantData.promotions} />}
        </section>
      </main>
    </div>
  );
}
