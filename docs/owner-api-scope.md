# OSHU 점주센터 사용 API 범위

첨부된 OpenAPI 명세 중 점주 웹 프론트에서 사용하는 API만 정리합니다. 소비자용 지도, 가게 목록, 행사 피드 조회 API는 제외합니다.

## Auth

| Method | Path | 용도 | Request |
| --- | --- | --- | --- |
| POST | `/auth/signup` | 점주 계정 생성 | `SignUpRequest` |
| POST | `/auth/login` | 로그인 및 토큰 발급 | `LoginRequest` |

## Store

| Method | Path | 용도 | Request/Response |
| --- | --- | --- | --- |
| GET | `/owner/stores` | 내 가게 목록 조회 | `OwnerStore[]` |
| POST | `/owner/stores` | 내 가게 등록 | `CreateStoreRequest` |
| GET | `/owner/stores/{storeId}` | 내 가게 상세 조회 | `StoreDetail` |
| PATCH | `/owner/stores/{storeId}` | 내 가게 정보 수정 | `UpdateStoreRequest` |

## Promotion

| Method | Path | 용도 | Request |
| --- | --- | --- | --- |
| POST | `/owner/stores/{storeId}/promotions` | 홍보 등록 | `PromotionRequest` |
| PATCH | `/owner/promotions/{promotionId}` | 홍보 수정 | `PromotionRequest` |
| DELETE | `/owner/promotions/{promotionId}` | 홍보 삭제 | - |

## TimeSale

| Method | Path | 용도 | Request |
| --- | --- | --- | --- |
| POST | `/owner/stores/{storeId}/time-sales` | 타임세일 등록 | `TimeSaleRequest` |
| PATCH | `/owner/time-sales/{timeSaleId}` | 타임세일 수정 | `TimeSaleRequest` |
| PATCH | `/owner/time-sales/{timeSaleId}/close` | 타임세일 종료 | - |

## 프론트 타입 위치

- API 타입: `src/types/oshu.ts`
- API 클라이언트: `src/api/ownerApi.ts`

