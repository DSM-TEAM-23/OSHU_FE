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
