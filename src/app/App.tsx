import { useEffect, useMemo, useState } from 'react';
import { LogOut, Plus, Store } from 'lucide-react';
import type { CreateStoreRequest, CrowdStatusRequest, PromotionDetail, PromotionRequest, StoreDetail, TimeSale, TimeSaleRequest } from '../entities/owner/types';
import type { AuthMode, MenuKey, MerchantData, MockAccount, Session, SignupDraft } from '../entities/owner/types/ui';
import { createEmptyMerchantData, initialAccounts, merchantByToken } from '../entities/owner/model/mockData';
import { ownerApi } from '../entities/owner/api';
import { AuthScreen } from '../pages/auth/ui/AuthScreen';
import { DashboardPage } from '../pages/dashboard/ui/DashboardPage';
import { StorePage } from '../pages/store/ui/StorePage';
import { TimeSalePage } from '../pages/time-sale/ui/TimeSalePage';
import { PromotionPage } from '../pages/promotion/ui/PromotionPage';
import { LayoutDashboard, Megaphone, Tag } from 'lucide-react';
import { Toast, type ToastState } from '../shared/ui/Toast';

const menuItems = [
  { key: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { key: 'store' as const, label: '가게 등록', icon: Store },
  { key: 'timesale' as const, label: '타임세일', icon: Tag },
  { key: 'promotion' as const, label: '가게 홍보 등록', icon: Megaphone },
];

const getRequestFailureMessage = (error: unknown) => {
  const rawMessage = error instanceof Error ? error.message : '알 수 없는 오류';
  if (rawMessage.includes('Failed to fetch')) {
    return '서버 요청이 브라우저에서 차단되었습니다. API 서버 CORS 또는 네트워크 설정을 확인해야 합니다.';
  }
  if (rawMessage.includes('401') || rawMessage.includes('403')) {
    return '서버가 요청을 거절했습니다. 실제 로그인 토큰으로 다시 확인해야 합니다.';
  }
  if (rawMessage.includes('404')) {
    return '서버에서 해당 타임세일을 찾지 못했습니다. 더미 ID와 서버 ID가 다를 수 있습니다.';
  }
  return rawMessage;
};

export function App() {
  const [accounts, setAccounts] = useState<MockAccount[]>(initialAccounts);
  const [session, setSession] = useState<Session | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [editingTimeSaleId, setEditingTimeSaleId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const pageTitle = useMemo(
    () => menuItems.find((item) => item.key === activeMenu)?.label ?? '대시보드',
    [activeMenu],
  );

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleLogin = (loginId: string, password: string) => {
    const account = accounts.find((item) => item.loginId === loginId.trim() && item.password === password);

    if (!account) return false;

    void ownerApi.login({ loginId, password }).catch(() => undefined);
    setSession({ accessToken: account.accessToken, tokenType: account.tokenType, loginId: account.loginId });
    setMerchantData(merchantByToken[account.accessToken] ?? createEmptyMerchantData());
    setActiveMenu(merchantByToken[account.accessToken]?.store ? 'dashboard' : 'store');
    return true;
  };

  const handleSignup = (draft: SignupDraft) => {
    const accessToken = `mock-token-new-${Date.now()}`;
    const openingHours = `${draft.openingTime} - ${draft.closingTime}`;
    const nextStore: StoreDetail = {
      storeId: Date.now(),
      name: draft.name,
      category: draft.category,
      description: draft.description,
      address: draft.address,
      phone: draft.phone,
      openingHours,
      latitude: draft.latitude,
      longitude: draft.longitude,
      crowdStatus: { level: 'RELAXED', label: '여유', estimatedWaitingMinutes: 0 },
      status: 'PENDING_APPROVAL',
    };

    void ownerApi.signUp({ loginId: draft.loginId, password: draft.password })
      .then(() => ownerApi.createStore(accessToken, {
        name: draft.name,
        category: draft.category,
        description: draft.description,
        address: draft.address,
        latitude: draft.latitude,
        longitude: draft.longitude,
        phone: draft.phone,
        openingHours,
      }))
      .catch(() => undefined);

    setAccounts((prev) => [...prev, { loginId: draft.loginId, password: draft.password, accessToken, tokenType: 'Bearer' }]);
    setSession({ accessToken, tokenType: 'Bearer', loginId: draft.loginId });
    setMerchantData({ store: nextStore, timeSales: [], promotions: [] });
    setActiveMenu('store');
  };

  const handleLogout = () => {
    setSession(null);
    setMerchantData(null);
    setActiveMenu('dashboard');
    setAuthMode('login');
    showToast('로그아웃되었습니다.', 'success');
  };

  const updateStore = (patch: Partial<StoreDetail>) => {
    setMerchantData((prev) => (prev ? { ...prev, store: prev.store ? { ...prev.store, ...patch } : null } : prev));
  };

  const submitStore = async (body: CreateStoreRequest, crowdStatus: CrowdStatusRequest) => {
    if (!session) return;

    if (merchantData?.store?.storeId) {
      let warning: string | undefined;
      let updatedStore: StoreDetail | undefined;
      let updatedCrowdStatus = merchantData.store.crowdStatus;
      try {
        updatedStore = await ownerApi.updateStore(session.accessToken, merchantData.store.storeId, {
          description: body.description,
          phone: body.phone,
          openingHours: body.openingHours,
        });
        updatedCrowdStatus = await ownerApi.updateCrowdStatus(session.accessToken, merchantData.store.storeId, crowdStatus);
      } catch (error) {
        warning = getRequestFailureMessage(error);
      }
      updateStore({ ...(updatedStore ?? body), crowdStatus: updatedCrowdStatus ?? { level: crowdStatus.level, estimatedWaitingMinutes: crowdStatus.estimatedWaitingMinutes } });
      return warning;
    }

    let warning: string | undefined;
    let createdStore: StoreDetail | undefined;
    try {
      createdStore = await ownerApi.createStore(session.accessToken, body);
      if (createdStore.storeId) {
        const updatedCrowdStatus = await ownerApi.updateCrowdStatus(session.accessToken, createdStore.storeId, crowdStatus);
        createdStore = { ...createdStore, crowdStatus: updatedCrowdStatus };
      }
    } catch (error) {
      warning = getRequestFailureMessage(error);
    }
    const nextStore: StoreDetail = createdStore ?? {
      storeId: Date.now(),
      status: 'PENDING_APPROVAL',
      crowdStatus: { level: crowdStatus.level, estimatedWaitingMinutes: crowdStatus.estimatedWaitingMinutes },
      ...body,
    };
    setMerchantData((prev) => (prev ? { ...prev, store: nextStore } : prev));
    return warning;
  };

  const submitTimeSale = async (body: TimeSaleRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    let warning: string | undefined;
    const created = await ownerApi.createTimeSale(session.accessToken, merchantData.store.storeId, body).catch((error) => {
      warning = getRequestFailureMessage(error);
      return undefined;
    });
    const nextTimeSale: TimeSale = created ?? {
      ...body,
      timeSaleId: Date.now(),
      storeId: merchantData.store.storeId,
      status: 'SCHEDULED',
    };
    setMerchantData((prev) => (prev ? { ...prev, timeSales: [nextTimeSale, ...prev.timeSales] } : prev));
    return warning;
  };

  const closeTimeSale = async (timeSaleId: number) => {
    if (!session) return;
    let warning: string | undefined;
    try {
      const closedTimeSale = await ownerApi.closeTimeSale(session.accessToken, timeSaleId);
      setMerchantData((prev) => (prev ? {
        ...prev,
        timeSales: prev.timeSales.map((item) => item.timeSaleId === timeSaleId ? closedTimeSale : item),
      } : prev));
    } catch (error) {
      warning = getRequestFailureMessage(error);
      setMerchantData((prev) => (prev ? {
        ...prev,
        timeSales: prev.timeSales.map((item) => item.timeSaleId === timeSaleId ? { ...item, status: 'ENDED' } : item),
      } : prev));
    }
    if (warning) showToast(warning, 'error');
    else showToast('타임세일을 종료했습니다.', 'success');
  };

  const updateTimeSale = async (timeSaleId: number, body: TimeSaleRequest) => {
    if (!session) return;
    let warning: string | undefined;
    let updatedTimeSale: TimeSale | undefined;
    try {
      updatedTimeSale = await ownerApi.updateTimeSale(session.accessToken, timeSaleId, body);
    } catch (error) {
      warning = getRequestFailureMessage(error);
    }
    setMerchantData((prev) => (prev ? {
      ...prev,
      timeSales: prev.timeSales.map((item) => item.timeSaleId === timeSaleId ? (updatedTimeSale ?? { ...item, ...body }) : item),
    } : prev));
    return warning;
  };

  const submitPromotion = async (body: PromotionRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    let warning: string | undefined;
    const created = await ownerApi.createPromotion(session.accessToken, merchantData.store.storeId, body).catch((error) => {
      warning = getRequestFailureMessage(error);
      return undefined;
    });
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
    return warning;
  };

  const openTimeSalePage = () => {
    setActiveMenu('timesale');
  };

  const editTimeSaleFromDashboard = (timeSaleId: number) => {
    setEditingTimeSaleId(timeSaleId);
    setActiveMenu('timesale');
  };

  if (!session || !merchantData) {
    return (
      <>
        <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onSignup={handleSignup} onNotify={showToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-mark" src="/ohshu.svg" alt="OSHU 로고" />
        </div>

        <nav className="nav-list" aria-label="점주센터 메뉴">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.key} className={`nav-item ${activeMenu === item.key ? 'active' : ''}`} onClick={() => setActiveMenu(item.key)}><Icon size={18} />{item.label}</button>;
          })}
        </nav>

        <div className="owner-card">
          <div className="owner-icon"><Store size={21} /></div>
          <div><strong>{merchantData.store?.name || '가게 미등록'}</strong><p>{session.loginId}</p></div>
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
          {activeMenu === 'dashboard' && <DashboardPage merchantData={merchantData} setActiveMenu={setActiveMenu} onEditTimeSale={editTimeSaleFromDashboard} />}
          {activeMenu === 'store' && <StorePage store={merchantData.store} onSubmit={submitStore} onNotify={showToast} />}
          {activeMenu === 'timesale' && (
            <TimeSalePage
              timeSales={merchantData.timeSales}
              onSubmit={submitTimeSale}
              onUpdate={updateTimeSale}
              onClose={closeTimeSale}
              editingTimeSaleId={editingTimeSaleId}
              onEditConsumed={() => setEditingTimeSaleId(null)}
              onNotify={showToast}
            />
          )}
          {activeMenu === 'promotion' && <PromotionPage promotions={merchantData.promotions} onSubmit={submitPromotion} onNotify={showToast} />}
        </section>
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
