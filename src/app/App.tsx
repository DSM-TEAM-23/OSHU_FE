import { useMemo, useState } from 'react';
import { LogOut, Plus, Store } from 'lucide-react';
import type { CreateStoreRequest, PromotionDetail, PromotionRequest, StoreDetail, TimeSale, TimeSaleRequest } from '../entities/owner/types';
import type { AuthMode, MenuKey, MerchantData, MockAccount, Session, SignupDraft } from '../entities/owner/types/ui';
import { createEmptyMerchantData, initialAccounts, merchantByToken } from '../entities/owner/model/mockData';
import { ownerApi } from '../entities/owner/api';
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

    void ownerApi.login({ loginId, password }).catch(() => undefined);
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

    void ownerApi.signUp({ loginId: draft.loginId, password: draft.password })
      .then(() => ownerApi.createStore(accessToken, {
        name: draft.name,
        businessNumber: draft.businessNumber,
        category: draft.category,
        description: draft.description,
        address: draft.address,
        latitude: draft.latitude,
        longitude: draft.longitude,
        phone: draft.phone,
        openingHours: draft.openingHours,
      }))
      .catch(() => undefined);

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

  const submitStore = async (body: CreateStoreRequest) => {
    if (!session) return;

    if (merchantData?.store?.storeId) {
      await ownerApi.updateStore(session.accessToken, merchantData.store.storeId, {
        description: body.description,
        phone: body.phone,
        openingHours: body.openingHours,
      }).catch(() => undefined);
      updateStore(body);
      return;
    }

    await ownerApi.createStore(session.accessToken, body).catch(() => undefined);
    const nextStore: StoreDetail = {
      storeId: Date.now(),
      status: 'PENDING_APPROVAL',
      activePromotionCount: 0,
      imageUrls: [],
      ...body,
    };
    setMerchantData((prev) => (prev ? { ...prev, store: nextStore } : prev));
  };

  const submitTimeSale = async (body: TimeSaleRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    const created = await ownerApi.createTimeSale(session.accessToken, merchantData.store.storeId, body).catch(() => undefined);
    const nextTimeSale: TimeSale = created ?? {
      ...body,
      timeSaleId: Date.now(),
      status: 'SCHEDULED',
    };
    setMerchantData((prev) => (prev ? { ...prev, timeSales: [nextTimeSale, ...prev.timeSales] } : prev));
  };

  const closeTimeSale = async (timeSaleId: number) => {
    if (!session) return;
    await ownerApi.closeTimeSale(session.accessToken, timeSaleId).catch(() => undefined);
    setMerchantData((prev) => (prev ? {
      ...prev,
      timeSales: prev.timeSales.map((item) => item.timeSaleId === timeSaleId ? { ...item, status: 'ENDED' } : item),
    } : prev));
  };

  const submitPromotion = async (body: PromotionRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    const created = await ownerApi.createPromotion(session.accessToken, merchantData.store.storeId, body).catch(() => undefined);
    const nextPromotion: PromotionDetail = created ?? {
      promotionId: Date.now(),
      storeId: merchantData.store.storeId,
      storeName: merchantData.store.name,
      type: body.type,
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl,
      startAt: body.startAt,
      endAt: body.endAt,
      status: 'SCHEDULED',
    };
    setMerchantData((prev) => (prev ? { ...prev, promotions: [nextPromotion, ...prev.promotions] } : prev));
  };

  const openTimeSalePage = () => {
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
            <button className="primary-button" onClick={openTimeSalePage}><Plus size={18} />타임세일 등록</button>
            <button className="ghost-button" onClick={handleLogout}><LogOut size={18} />로그아웃</button>
          </div>
        </header>

        <section className="workspace">
          {activeMenu === 'dashboard' && <DashboardPage merchantData={merchantData} setActiveMenu={setActiveMenu} />}
          {activeMenu === 'store' && <StorePage store={merchantData.store} onSubmit={submitStore} />}
          {activeMenu === 'timesale' && <TimeSalePage timeSales={merchantData.timeSales} onSubmit={submitTimeSale} onClose={closeTimeSale} />}
          {activeMenu === 'promotion' && <PromotionPage promotions={merchantData.promotions} onSubmit={submitPromotion} />}
        </section>
      </main>
    </div>
  );
}
