import { useState } from 'react';
import type { StoreCategory } from '../../../entities/owner/types';
import type { AuthMode, SignupDraft } from '../../../entities/owner/types/ui';
import { categoryOptions } from '../../../entities/owner/model/options';
import { createEmptySignupDraft } from '../../../entities/owner/model/mockData';

export function AuthScreen({
  mode,
  setMode,
  onLogin,
  onSignup,
  onNotify,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onLogin: (loginId: string, password: string) => boolean;
  onSignup: (draft: SignupDraft) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}) {
  const [loginId, setLoginId] = useState('oshu_bakery');
  const [loginPassword, setLoginPassword] = useState('pass1234');
  const [loginError, setLoginError] = useState('');
  const [signupStep, setSignupStep] = useState(0);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [draft, setDraft] = useState<SignupDraft>(createEmptySignupDraft());

  const signupSteps = ['계정 정보', '가게 정보', '위치 정보', '운영 정보'];

  const updateDraft = (patch: Partial<SignupDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const submitLogin = () => {
    if (!loginId.trim() || !loginPassword) {
      const message = '계정 ID와 비밀번호를 입력해주세요.';
      setLoginError(message);
      onNotify(message, 'error');
      return;
    }

    const success = onLogin(loginId, loginPassword);
    const message = '계정 ID 또는 비밀번호가 일치하지 않습니다.';
    setLoginError(success ? '' : message);
    onNotify(success ? '로그인되었습니다.' : message, success ? 'success' : 'error');
  };

  const canGoNext = () => {
    if (signupStep === 0) return draft.loginId && draft.password && draft.password === draft.passwordConfirm;
    if (signupStep === 1) return draft.name && draft.category && draft.description;
    if (signupStep === 2) return draft.address && draft.phone && draft.latitude && draft.longitude;
    return draft.openingTime && draft.closingTime;
  };

  const openSignupModal = () => {
    setSignupStep(0);
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const submitSignup = () => {
    if (!canGoNext()) {
      onNotify('필수 정보를 모두 입력해주세요.', 'error');
      return;
    }
    onSignup(draft);
    onNotify('회원가입이 완료되었습니다.', 'success');
  };

  return (
    <main className="auth-page">
      <section className="auth-card wide-auth-card">
        <div className="brand auth-brand">
          <img className="brand-mark" src="/ohshu.svg" alt="OSHU 로고" />
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
            <button className="primary-button auth-submit" onClick={submitLogin}>로그인</button>
            <p className="auth-help">로그인한 계정의 가게만 관리할 수 있습니다.</p>
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
            <button className="primary-button auth-submit" onClick={openSignupModal}>회원가입 시작</button>
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
                    <input value={draft.loginId} onChange={(event) => updateDraft({ loginId: event.target.value })} placeholder="예: oshu_owner01" />
                  </label>
                  <label>
                    비밀번호 *
                    <input type="password" value={draft.password} onChange={(event) => updateDraft({ password: event.target.value })} />
                  </label>
                  <label className="wide">
                    비밀번호 확인 *
                    <input type="password" value={draft.passwordConfirm} onChange={(event) => updateDraft({ passwordConfirm: event.target.value })} />
                  </label>
                </div>
              )}

              {signupStep === 1 && (
                <div className="auth-form two-col-auth modal-body">
                  <label>
                    상호명 *
                    <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} placeholder="가게 이름" />
                  </label>
                  <label>
                    업종 *
                    <select value={draft.category} onChange={(event) => updateDraft({ category: event.target.value as StoreCategory })}>
                      {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="wide">
                    가게 소개 *
                    <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} placeholder="가게 소개를 입력하세요" />
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
                    <input value={draft.phone} onChange={(event) => updateDraft({ phone: event.target.value })} placeholder="042-000-0000" />
                  </label>
                  <label>
                    지도 위도 *
                    <input type="number" value={draft.latitude} onChange={(event) => updateDraft({ latitude: Number(event.target.value) })} />
                  </label>
                  <label>
                    지도 경도 *
                    <input type="number" value={draft.longitude} onChange={(event) => updateDraft({ longitude: Number(event.target.value) })} />
                  </label>
                </div>
              )}

              {signupStep === 3 && (
                <div className="auth-form two-col-auth modal-body">
                  <label>
                    오픈 시간 *
                    <input type="time" value={draft.openingTime} onChange={(event) => updateDraft({ openingTime: event.target.value })} />
                  </label>
                  <label>
                    마감 시간 *
                    <input type="time" value={draft.closingTime} onChange={(event) => updateDraft({ closingTime: event.target.value })} />
                  </label>
                  <div className="signup-summary wide">
                    <strong>검토 안내</strong>
                    <p>등록이 완료되면 가게 정보는 검토중 상태로 저장됩니다.</p>
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
        )}
      </section>
    </main>
  );
}
