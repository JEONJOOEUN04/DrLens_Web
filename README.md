# Dermalens Admin Console

더마렌즈 빅데이터 플랫폼 어드민 대시보드 (React + Vite + Tailwind v4)

---

## 실행

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 로그인 (개발자 콘솔)

웹페이지 접속 시 먼저 로그인 페이지가 표시됩니다.

**자격증명은 백엔드 담당자에게 받은 슈퍼어드민 계정을 사용하세요.**

- 로그인은 실제 백엔드 API (`POST /api/users/login/`)와 연결되어 있습니다
- 로그인 성공 시 JWT 토큰을 저장 — "로그인 상태 유지" 체크 시 `localStorage` (영구), 해제 시 `sessionStorage` (탭 닫으면 만료)
- 401 응답 시 자동으로 refresh 토큰으로 재발급 시도, 실패 시 로그인 페이지로 복귀
- 사이드바 하단 또는 우측 상단 프로필 메뉴의 **Logout** 버튼 클릭 시 토큰 무효화 후 로그인 페이지로 복귀

---

## 폴더 구조

```
Dlens_web/
├── index.html                    # HTML 진입점. <title>, Pretendard 폰트 CDN 로드
├── package.json
├── vite.config.js                # Vite + Tailwind v4 + React 플러그인 등록
└── src/
    ├── main.jsx                  # React 진입점 (수정할 일 거의 없음)
    ├── App.jsx                   # 🟢 인증 라우터. user 상태에 따라 Login/Dashboard 분기
    ├── index.css                 # 🟢 컬러 팔레트 (@theme 토큰) - 색 바꾸려면 여기
    ├── assets/                   # (현재 비어있음, 이미지·SVG 넣을 곳)
    ├── pages/
    │   ├── LoginPage.jsx         # 🟢 로그인 페이지 (자격증명 상수 위치)
    │   └── DashboardPage.jsx     # 🟢 대시보드 페이지 조립부
    └── components/
        ├── Sidebar.jsx           # 좌측 사이드바 (로고 + 메뉴 + 로그아웃)
        ├── TopBar.jsx            # 상단바 (페이지 제목 + 검색 + 알림 + 프로필)
        ├── KpiCard.jsx           # 재사용 KPI 카드 (props로 받음)
        ├── TopIngredientsCard.jsx# 인기 검색 성분 TOP 리스트
        ├── RecentAnalysesCard.jsx# 최근 성분 분석 요청 테이블
        └── charts/
            ├── DauChart.jsx          # DAU 영역 차트 (7일 추이)
            ├── SafetyDistribution.jsx# 안전도 도넛 차트
            └── CategoryChart.jsx     # 카테고리별 분석 건수 바 차트
```

---

## 페이지 흐름

```
첫 접속
   │
   ▼
LoginPage  ──[성공]──▶  DashboardPage
   ▲                       │
   └─────[Logout 클릭]──────┘
```

- `App.jsx`가 `user` state로 분기 (`null` → 로그인, 있으면 대시보드)
- 로그인 실패 시 페이지 그대로 + 에러 메시지

---

## 대시보드 레이아웃 (DashboardPage.jsx)

`DashboardPage.jsx`는 단순한 조립 파일입니다. 위젯의 순서·배치만 바꾸려면 여기만 손대세요.

```
┌──────────┬──────────────────────────────────────┐
│          │  TopBar                              │
│ Sidebar  ├──────────────────────────────────────┤
│          │  KPI x 4                             │ ← grid 4컬럼
│          ├──────────────────────────────────────┤
│          │  DauChart (2/3)   SafetyDist (1/3)   │
│          ├──────────────────────────────────────┤
│          │  CategoryChart(2/3) TopIngredients   │
│          ├──────────────────────────────────────┤
│          │  RecentAnalysesCard (full)           │
└──────────┴──────────────────────────────────────┘
```

- 컬럼 비율은 `xl:col-span-2` / `xl:col-span-1` 로 제어
- KPI 개수는 `xl:grid-cols-4` 의 숫자 + `<KpiCard ...>` 추가/삭제
- 위젯 배치 변경은 [src/pages/DashboardPage.jsx](src/pages/DashboardPage.jsx)에서

---

## 사이드바 (Sidebar.jsx)

메뉴 항목은 파일 상단의 `navItems` 배열로 관리합니다.

```jsx
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users,           label: 'Users' },
  { icon: FlaskConical,    label: 'Ingredients' },
  { icon: Package,         label: 'Products' },
  { icon: MessageSquareText, label: 'Reviews' },
  { icon: ScrollText,      label: 'Logs' },
  { icon: Settings,        label: 'Settings' },
]
```

| 바꾸고 싶은 것 | 어디를 수정 |
|---|---|
| 메뉴 항목 추가/삭제 | `navItems` 배열에 객체 추가/삭제 |
| 메뉴 아이콘 변경 | `lucide-react`에서 import 하고 `icon:` 교체 ([아이콘 목록](https://lucide.dev/icons/)) |
| 현재 활성 메뉴 변경 | 항목의 `active: true` 위치 옮기기 |
| 로고 텍스트 / 부제목 | `Sidebar.jsx` 상단 `Dermalens` / `Admin Console` 텍스트 |
| 하단 안내 박스 문구 | `bg-primary-light/70` div 내부 텍스트 |
| 페이지 라우팅 | 현재는 라우터 미연결 → `react-router-dom` 도입 후 `<button>`을 `<Link>`로 변경 |

---

## 상단바 (TopBar.jsx)

| 바꾸고 싶은 것 | 어디 |
|---|---|
| 페이지 제목 (`Dashboard`) | `<h1>` 텍스트 |
| 부제목 | `<p>` 텍스트 |
| 검색 placeholder | `<input>`의 `placeholder` |
| 프로필 이니셜 / 이름 / 권한 | 우측 프로필 박스 내부 (`B`, `보아`, `Admin`) |
| 알림 빨간점 표시/숨김 | 알림 버튼 안의 `span.bg-danger` |

---

## 위젯 카드별 데이터 위치

> 백엔드 연결 전 더미 데이터로 동작합니다. 각 파일 상단의 상수만 API 응답으로 바꾸면 됩니다.

| 컴포넌트 | 더미 데이터 변수 | 데이터 형태 |
|---|---|---|
| `KpiCard.jsx` | (없음 - props로 받음) | `App.jsx`에서 `<KpiCard label value delta deltaType caption icon />` |
| `DauChart.jsx` | `data` | `[{ day, dau, analyses }]` |
| `SafetyDistribution.jsx` | `data` | `[{ name, value, color }]` |
| `CategoryChart.jsx` | `data` | `[{ category, count }]` |
| `TopIngredientsCard.jsx` | `ingredients` | `[{ name, searches, trend, safety }]` (`safety`: `'safe' \| 'warning' \| 'danger'`) |
| `RecentAnalysesCard.jsx` | `rows` | `[{ user, product, brand, time, status, statusText }]` |

---

## 컬러 팔레트 (index.css)

전부 [src/index.css](src/index.css)의 `@theme` 블록에서 관리합니다. 값만 바꾸면 전 컴포넌트에 즉시 반영됩니다.

| Tailwind 클래스 | CSS 토큰 | HEX | 용도 |
|---|---|---|---|
| `bg-primary` / `text-primary` | `--color-primary` | `#306EC7` | 메인 블루, 강조 |
| `text-primary-dark` | `--color-primary-dark` | `#2F374C` | 헤딩, 제목 |
| `bg-primary-light` | `--color-primary-light` | `#E6F0FF` | 활성 nav, 배경 칩 |
| `bg-bg` | `--color-bg` | `#F7FAFF` | 페이지 배경 |
| `bg-card` | `--color-card` | `#FFFFFF` | 카드 배경 |
| `text-text-main` | `--color-text-main` | `#1B1B1B` | 본문 텍스트 |
| `text-text-sub` | `--color-text-sub` | `#67707B` | 보조 텍스트 |
| `border-line` | `--color-line` | `#E1E1E1` | 보더 |
| `bg-danger` / `text-danger` | `--color-danger` | `#FF3B30` | 위험 |
| `bg-warning` / `text-warning` | `--color-warning` | `#FFCC00` | 주의·별점 |
| `bg-safe` / `text-safe` | `--color-safe` | `#34C759` | 안전 |

> Tailwind v4는 `tailwind.config.js`가 없습니다. 색·폰트·간격 등 모든 디자인 토큰은 `index.css`의 `@theme {}` 안에서 정의합니다.

---

## 폰트

[index.html](index.html)에서 Pretendard Variable을 CDN으로 로드하고, `index.css`의 `@theme`에서 `--font-sans`로 등록되어 있습니다. 기본 body에 자동 적용됩니다.

---

## 자주 묻는 수정 시나리오

**Q. KPI 카드를 하나 더 추가하고 싶어요**
1. `App.jsx`에서 `<KpiCard ... />` 한 줄 추가
2. 그리드 컬럼이 5개가 되도록 `xl:grid-cols-4` → `xl:grid-cols-5`로 변경

**Q. 차트 색을 보라색으로 바꾸고 싶어요**
- `index.css`의 `--color-primary` 값 한 줄만 수정 → 대부분의 강조 요소가 동시에 바뀝니다.
- 단, 차트 컴포넌트 내부에서 `stroke="#306EC7"` 처럼 하드코딩된 부분은 같이 수정해야 합니다 (현재 `DauChart.jsx`, `CategoryChart.jsx`에 존재).

**Q. 사이드바를 접을 수 있게 만들고 싶어요**
- `Sidebar.jsx` 상단에 `useState`로 `collapsed` 상태 추가, `w-60` → `collapsed ? 'w-16' : 'w-60'`로 변경, 라벨 텍스트 조건부 렌더링.

**Q. 메뉴 클릭 시 다른 페이지로 가게 하고 싶어요**
- `npm install react-router-dom` 후 `main.jsx`에서 `<BrowserRouter>` 감싸고, `Sidebar.jsx`의 `<button>`을 `<NavLink to="/users">`로 교체.

---

## 의존성

- `react`, `react-dom` — UI 프레임워크
- `vite`, `@vitejs/plugin-react` — 번들러
- `tailwindcss`, `@tailwindcss/vite` — Tailwind v4
- `recharts` — 차트 (Line/Area/Bar/Pie)
- `lucide-react` — 아이콘
