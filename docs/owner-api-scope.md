# OSHU 점주 웹 API 범위

새 OpenAPI 명세 기준으로 점주 웹에서 사용하는 API만 정리합니다.
서버 배포 후 `.env`에 `VITE_OSHU_API_BASE_URL` 값을 넣으면 `src/entities/owner/api/index.ts`에서 바로 사용합니다.

## Auth
- `POST /auth/signup` — `loginId`, `password`
- `POST /auth/login` — `loginId`, `password` → `accessToken`, `tokenType`

## Owner Stores
- `GET /owner/stores` — 내 가게 목록
- `POST /owner/stores` — 가게 등록
- `GET /owner/stores/{storeId}` — 내 가게 상세
- `PATCH /owner/stores/{storeId}` — 소개, 연락처, 영업시간 수정
- `PATCH /owner/stores/{storeId}/crowd-status` — 혼잡도, 예상 대기시간 수정

## Owner Time Sales
- `POST /owner/stores/{storeId}/time-sales` — 타임세일 등록
- `PATCH /owner/time-sales/{timeSaleId}` — 타임세일 수정
- `PATCH /owner/time-sales/{timeSaleId}/close` — 타임세일 종료

## Owner Promotions
- `POST /owner/stores/{storeId}/promotions` — 홍보 등록
- `PATCH /owner/promotions/{promotionId}` — 홍보 수정
- `DELETE /owner/promotions/{promotionId}` — 홍보 삭제

## 제외한 API
소비자 앱용 조회 API인 `/stores`, `/stores/map`, `/promotions` 공개 조회 계열은 점주 웹 화면에서 제외합니다.

## 배포 base URL 점검
- 현재 프론트는 `VITE_OSHU_API_BASE_URL=/api`를 기본값으로 사용합니다.
- 로컬 개발은 `vite.config.ts`의 `/api -> http://3.216.152.235` 프록시를 사용합니다.
- Cloudflare 배포는 `worker/index.js`에서 `/api -> http://3.216.152.235`로 프록시합니다.
- 2026-07-14 점검 기준 `http://3.216.152.235`, `http://3.216.152.235:8080` 직접 접근은 타임아웃이고, 배포 프록시는 Cloudflare `1003`을 반환합니다. 서버가 외부 HTTP 접근을 허용하거나 HTTPS 도메인을 제공해야 실제 요청이 성공합니다.

## 프론트 테스트 URL
- GitHub Pages 테스트 URL: `https://dsm-team-23.github.io/OSHU_FE/`
- 서버 CORS 허용 Origin 값: `https://dsm-team-23.github.io`
- 단, GitHub Pages는 HTTPS라 서버 API가 `http://3.216.152.235`만 제공되면 브라우저 Mixed Content 정책에 막힐 수 있습니다. 실제 API 호출까지 테스트하려면 서버도 HTTPS 도메인을 제공하거나 HTTPS 프록시가 필요합니다.
