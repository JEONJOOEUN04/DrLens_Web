# Dermalens Admin API 레퍼런스

> 어드민 콘솔(웹)이 사용하는 admin 전용 엔드포인트 명세.
> **Base URL:** `https://dermalens-production.up.railway.app`
> 모든 응답은 공통 형식 `{ "success": true, ... }` 또는 `{ "success": false, "message": "..." }` 를 따릅니다.

## 인증

기존 JWT Bearer 토큰을 그대로 사용합니다.
```
Authorization: Bearer {access_token}
```
admin 엔드포인트는 관리자 권한이 없는 사용자에게는 **403 Forbidden** 을 반환합니다.

---

## 엔드포인트 목록 (14)

| # | 엔드포인트 | 설명 |
|---|---|---|
| 1 | `GET /api/admin/stats/users/count` | 가입자 수 |
| 2 | `GET /api/admin/stats/users/signups?period=daily` | 신규 가입 추이 |
| 3 | `GET /api/admin/stats/users/by-skin-type` | 피부타입 분포 |
| 4 | `GET /api/admin/stats/users/by-provider` | 로그인 방식 분포 |
| 5 | `GET /api/admin/stats/survey/completion` | 설문 완료율 |
| 6 | `GET /api/admin/stats/analysis/daily` | 일별 분석 횟수 |
| 7 | `GET /api/admin/stats/analysis/traffic` | 신호등 분포 |
| 8 | `GET /api/admin/stats/analysis/top-products` | 많이 분석된 제품 |
| 9 | `GET /api/admin/stats/ingredients/top-risk` | 위험 성분 Top N |
| 10 | `GET /api/admin/products/top-rated` | 평점 높은 제품 |
| 11 | `GET /api/admin/reviews` | 리뷰 목록 |
| 12 | `PATCH /api/admin/reviews/{review_id}/moderate` | 리뷰 모더레이션 |
| 13 | `GET /api/admin/stats/chat/usage` | 챗봇 이용 통계 |
| 14 | `GET /api/admin/stats/chat/intents` | 인텐트 분포 |

---

## 1. 유저 현황

### 1) GET /api/admin/stats/users/count
전체 가입자 수와 상태별 분포.

**Response 200**
```json
{
  "success": true,
  "stats": {
    "total": 24108,
    "active_last_30d": 18452,
    "dormant": 5343,
    "banned": 313
  }
}
```

---

### 2) GET /api/admin/stats/users/signups
일별/주별/월별 신규 가입자 추이.

**Query Params**
- `period`: `daily` | `weekly` | `monthly` (기본 `daily`)
- `from`: `YYYY-MM-DD` (선택)
- `to`: `YYYY-MM-DD` (선택)

**Response 200**
```json
{
  "success": true,
  "period": "daily",
  "series": [
    { "date": "2026-05-28", "count": 42 },
    { "date": "2026-05-29", "count": 56 },
    { "date": "2026-05-30", "count": 31 }
  ],
  "total": 129
}
```

---

### 3) GET /api/admin/stats/users/by-skin-type
피부 타입별 유저 분포 (8가지 + 미설정).

**Response 200**
```json
{
  "success": true,
  "distribution": [
    { "skin_type_code": "ON+", "skin_type_name": "지성-노화-수분충분", "count": 3421 },
    { "skin_type_code": "ON-", "skin_type_name": "지성-노화-수분부족", "count": 2980 },
    { "skin_type_code": "OS+", "skin_type_name": "지성-민감-수분충분", "count": 1842 },
    { "skin_type_code": "OS-", "skin_type_name": "지성-민감-수분부족", "count": 1230 },
    { "skin_type_code": "DN+", "skin_type_name": "건성-노화-수분충분", "count": 5210 },
    { "skin_type_code": "DN-", "skin_type_name": "건성-노화-수분부족", "count": 4123 },
    { "skin_type_code": "DS+", "skin_type_name": "건성-민감-수분충분", "count": 2890 },
    { "skin_type_code": "DS-", "skin_type_name": "건성-민감-수분부족", "count": 2456 },
    { "skin_type_code": "UNKNOWN", "skin_type_name": "미설정", "count": -44 }
  ],
  "total": 24108
}
```

---

### 4) GET /api/admin/stats/users/by-provider
로그인 방식별 유저 분포 (카카오 vs 일반).

**Response 200**
```json
{
  "success": true,
  "providers": [
    { "provider": "email", "count": 14523, "ratio": 0.602 },
    { "provider": "kakao", "count": 9585, "ratio": 0.398 }
  ],
  "total": 24108
}
```

---

### 5) GET /api/admin/stats/survey/completion
설문 응답 완료율.

**Response 200**
```json
{
  "success": true,
  "completed": 19842,
  "not_completed": 4266,
  "completion_rate": 0.823
}
```

---

## 2. 분석 활동

### 6) GET /api/admin/stats/analysis/daily
일별 OCR/제품 분석 횟수.

**Query Params**
- `from`, `to`: `YYYY-MM-DD` (기본: 최근 30일)

**Response 200**
```json
{
  "success": true,
  "series": [
    { "date": "2026-05-29", "ocr": 412, "product_search": 891, "total": 1303 },
    { "date": "2026-05-30", "ocr": 487, "product_search": 1024, "total": 1511 }
  ]
}
```

---

### 7) GET /api/admin/stats/analysis/traffic
신호등 등급별 분석 결과 비율.

**Query Params**
- `from`, `to`: 기간 필터 (선택)

**Response 200**
```json
{
  "success": true,
  "distribution": [
    { "level": "GREEN", "count": 14210, "ratio": 0.681 },
    { "level": "YELLOW", "count": 4892, "ratio": 0.234 },
    { "level": "RED", "count": 1762, "ratio": 0.085 }
  ],
  "total": 20864
}
```

---

### 8) GET /api/admin/stats/analysis/top-products
가장 많이 분석된 제품 Top N.

**Query Params**
- `limit`: 기본 10 (최대 50)

**Response 200**
```json
{
  "success": true,
  "products": [
    {
      "product_id": 12,
      "product_name": "코스알엑스 토너",
      "brand_name": "COSRX",
      "image_url": "https://...",
      "analysis_count": 4821
    }
  ]
}
```

---

### 9) GET /api/admin/stats/ingredients/top-risk
가장 많이 검출된 위험 성분 Top N.

**Query Params**
- `limit`: 기본 10
- `min_risk_level`: 기본 7

**Response 200**
```json
{
  "success": true,
  "ingredients": [
    {
      "ingredient_id": 88,
      "ingredient_name_kr": "파라벤",
      "ingredient_name_en": "Paraben",
      "risk_level": 8,
      "detection_count": 2134,
      "allergy_flag": false,
      "irritant_flag": true
    }
  ]
}
```

---

## 3. 제품 / 리뷰

### 10) GET /api/admin/products/top-rated
평점 높은 제품 Top N.

**Query Params**
- `limit`: 기본 10
- `min_reviews`: 기본 5 (1건만 받은 제품 노이즈 방지)

**Response 200**
```json
{
  "success": true,
  "products": [
    {
      "product_id": 5,
      "product_name": "아토베리어 365 크림",
      "brand_name": "AESTURA",
      "image_url": "https://...",
      "avg_rating": 4.9,
      "review_count": 2012
    }
  ]
}
```

---

### 11) GET /api/admin/reviews
전체 리뷰 (모더레이션용).

**Query Params**
- `page`, `size` (기본 1, 20)
- `sort`: `recent` | `rating_asc` | `rating_desc` | `reported`
- `status`: `all` | `approved` | `pending` | `rejected` | `reported`

**Response 200**
```json
{
  "success": true,
  "page": 1,
  "count": 20,
  "total_count": 12481,
  "total_pages": 625,
  "reviews": [
    {
      "review_id": 1234,
      "user_id": 42,
      "nickname": "보아",
      "product_id": 1,
      "product_name": "...",
      "rating": 5,
      "review_text": "...",
      "image_count": 2,
      "report_count": 0,
      "status": "approved",
      "created_at": "2026-06-01 10:23:11"
    }
  ]
}
```

---

### 12) PATCH /api/admin/reviews/{review_id}/moderate
리뷰 승인/반려/삭제.

**Request**
```json
{
  "action": "approve",
  "reason": "광고성 콘텐츠 아님 확인"
}
```
- `action`: `"approve"` | `"reject"` | `"delete"`
- `reason`: 선택, 모더레이션 사유 기록용

**Response 200**
```json
{
  "success": true,
  "review_id": 1234,
  "status": "approved"
}
```

---

## 4. 챗봇

### 13) GET /api/admin/stats/chat/usage
챗봇 일별 이용 횟수.

**Query Params**
- `from`, `to`: 기간 (기본 30일)

**Response 200**
```json
{
  "success": true,
  "series": [
    { "date": "2026-05-29", "sessions": 234, "messages": 1842 },
    { "date": "2026-05-30", "sessions": 312, "messages": 2154 }
  ],
  "total_sessions": 7842,
  "total_messages": 58291,
  "avg_messages_per_session": 7.4
}
```

---

### 14) GET /api/admin/stats/chat/intents
인텐트별 질문 분포.

**Response 200**
```json
{
  "success": true,
  "distribution": [
    { "intent": "PRODUCT_RECOMMEND", "count": 24812, "ratio": 0.426 },
    { "intent": "INGREDIENT_ANALYSIS", "count": 18234, "ratio": 0.313 },
    { "intent": "SKIN_CARE_TIP", "count": 9211, "ratio": 0.158 },
    { "intent": "GENERAL_QA", "count": 6034, "ratio": 0.103 }
  ],
  "total": 58291
}
```

---

## 프론트엔드 매핑 (어디에 쓸지)

| 엔드포인트 | 어드민 콘솔 위치 | 위젯 |
|---|---|---|
| `users/count` | Dashboard | KPI 카드 "전체 가입자" |
| `users/signups` | Dashboard | "신규 가입 추이" 라인 차트 |
| `users/by-skin-type` | Dashboard | "피부 타입 분포" 도넛 차트 |
| `users/by-provider` | Dashboard | "로그인 방식" 미니 도넛 |
| `survey/completion` | Dashboard | KPI 카드 "설문 완료율" |
| `analysis/daily` | Dashboard | `DauChart` 글로벌 모드로 교체 |
| `analysis/traffic` | Dashboard | `SafetyDistribution` 대체 (실제 분석 결과 기준) |
| `analysis/top-products` | Dashboard | "많이 분석된 제품" 리스트 |
| `ingredients/top-risk` | Dashboard | `RiskyIngredientsCard` 의 스캔 로직 교체 |
| `products/top-rated` | Products / Dashboard | "평점 높은 제품" 카드 |
| `admin/reviews` | Reviews | 전체 리뷰 테이블 + 페이지네이션 |
| `reviews/{id}/moderate` | Reviews | 승인/반려/삭제 액션 메뉴 |
| `chat/usage` | Dashboard | "챗봇 이용 추이" 라인 차트 |
| `chat/intents` | Dashboard | "인텐트 분포" 도넛 |

---

## 프론트엔드 모듈 추가 예정

```
src/api/admin.js     ← 신규: 14개 엔드포인트를 한 곳에 모은 모듈
```

함수 예시:
```js
// src/api/admin.js
import { client, unwrap } from './client'

export const adminStats = {
  usersCount: async () => unwrap(await client.get('/api/admin/stats/users/count')),
  signups: async (period = 'daily') =>
    unwrap(await client.get('/api/admin/stats/users/signups', { params: { period } })),
  bySkinType: async () => unwrap(await client.get('/api/admin/stats/users/by-skin-type')),
  byProvider: async () => unwrap(await client.get('/api/admin/stats/users/by-provider')),
  surveyCompletion: async () => unwrap(await client.get('/api/admin/stats/survey/completion')),
  analysisDaily: async (params) =>
    unwrap(await client.get('/api/admin/stats/analysis/daily', { params })),
  analysisTraffic: async (params) =>
    unwrap(await client.get('/api/admin/stats/analysis/traffic', { params })),
  topAnalyzedProducts: async (limit = 10) =>
    unwrap(await client.get('/api/admin/stats/analysis/top-products', { params: { limit } })),
  topRiskIngredients: async (limit = 10, minRisk = 7) =>
    unwrap(await client.get('/api/admin/stats/ingredients/top-risk', {
      params: { limit, min_risk_level: minRisk },
    })),
  topRatedProducts: async (limit = 10, minReviews = 5) =>
    unwrap(await client.get('/api/admin/products/top-rated', {
      params: { limit, min_reviews: minReviews },
    })),
  reviews: async (params) =>
    unwrap(await client.get('/api/admin/reviews', { params })),
  moderateReview: async (id, action, reason) =>
    unwrap(await client.patch(`/api/admin/reviews/${id}/moderate`, { action, reason })),
  chatUsage: async (params) =>
    unwrap(await client.get('/api/admin/stats/chat/usage', { params })),
  chatIntents: async () => unwrap(await client.get('/api/admin/stats/chat/intents')),
}
```

---

## 공통 규약

- 모든 응답 최상위에 `success: boolean`
- 실패 시 `{ "success": false, "message": "..." }`
- 시각은 `YYYY-MM-DD HH:MM:SS` (KST) 통일
- 비율(`ratio`)은 0~1 소수
- 카운트는 정수 (없으면 0, null 금지)
- 페이지네이션은 `total_count` / `total_pages` 함께 제공 권장
