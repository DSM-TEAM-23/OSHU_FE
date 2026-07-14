import { useEffect, useMemo, useState } from 'react';
import { LogOut, MessageSquareText, Plus, Store } from 'lucide-react';
import type { CreateStoreRequest, CrowdStatusRequest, Inquiry, PromotionDetail, PromotionRequest, StoreDetail, TimeSale, TimeSaleRequest } from '../entities/owner/types';
import type { AuthMode, MenuKey, MerchantData, Session, SignupDraft } from '../entities/owner/types/ui';
import { createEmptyMerchantData } from '../entities/owner/model/mockData';
import { ApiError, ownerApi } from '../entities/owner/api';
import { AuthScreen } from '../pages/auth/ui/AuthScreen';
import { DashboardPage } from '../pages/dashboard/ui/DashboardPage';
import { StorePage } from '../pages/store/ui/StorePage';
import { TimeSalePage } from '../pages/time-sale/ui/TimeSalePage';
import { PromotionPage } from '../pages/promotion/ui/PromotionPage';
import { InquiryPage } from '../pages/inquiry/ui/InquiryPage';
import { LayoutDashboard, Megaphone, Tag } from 'lucide-react';
import { Toast, type ToastState } from '../shared/ui/Toast';

const SESSION_STORAGE_KEY = 'oshu-owner-session';

const menuItems = [
  { key: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { key: 'store' as const, label: '가게 등록', icon: Store },
  { key: 'timesale' as const, label: '타임세일', icon: Tag },
  { key: 'promotion' as const, label: '가게 홍보 등록', icon: Megaphone },
  { key: 'inquiry' as const, label: '문의 관리', icon: MessageSquareText },
];

const getRequestFailureMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return '권한이 없거나 로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
    }
    if (error.status === 404) {
      return '서버에서 요청한 데이터를 찾지 못했습니다.';
    }
    return error.message;
  }
  const rawMessage = error instanceof Error ? error.message : '알 수 없는 오류';
  if (rawMessage.includes('Failed to fetch')) {
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
  if (rawMessage.includes('401') || rawMessage.includes('403')) {
    return '권한이 없거나 로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
  }
  if (rawMessage.includes('404')) {
    return '서버에서 요청한 데이터를 찾지 못했습니다.';
  }
  const serverMessage = rawMessage.match(/"message"\s*:\s*"([^"]+)"/)?.[1];
  if (serverMessage) return serverMessage;
  return rawMessage;
};

const readStoredSession = (): Session | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.accessToken || !parsed.loginId) return null;
    return {
      accessToken: parsed.accessToken,
      tokenType: parsed.tokenType,
      loginId: parsed.loginId,
    };
  } catch {
    return null;
  }
};

const storeSession = (session: Session) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
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

  useEffect(() => {
    const restoreSession = async () => {
      const storedSession = readStoredSession();
      if (!storedSession) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const restoredMerchantData = await loadMerchantData(storedSession.accessToken);
        setSession(storedSession);
        setMerchantData(restoredMerchantData);
        setActiveMenu(restoredMerchantData.store ? 'dashboard' : 'store');
      } catch {
        clearStoredSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    void restoreSession();
  }, []);

  const loadMerchantData = async (accessToken: string) => {
    const stores = await ownerApi.getMyStores(accessToken);
    const firstStore = stores[0];

    if (!firstStore?.storeId) {
      return createEmptyMerchantData();
    }

    const [store, inquiries] = await Promise.all([
      ownerApi.getMyStore(accessToken, firstStore.storeId),
      ownerApi.getStoreInquiries(accessToken, firstStore.storeId).catch(() => [] as Inquiry[]),
    ]);
    return {
      store,
      timeSales: store.timeSales ?? [],
      promotions: store.promotions ?? [],
      inquiries,
    };
  };

  const handleLogin = async (loginId: string, password: string) => {
    const trimmedLoginId = loginId.trim();
    let token: Awaited<ReturnType<typeof ownerApi.login>>;

    try {
      token = await ownerApi.login({ loginId: trimmedLoginId, password });
    } catch (error) {
      return { ok: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }

    setSession({ accessToken: token.accessToken, tokenType: token.tokenType, loginId: trimmedLoginId });
    storeSession({ accessToken: token.accessToken, tokenType: token.tokenType, loginId: trimmedLoginId });

    try {
      const nextMerchantData = await loadMerchantData(token.accessToken);
      setMerchantData(nextMerchantData);
      setActiveMenu(nextMerchantData.store ? 'dashboard' : 'store');
      return { ok: true };
    } catch (error) {
      setMerchantData(createEmptyMerchantData());
      setActiveMenu('store');
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return { ok: true, message: '로그인은 성공했지만 점주 권한 확인에 실패했습니다.', notifyType: 'error' as const };
      }
      return { ok: true, message: '로그인은 성공했지만 가게 정보를 불러오지 못했습니다.', notifyType: 'error' as const };
    }
  };

  const handleSignup = async (draft: SignupDraft) => {
    const openingHours = `${draft.openingTime} - ${draft.closingTime}`;

    try {
      await ownerApi.signUp({ loginId: draft.loginId.trim(), password: draft.password });
      const token = await ownerApi.login({ loginId: draft.loginId.trim(), password: draft.password });
      const createdStore = await ownerApi.createStore(token.accessToken, {
        name: draft.name,
        category: draft.category,
        customCategory: draft.category === '기타' ? draft.customCategory?.trim() : undefined,
        description: draft.description,
        address: draft.address,
        phone: draft.phone,
        openingHours,
      });

      setSession({ accessToken: token.accessToken, tokenType: token.tokenType, loginId: draft.loginId.trim() });
      storeSession({ accessToken: token.accessToken, tokenType: token.tokenType, loginId: draft.loginId.trim() });
      setMerchantData({
        store: createdStore,
        timeSales: createdStore.timeSales ?? [],
        promotions: createdStore.promotions ?? [],
        inquiries: [],
      });
      setActiveMenu('dashboard');
      return { ok: true, message: '회원가입과 가게 등록이 완료되었습니다.' };
    } catch (error) {
      return { ok: false, message: getRequestFailureMessage(error) };
    }
  };

  const handleLogout = () => {
    setSession(null);
    setMerchantData(null);
    clearStoredSession();
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
          name: body.name,
          category: body.category,
          customCategory: body.category === '기타' ? body.customCategory?.trim() : undefined,
          address: body.address,
          description: body.description,
          phone: body.phone,
          openingHours: body.openingHours,
        });
        updatedCrowdStatus = await ownerApi.updateCrowdStatus(session.accessToken, merchantData.store.storeId, crowdStatus);
      } catch (error) {
        warning = getRequestFailureMessage(error);
      }
      if (warning) return warning;
      updateStore({ ...(updatedStore ?? body), crowdStatus: updatedCrowdStatus ?? { level: crowdStatus.level, estimatedWaitingMinutes: crowdStatus.estimatedWaitingMinutes } });
      return undefined;
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
    if (warning || !createdStore) return warning ?? '가게 등록에 실패했습니다.';
    setMerchantData((prev) => (prev
      ? {
        ...prev,
        store: createdStore,
        timeSales: createdStore.timeSales ?? prev.timeSales,
        promotions: createdStore.promotions ?? prev.promotions,
        inquiries: prev.inquiries,
      }
      : {
        store: createdStore,
        timeSales: createdStore.timeSales ?? [],
        promotions: createdStore.promotions ?? [],
        inquiries: [],
      }));
    setActiveMenu('dashboard');
    return undefined;
  };

  const submitTimeSale = async (body: TimeSaleRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    let warning: string | undefined;
    const created = await ownerApi.createTimeSale(session.accessToken, merchantData.store.storeId, body)
      .catch((error) => {
        warning = getRequestFailureMessage(error);
        return undefined;
      });
    if (warning || !created) return warning ?? '타임세일 등록에 실패했습니다.';
    setMerchantData((prev) => (prev ? { ...prev, timeSales: [created, ...prev.timeSales] } : prev));
    return undefined;
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
    if (warning) return warning;
    setMerchantData((prev) => (prev ? {
      ...prev,
      timeSales: prev.timeSales.map((item) => item.timeSaleId === timeSaleId ? (updatedTimeSale ?? item) : item),
    } : prev));
    return undefined;
  };

  const submitPromotion = async (body: PromotionRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    let warning: string | undefined;
    const created = await ownerApi.createPromotion(session.accessToken, merchantData.store.storeId, body)
      .catch((error) => {
        warning = getRequestFailureMessage(error);
        return undefined;
      });
    if (warning || !created) return warning ?? '홍보 게시물 등록에 실패했습니다.';
    setMerchantData((prev) => (prev ? { ...prev, promotions: [created, ...prev.promotions] } : prev));
    return undefined;
  };

  const uploadPromotionImage = async (image: File) => {
    if (!session) {
      throw new Error('로그인 세션이 필요합니다.');
    }
    const response = await ownerApi.uploadImage(session.accessToken, image);
    return response.imageUrl;
  };

  const updatePromotion = async (promotionId: number, body: PromotionRequest) => {
    if (!session || !merchantData?.store?.storeId) return;
    let warning: string | undefined;
    let updatedPromotion: PromotionDetail | undefined;
    try {
      updatedPromotion = await ownerApi.updatePromotion(session.accessToken, promotionId, body);
    } catch (error) {
      warning = getRequestFailureMessage(error);
    }
    if (warning) return warning;

    setMerchantData((prev) => (prev ? {
      ...prev,
      promotions: prev.promotions.map((item) => item.promotionId === promotionId
        ? (updatedPromotion ?? item)
        : item),
    } : prev));
    return undefined;
  };

  const openTimeSalePage = () => {
    setActiveMenu('timesale');
  };

  const editTimeSaleFromDashboard = (timeSaleId: number) => {
    setEditingTimeSaleId(timeSaleId);
    setActiveMenu('timesale');
  };

  if (isBootstrapping) {
    return (
      <>
        <main className="auth-page">
          <section className="auth-card wide-auth-card">
            <div className="brand auth-brand">
              <img className="brand-mark" src="/ohshu.svg" alt="OSHU 로고" />
            </div>
            <p className="auth-help">이전 로그인 정보를 확인하고 있습니다.</p>
          </section>
        </main>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

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
          {activeMenu === 'promotion' && (
            <PromotionPage
              promotions={merchantData.promotions}
              onSubmit={submitPromotion}
              onUpdate={updatePromotion}
              onUploadImage={uploadPromotionImage}
              onNotify={showToast}
            />
          )}
          {activeMenu === 'inquiry' && (
            <InquiryPage
              store={merchantData.store}
              inquiries={merchantData.inquiries}
              onRefresh={async () => {
                if (!session || !merchantData.store?.storeId) return '가게 정보가 필요합니다.';
                try {
                  const inquiries = await ownerApi.getStoreInquiries(session.accessToken, merchantData.store.storeId);
                  setMerchantData((prev) => (prev ? { ...prev, inquiries } : prev));
                  return undefined;
                } catch (error) {
                  return getRequestFailureMessage(error);
                }
              }}
              onLoadDetail={async (inquiryId) => {
                if (!session) throw new Error('로그인 세션이 필요합니다.');
                return ownerApi.getInquiry(session.accessToken, inquiryId);
              }}
              onNotify={showToast}
            />
          )}
        </section>
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
