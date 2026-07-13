import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Tag,
} from 'lucide-react';
import './styles.css';

type MenuKey = 'dashboard' | 'store' | 'timesale' | 'promotion';
type Status = '진행중' | '예약됨' | '종료됨' | '검토중';
type AuthMode = 'login' | 'signup';

type Session = {
  token: string;
  accountId: string;
  ownerName: string;
};

type Account = {
  accountId: string;
  password: string;
  ownerName: string;
  token: string;
};

type SignupDraft = {
  accountId: string;
  password: string;
  passwordConfirm: string;
  ownerName: string;
  phone: string;
  businessNumber: string;
  storeName: string;
  category: string;
  address: string;
  contact: string;
  openingHours: string;
  closedDay: string;
  description: string;
};

type TimeSale = {
  id: number;
  product: string;
  title: string;
  originalPrice: string;
  salePrice: string;
  quantity: number;
  period: string;
  status: Status;
};

type Notice = {
  id: number;
  type: string;
  title: string;
  period: string;
  status: Status;
};

type MerchantData = {
  storeName: string;
  category: string;
  businessNumber: string;
  description: string;
  approvalStatus: '승인 완료' | '검토중';
  timeSales: TimeSale[];
  notices: Notice[];
};

const menuItems = [
  { key: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { key: 'store' as const, label: '가게 등록', icon: Store },
  { key: 'timesale' as const, label: '타임세일', icon: Tag },
  { key: 'promotion' as const, label: '가게 홍보 등록', icon: Megaphone },
];

const initialAccounts: Account[] = [
  { accountId: 'oshu_bakery', password: 'pass1234', ownerName: '김점주', token: 'mock-token-bakery' },
  { accountId: 'oshu_kitchen', password: 'pass1234', ownerName: '이점주', token: 'mock-token-restaurant' },
];

const merchantByToken: Record<string, MerchantData> = {
  'mock-token-bakery': {
    storeName: 'OSHU 베이커리 유성점',
    category: '베이커리·카페',
    businessNumber: '123-45-67890',
    description: '유성구 궁동에 위치한 베이커리 카페입니다. 매장 기본 정보와 행사 정보를 관리합니다.',
    approvalStatus: '승인 완료',
    timeSales: [
      {
        id: 1,
        product: '클래식 크루아상',
        title: '평일 오후 타임세일',
        originalPrice: '4,500원',
        salePrice: '2,800원',
        quantity: 18,
        period: '오늘 15:00 - 17:00',
        status: '진행중',
      },
      {
        id: 2,
        product: '사워도우 세트',
        title: '마감 전 재고 할인',
        originalPrice: '8,000원',
        salePrice: '5,900원',
        quantity: 10,
        period: '오늘 18:00 - 19:30',
        status: '예약됨',
      },
    ],
    notices: [
      { id: 1, type: '신메뉴', title: '신메뉴 판매 안내', period: '07.13 - 07.20', status: '진행중' },
      { id: 2, type: '공지', title: '정기 휴무 안내', period: '07.13 - 07.15', status: '예약됨' },
    ],
  },
  'mock-token-restaurant': {
    storeName: '오슈키친 궁동점',
    category: '음식점',
    businessNumber: '987-65-43210',
    description: '점심 식사와 저녁 세트를 운영하는 유성구 음식점입니다.',
    approvalStatus: '검토중',
    timeSales: [
      {
        id: 11,
        product: '점심 세트',
        title: '점심 비혼잡 시간 할인',
        originalPrice: '12,000원',
        salePrice: '9,900원',
        quantity: 25,
        period: '오늘 13:30 - 15:00',
        status: '예약됨',
      },
    ],
    notices: [{ id: 11, type: '이벤트', title: '신규 방문 쿠폰 안내', period: '07.13 - 07.31', status: '진행중' }],
  },
};

const createEmptyMerchantData = (): MerchantData => ({
  storeName: '',
  category: '베이커리·카페',
  businessNumber: '',
  description: '',
  approvalStatus: '검토중',
  timeSales: [],
  notices: [],
});

function App() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [session, setSession] = useState<Session | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');

  const pageTitle = useMemo(
    () => menuItems.find((item) => item.key === activeMenu)?.label ?? '대시보드',
    [activeMenu],
  );

  const handleLogin = (accountId: string, password: string) => {
    const account = accounts.find(
      (item) => item.accountId === accountId.trim() && item.password === password,
    );

    if (!account) {
      return false;
    }

    const nextMerchantData = merchantByToken[account.token] ?? createEmptyMerchantData();
    setSession({ token: account.token, accountId: account.accountId, ownerName: account.ownerName });
    setMerchantData(nextMerchantData);
    setActiveMenu(nextMerchantData.storeName ? 'dashboard' : 'store');
    return true;
  };

  const handleSignup = (draft: SignupDraft) => {
    const token = `mock-token-new-${Date.now()}`;
    const nextMerchantData: MerchantData = {
      storeName: draft.storeName,
      category: draft.category,
      businessNumber: draft.businessNumber,
      description: draft.description,
      approvalStatus: '검토중',
      timeSales: [],
      notices: [],
    };

    setAccounts((prev) => [
      ...prev,
      {
        accountId: draft.accountId,
        password: draft.password,
        ownerName: draft.ownerName,
        token,
      },
    ]);
    setSession({ token, accountId: draft.accountId, ownerName: draft.ownerName });
    setMerchantData(nextMerchantData);
    setActiveMenu('store');
  };

  const handleLogout = () => {
    setSession(null);
    setMerchantData(null);
    setActiveMenu('dashboard');
    setAuthMode('login');
  };

  const updateMerchantData = (patch: Partial<MerchantData>) => {
    setMerchantData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const addTimeSale = () => {
    setMerchantData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timeSales: [
          {
            id: Date.now(),
            product: '당일 생산 베이커리',
            title: '시간대 할인',
            originalPrice: '5,000원',
            salePrice: '3,500원',
            quantity: 20,
            period: '오늘 16:00 - 17:00',
            status: '예약됨',
          },
          ...prev.timeSales,
        ],
      };
    });
    setActiveMenu('timesale');
  };

  if (!session || !merchantData) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <div>
            <strong>OSHU</strong>
            <span>점주센터</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="점주센터 메뉴">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${activeMenu === item.key ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.key)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="owner-card">
          <div className="owner-icon">
            <Store size={21} />
          </div>
          <div>
            <strong>{merchantData.storeName || '가게 미등록'}</strong>
            <p>{session.ownerName} · {merchantData.approvalStatus}</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">OSHU Business</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button">
              <Bell size={18} />
              알림
            </button>
            <button className="primary-button" onClick={addTimeSale}>
              <Plus size={18} />
              타임세일 등록
            </button>
            <button className="ghost-button" onClick={handleLogout}>
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </header>

        <section className="workspace">
          {activeMenu === 'dashboard' && (
            <Dashboard merchantData={merchantData} setActiveMenu={setActiveMenu} />
          )}

          {activeMenu === 'store' && (
            <StorePanel merchantData={merchantData} updateMerchantData={updateMerchantData} />
          )}

          {activeMenu === 'timesale' && (
            <TimeSalePanel
              timeSales={merchantData.timeSales}
              setTimeSales={(timeSales) => updateMerchantData({ timeSales })}
            />
          )}

          {activeMenu === 'promotion' && <PromotionPanel notices={merchantData.notices} />}
        </section>
      </main>
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  onLogin,
  onSignup,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onLogin: (accountId: string, password: string) => boolean;
  onSignup: (draft: SignupDraft) => void;
}) {
  const [loginId, setLoginId] = useState('oshu_bakery');
  const [loginPassword, setLoginPassword] = useState('pass1234');
  const [loginError, setLoginError] = useState('');
  const [signupStep, setSignupStep] = useState(0);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [draft, setDraft] = useState<SignupDraft>({
    accountId: '',
    password: '',
    passwordConfirm: '',
    ownerName: '',
    phone: '',
    businessNumber: '',
    storeName: '',
    category: '베이커리·카페',
    address: '',
    contact: '',
    openingHours: '',
    closedDay: '',
    description: '',
  });

  const signupSteps = ['계정 정보', '사업자 정보', '가게 정보', '운영 정보'];

  const updateDraft = (patch: Partial<SignupDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const submitLogin = () => {
    const success = onLogin(loginId, loginPassword);
    setLoginError(success ? '' : '계정ID 또는 비밀번호를 확인해주세요.');
  };

  const canGoNext = () => {
    if (signupStep === 0) {
      return draft.accountId && draft.password && draft.password === draft.passwordConfirm && draft.ownerName && draft.phone;
    }
    if (signupStep === 1) {
      return draft.businessNumber && draft.storeName && draft.category;
    }
    if (signupStep === 2) {
      return draft.address && draft.contact && draft.description;
    }
    return draft.openingHours && draft.closedDay;
  };

  const openSignupModal = () => {
    setSignupStep(0);
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const submitSignup = () => {
    if (!canGoNext()) return;
    onSignup(draft);
  };

  return (
    <main className="auth-page">
      <section className="auth-card wide-auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark">O</div>
          <div>
            <strong>OSHU</strong>
            <span>점주센터</span>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>로그인</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>회원가입</button>
        </div>

        {mode === 'login' ? (
          <div className="auth-form">
            <label>
              계정 ID
              <input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="계정 ID를 입력하세요" />
            </label>
            <label>
              비밀번호
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="비밀번호를 입력하세요" />
            </label>
            {loginError && <p className="form-error">{loginError}</p>}
            <button className="primary-button auth-submit" onClick={submitLogin}>
              로그인
            </button>
            <p className="auth-help">로그인 성공 후 발급된 토큰 기준으로 해당 점주의 가게 정보만 불러옵니다.</p>
          </div>
        ) : (
          <div className="signup-entry">
            <div className="signup-entry-copy compact">
              <h2>회원가입</h2>
            </div>
            <div className="signup-entry-list">
              {signupSteps.map((step, index) => (
                <div className="signup-entry-item" key={step}>
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <button className="primary-button auth-submit" onClick={openSignupModal}>
              회원가입 시작
            </button>
          </div>
        )}

        {isSignupModalOpen && (
          <div className="modal-backdrop" role="presentation">
            <section className="signup-modal" role="dialog" aria-modal="true" aria-label="회원가입 단계 입력">
              <header className="modal-header">
                <div>
                  <p className="eyebrow">Step {signupStep + 1} of {signupSteps.length}</p>
                  <h3>{signupSteps[signupStep]}</h3>
                </div>
                <button className="modal-close" onClick={closeSignupModal} aria-label="회원가입 모달 닫기">×</button>
              </header>

              <div className="modal-progress">
                {signupSteps.map((step, index) => (
                  <span key={step} className={index === signupStep ? 'active' : index < signupStep ? 'done' : ''} />
                ))}
              </div>

              {signupStep === 0 && (
                <div className="auth-form two-col-auth modal-body">
                  <label>
                    계정 ID *
                    <input value={draft.accountId} onChange={(event) => updateDraft({ accountId: event.target.value })} placeholder="예: oshu_owner01" />
                  </label>
                  <label>
                    점주 이름 *
                    <input value={draft.ownerName} onChange={(event) => updateDraft({ ownerName: event.target.value })} placeholder="대표자 이름" />
                  </label>
                  <label>
                    비밀번호 *
                    <input type="password" value={draft.password} onChange={(event) => updateDraft({ password: event.target.value })} />
                  </label>
                  <label>
                    비밀번호 확인 *
                    <input type="password" value={draft.passwordConfirm} onChange={(event) => updateDraft({ passwordConfirm: event.target.value })} />
                  </label>
                  <label className="wide">
                    연락 가능한 휴대폰 번호 *
                    <input value={draft.phone} onChange={(event) => updateDraft({ phone: event.target.value })} placeholder="010-0000-0000" />
                  </label>
                </div>
              )}

              {signupStep === 1 && (
                <div className="auth-form two-col-auth modal-body">
                  <label>
                    사업자등록번호 *
                    <input value={draft.businessNumber} onChange={(event) => updateDraft({ businessNumber: event.target.value })} placeholder="000-00-00000" />
                  </label>
                  <label>
                    상호명 *
                    <input value={draft.storeName} onChange={(event) => updateDraft({ storeName: event.target.value })} placeholder="사업자등록증 상 상호" />
                  </label>
                  <label className="wide">
                    업종 *
                    <select value={draft.category} onChange={(event) => updateDraft({ category: event.target.value })}>
                      <option>베이커리·카페</option>
                      <option>음식점</option>
                      <option>카페</option>
                      <option>마트</option>
                      <option>식료품</option>
                      <option>생활서비스</option>
                    </select>
                  </label>
                </div>
              )}

              {signupStep === 2 && (
                <div className="auth-form two-col-auth modal-body">
                  <label className="wide">
                    가게 주소 *
                    <input value={draft.address} onChange={(event) => updateDraft({ address: event.target.value })} placeholder="도로명 주소를 입력하세요" />
                  </label>
                  <label>
                    가게 연락처 *
                    <input value={draft.contact} onChange={(event) => updateDraft({ contact: event.target.value })} placeholder="042-000-0000" />
                  </label>
                  <label>
                    대표 이미지
                    <button className="field-button" type="button">
                      <ImagePlus size={16} />
                      추후 업로드
                    </button>
                  </label>
                  <label className="wide">
                    가게 소개 *
                    <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} placeholder="앱 가게 상세에 표시될 소개를 입력하세요" />
                  </label>
                </div>
              )}

              {signupStep === 3 && (
                <div className="auth-form two-col-auth modal-body">
                  <label>
                    영업시간 *
                    <input value={draft.openingHours} onChange={(event) => updateDraft({ openingHours: event.target.value })} placeholder="예: 09:00 - 21:00" />
                  </label>
                  <label>
                    휴무일 *
                    <input value={draft.closedDay} onChange={(event) => updateDraft({ closedDay: event.target.value })} placeholder="예: 매주 월요일" />
                  </label>
                  <div className="signup-summary wide">
                    <strong>가입 후 처리</strong>
                    <p>회원가입이 완료되면 입력한 가게 정보는 검토중 상태로 저장되고, 점주 토큰에 연결됩니다.</p>
                  </div>
                </div>
              )}

              <footer className="modal-actions">
                <button className="ghost-button" onClick={closeSignupModal}>취소</button>
                <div>
                  <button className="ghost-button" disabled={signupStep === 0} onClick={() => setSignupStep((prev) => Math.max(0, prev - 1))}>이전</button>
                  {signupStep < signupSteps.length - 1 ? (
                    <button className="primary-button" disabled={!canGoNext()} onClick={() => setSignupStep((prev) => prev + 1)}>다음</button>
                  ) : (
                    <button className="primary-button" disabled={!canGoNext()} onClick={submitSignup}>회원가입 완료</button>
                  )}
                </div>
              </footer>
            </section>
          </div>
        )}      </section>
    </main>
  );
}

function Dashboard({
  merchantData,
  setActiveMenu,
}: {
  merchantData: MerchantData;
  setActiveMenu: (menu: MenuKey) => void;
}) {
  const activeTimeSale = merchantData.timeSales.find((item) => item.status === '진행중');

  return (
    <div className="panel-stack">
      <section className="hero-card">
        <div>
          <span className="live-pill">관리 현황</span>
          <h2>{merchantData.storeName || '가게 등록 필요'} 관리 현황</h2>
          <p>로그인한 점주 토큰에 연결된 가게 정보와 진행 중인 타임세일, 홍보 게시물 상태를 확인합니다.</p>
        </div>
        <div className="hero-status">
          <CheckCircle2 size={22} />
          <strong>{merchantData.approvalStatus}</strong>
          <span>{merchantData.storeName ? '노출 가능' : '등록 필요'}</span>
        </div>
      </section>

      <div className="summary-grid">
        <SummaryCard title="등록 상태" value={merchantData.approvalStatus} detail="토큰 기준 가게 정보" icon={ShieldCheck} />
        <SummaryCard
          title="진행 타임세일"
          value={`${activeTimeSale ? 1 : 0}건`}
          detail={activeTimeSale?.title ?? '진행 중인 행사 없음'}
          icon={Tag}
        />
        <SummaryCard title="홍보 게시물" value={`${merchantData.notices.length}건`} detail="가게 상세·홍보 피드 노출" icon={Megaphone} />
        <SummaryCard title="최근 수정" value="14:18" detail="오늘 저장된 변경사항" icon={Clock3} />
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">빠른 작업</p>
            <h3>주요 작업</h3>
          </div>
        </div>
        <div className="quick-actions">
          <QuickAction icon={Store} title="가게 정보 수정" detail="사업자 정보와 매장 기본 정보" onClick={() => setActiveMenu('store')} />
          <QuickAction icon={Tag} title="타임세일 등록" detail="상품·가격·수량·시간 설정" onClick={() => setActiveMenu('timesale')} />
          <QuickAction icon={Megaphone} title="홍보 게시물 등록" detail="공지·이벤트·신메뉴 게시" onClick={() => setActiveMenu('promotion')} />
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">타임세일 현황</p>
            <h3>최근 행사</h3>
          </div>
          <button className="ghost-button" onClick={() => setActiveMenu('timesale')}>전체 보기</button>
        </div>
        <TimeSaleTable items={merchantData.timeSales} compact />
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Store;
}) {
  return (
    <article className="summary-card">
      <div className="summary-icon">
        <Icon size={20} />
      </div>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function QuickAction({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: typeof Store;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-action" onClick={onClick}>
      <Icon size={22} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}

function StorePanel({
  merchantData,
  updateMerchantData,
}: {
  merchantData: MerchantData;
  updateMerchantData: (patch: Partial<MerchantData>) => void;
}) {
  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">가게 등록</p>
            <h3>사업자 정보</h3>
          </div>
          <button className="primary-button">
            <Save size={18} />
            저장
          </button>
        </div>

        <div className="form-grid">
          <label>
            사업자등록번호 *
            <input value={merchantData.businessNumber} onChange={(event) => updateMerchantData({ businessNumber: event.target.value })} />
          </label>
          <label>
            상호명 *
            <input value={merchantData.storeName} onChange={(event) => updateMerchantData({ storeName: event.target.value })} />
          </label>
          <label>
            업종 *
            <select value={merchantData.category} onChange={(event) => updateMerchantData({ category: event.target.value })}>
              <option>베이커리·카페</option>
              <option>음식점</option>
              <option>카페</option>
              <option>마트</option>
              <option>식료품</option>
              <option>생활서비스</option>
            </select>
          </label>
          <label>
            연락처 *
            <input defaultValue="042-123-4588" />
          </label>
          <label className="wide">
            주소 *
            <div className="input-with-button">
              <input defaultValue="대전광역시 유성구 궁동로 123, 1층" />
              <button>주소 검색</button>
            </div>
          </label>
          <label>
            평일 영업시간
            <input defaultValue="09:00 - 21:00" />
          </label>
          <label>
            휴무일
            <input defaultValue="매주 월요일" />
          </label>
          <label className="wide">
            가게 소개
            <textarea value={merchantData.description} onChange={(event) => updateMerchantData({ description: event.target.value })} />
          </label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <p className="eyebrow">사진·위치</p>
          <h3>이미지 및 위치 정보</h3>
          <div className="upload-row">
            <button className="upload-box">
              <ImagePlus size={28} />
              대표 이미지 업로드
            </button>
            <button className="upload-box">
              <Store size={28} />
              지도 위치 선택
            </button>
          </div>
        </div>
        <ValidationCard
          title="등록 제한 조건"
          items={[
            '필수 정보가 누락되면 등록할 수 없습니다.',
            '사업자등록번호 형식과 중복 여부를 확인합니다.',
            '주소 검색 실패 시 관리자 검토 상태로 저장됩니다.',
            '부적절한 이미지와 홍보 문구는 반려될 수 있습니다.',
          ]}
        />
      </section>
    </div>
  );
}

function TimeSalePanel({
  timeSales,
  setTimeSales,
}: {
  timeSales: TimeSale[];
  setTimeSales: (timeSales: TimeSale[]) => void;
}) {
  const sellOutFirst = () => {
    setTimeSales(timeSales.map((item, index) => (index === 0 ? { ...item, quantity: 0, status: '종료됨' } : item)));
  };

  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">타임세일</p>
            <h3>타임세일 등록</h3>
          </div>
          <button className="primary-button" onClick={sellOutFirst}>
            <Clock3 size={18} />
            품절 처리
          </button>
        </div>

        <div className="form-grid">
          <label>
            행사 상품 *
            <select>
              <option>클래식 크루아상</option>
              <option>사워도우 세트</option>
              <option>당일 생산 베이커리</option>
            </select>
          </label>
          <label>
            행사 수량 *
            <input type="number" defaultValue="20" />
          </label>
          <label>
            정상가 *
            <input defaultValue="4,500" />
          </label>
          <label>
            할인가 *
            <input defaultValue="2,800" />
          </label>
          <label>
            시작 시간 *
            <input type="time" defaultValue="15:00" />
          </label>
          <label>
            종료 시간 *
            <input type="time" defaultValue="17:00" />
          </label>
          <label className="wide">
            안내 문구
            <textarea defaultValue="수량 소진 시 자동 품절 처리됩니다." />
          </label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">등록 내역</p>
              <h3>타임세일 목록</h3>
            </div>
          </div>
          <TimeSaleTable items={timeSales} />
        </div>
        <ValidationCard
          title="자동 처리 기준"
          items={[
            '할인가는 정상가보다 낮아야 합니다.',
            '종료 시간은 시작 시간보다 늦어야 합니다.',
            '행사 수량이 0개가 되면 자동 품절 처리됩니다.',
            '종료 시간이 지나면 자동 비공개 처리됩니다.',
          ]}
        />
      </section>
    </div>
  );
}

function PromotionPanel({ notices }: { notices: Notice[] }) {
  return (
    <div className="panel-stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">가게 홍보 등록</p>
            <h3>홍보 게시물 등록</h3>
          </div>
          <button className="primary-button">
            <Save size={18} />
            게시물 저장
          </button>
        </div>

        <div className="form-grid">
          <label>
            홍보 유형 *
            <select>
              <option>신메뉴</option>
              <option>할인</option>
              <option>이벤트</option>
              <option>공지사항</option>
            </select>
          </label>
          <label>
            대상 메뉴
            <input defaultValue="딸기 크림 크루아상" />
          </label>
          <label className="wide">
            제목 *
            <input defaultValue="신메뉴 판매 안내" />
          </label>
          <label className="wide">
            내용 *
            <textarea defaultValue="신규 메뉴 판매 안내 문구를 입력합니다." />
          </label>
          <label>
            시작 일시 *
            <input type="datetime-local" defaultValue="2026-07-13T09:00" />
          </label>
          <label>
            종료 일시 *
            <input type="datetime-local" defaultValue="2026-07-20T21:00" />
          </label>
          <label>
            할인율·쿠폰 조건
            <input defaultValue="쿠폰 조건 입력" />
          </label>
          <label>
            대표 이미지 *
            <button className="field-button">
              <ImagePlus size={16} />
              이미지 업로드
            </button>
          </label>
        </div>
      </section>

      <section className="split-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">게시물 목록</p>
              <h3>게시물 목록</h3>
            </div>
          </div>
          <NoticeTable items={notices} />
        </div>
        <ValidationCard
          title="게시 제한 조건"
          items={[
            '제목, 내용, 이미지, 기간 미입력 시 등록이 제한됩니다.',
            '종료일이 시작일보다 빠르면 등록할 수 없습니다.',
            '기간이 끝난 게시물은 자동 비공개 처리됩니다.',
            '신고가 누적되면 관리자 검토 상태로 전환됩니다.',
          ]}
        />
      </section>
    </div>
  );
}

function ValidationCard({ title, items }: { title: string; items: string[] }) {
  return (
    <aside className="card guide-card">
      <p className="eyebrow">검증 기준</p>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}

function TimeSaleTable({ items, compact = false }: { items: TimeSale[]; compact?: boolean }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>상태</th>
            <th>행사명</th>
            {!compact && <th>상품</th>}
            <th>가격</th>
            <th>수량</th>
            <th>기간</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={`status-badge ${item.status}`}>{item.status}</span>
              </td>
              <td>
                <strong>{item.title}</strong>
                <p>{item.product}</p>
              </td>
              {!compact && <td>{item.product}</td>}
              <td>
                <span className="price-pair">
                  <del>{item.originalPrice}</del>
                  {item.salePrice}
                </span>
              </td>
              <td>{item.quantity}개</td>
              <td>{item.period}</td>
              <td>
                <button className="table-button">수정</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={compact ? 6 : 7} className="empty-cell">등록된 타임세일이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function NoticeTable({ items }: { items: Notice[] }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>상태</th>
            <th>유형</th>
            <th>제목</th>
            <th>노출 기간</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={`status-badge ${item.status}`}>{item.status}</span>
              </td>
              <td>{item.type}</td>
              <td>
                <strong>{item.title}</strong>
              </td>
              <td>{item.period}</td>
              <td>
                <button className="table-button">수정</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-cell">등록된 홍보 게시물이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
