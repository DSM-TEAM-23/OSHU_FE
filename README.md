# OSHU Merchant Web

OSHU 앱에 노출될 가게 정보, 타임세일, 홍보 게시물을 점주가 직접 등록하고 관리하는 웹 프론트입니다.

## 실행

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
pnpm run build
```

## 구현 범위

- 로그인 / 회원가입
  - 비로그인 상태에서는 가게 정보를 렌더링하지 않음
  - 로그인은 `계정 ID`, `비밀번호`만 입력
  - 로그인 후 발급된 토큰 기준으로 해당 점주의 가게 데이터 로드
  - 회원가입은 `계정 정보 → 사업자 정보 → 가게 정보 → 운영 정보` 단계로 진행
- 대시보드
- 가게 등록
  - 사업자등록번호, 상호명, 업종, 주소, 연락처
  - 영업시간, 가게 소개, 대표 이미지, 지도 위치
- 타임세일
  - 행사 상품, 정상가, 할인가, 행사 수량
  - 시작·종료 시간, 행사 이미지, 안내 문구
- 가게 홍보 등록
  - 홍보 유형, 제목, 내용, 대표 이미지
  - 시작·종료 일시, 할인율·쿠폰 조건, 대상 메뉴

## 디자인 방향

새 OSHU 앱 시안에 맞춰 연핑크 계열, 흰색 카드, 작은 상태 배지, 부드러운 라운드 UI를 사용했습니다.  
소비자용 앱 화면이 아니라 점주가 데이터를 등록하는 관리 웹이므로 폼, 표, 검증 기준 안내 중심으로 구성했습니다.

## 인증 구조

현재는 프론트 더미 토큰으로 동작합니다.

- `mock-token-bakery`: OSHU 베이커리 유성점 데이터
- `mock-token-restaurant`: 오슈키친 궁동점 데이터
- 신규 회원가입: 빈 가게 데이터로 시작 후 `가게 등록` 화면 이동

추후 API 연동 시 로그인 응답의 access token을 저장하고, `/me/store`, `/me/timesales`, `/me/promotions` 같은 점주 전용 API를 호출하도록 교체하면 됩니다.

## Frontend Architecture

`mozu-FE`의 레이어드 구조를 참고해 단일 앱에 맞게 아래처럼 정리했습니다.

```text
src/
├─ app/                 # 앱 루트, 전역 상태, 화면 분기
├─ pages/               # 라우트 단위 화면
│  ├─ auth/
│  ├─ dashboard/
│  ├─ store/
│  ├─ time-sale/
│  └─ promotion/
├─ entities/owner/      # 점주 도메인 타입, API, mock 데이터
│  ├─ api/
│  ├─ model/
│  └─ types/
├─ shared/              # 공용 UI와 포맷 유틸
│  ├─ lib/
│  └─ ui/
└─ main.tsx
```

- `entities/owner/types`: OpenAPI 기준 요청/응답 타입
- `entities/owner/api`: 점주센터에서 사용할 API 클라이언트
- `pages/*/ui`: 화면 단위 컴포넌트
- `shared/ui`: 테이블, 카드 등 재사용 UI
