import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Package,
  MessageSquareText,
  ScrollText,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Keyboard,
  Mail,
  Sparkles,
} from 'lucide-react'

const pageGuides = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    desc: 'KPI 카드 4개와 DAU·안전도·카테고리·인기 성분 차트, 최근 분석 요청 로그를 한 화면에서 확인합니다.',
  },
  {
    icon: Users,
    title: 'Users',
    desc: '가입자 통계와 사용자 목록 테이블. 검색·필터로 특정 사용자 조회, 활성/휴면/정지 상태 관리.',
  },
  {
    icon: FlaskConical,
    title: 'Ingredients',
    desc: '성분 안전도(안전/주의/위험) 등급별 통계. EWG 점수, 검색량, 함유 제품 수까지 조회.',
  },
  {
    icon: Package,
    title: 'Products',
    desc: '카테고리별 제품 카드 그리드. 브랜드/가격/별점/안전도 한눈에 확인. 신규 제품 등록 가능.',
  },
  {
    icon: MessageSquareText,
    title: 'Reviews',
    desc: '사용자 리뷰 모니터링. 별점·승인 상태 확인, 부적절한 리뷰 반려 처리.',
  },
  {
    icon: ScrollText,
    title: 'Logs',
    desc: 'INFO/WARN/ERROR 레벨별 시스템 이벤트 로그. 검색·필터링·CSV Export 지원.',
  },
  {
    icon: Settings,
    title: 'Settings',
    desc: '계정·알림·보안·API 키·시스템 정보 관리. 비밀번호 변경, 알림 토글, 시크릿 키 재발급.',
  },
]

const topBarFeatures = [
  {
    icon: Search,
    title: '통합 검색',
    desc: '상단 검색창에 키워드 입력 시 사용자·성분·제품을 한 번에 검색. 결과 클릭 시 해당 페이지로 자동 이동.',
  },
  {
    icon: Bell,
    title: '알림 센터',
    desc: '신규 분석 요청, OCR 경고, 리뷰 등 이벤트 알림. 클릭 시 관련 페이지로 이동하고 자동 읽음 처리.',
  },
  {
    icon: HelpCircle,
    title: '도움말',
    desc: '사용 가이드(이 페이지), 단축키, 문의처 안내. 헬프 아이콘에서 빠르게 접근.',
  },
]

const shortcuts = [
  { keys: ['ESC'], desc: '열린 드롭다운/팝오버 닫기' },
  { keys: ['↑', '↓'], desc: '검색·알림 목록 내 항목 이동 (예정)' },
  { keys: ['Enter'], desc: '검색 결과 선택 (예정)' },
  { keys: ['⌘', 'K'], desc: '빠른 검색 열기 (예정)' },
]

function GuideView() {
  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary to-[#5B9BFF] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 mb-4 backdrop-blur-sm">
            <Sparkles size={12} />
            <span className="text-[10px] font-bold tracking-wider">USER GUIDE</span>
          </div>
          <h2 className="text-[26px] font-extrabold tracking-tight">
            Dermalens 어드민 콘솔 사용 가이드
          </h2>
          <p className="text-[13px] text-white/80 mt-2 max-w-xl">
            빅데이터 플랫폼의 사용자 활동, 성분 분석, 제품 데이터를 실시간으로
            모니터링하고 관리하기 위한 콘솔입니다. 각 메뉴와 기능을 아래에서 확인하세요.
          </p>
        </div>
      </section>

      {/* 사이드바 메뉴 가이드 */}
      <section className="bg-card border border-line rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-[16px] font-extrabold text-primary-dark">사이드바 메뉴</h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            좌측 사이드바의 7개 메뉴별 역할
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageGuides.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-primary/30 hover:bg-primary-light/20 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light grid place-items-center text-primary shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-text-main">{title}</p>
                <p className="text-[12px] text-text-sub mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 상단바 기능 가이드 */}
      <section className="bg-card border border-line rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-[16px] font-extrabold text-primary-dark">상단바 기능</h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            검색, 알림, 도움말, 프로필
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topBarFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-bg border border-line">
              <div className="w-9 h-9 rounded-lg bg-primary text-white grid place-items-center mb-3">
                <Icon size={16} />
              </div>
              <p className="text-[13px] font-bold text-text-main">{title}</p>
              <p className="text-[11px] text-text-sub mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 단축키 + 문의 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={18} className="text-primary" />
            <h3 className="text-[16px] font-extrabold text-primary-dark">단축키</h3>
          </div>
          <ul className="space-y-2.5">
            {shortcuts.map(({ keys, desc }) => (
              <li
                key={desc}
                className="flex items-center justify-between py-2 border-b border-line last:border-0"
              >
                <span className="text-[13px] text-text-main">{desc}</span>
                <span className="flex items-center gap-1">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 rounded-md bg-bg border border-line text-[11px] font-mono font-bold text-text-sub"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-primary" />
            <h3 className="text-[16px] font-extrabold text-primary-dark">문의 / 지원</h3>
          </div>
          <p className="text-[13px] text-text-main leading-relaxed">
            콘솔 사용 중 오류나 개선 제안이 있으시면 아래 이메일로 연락주세요.
            평일 24시간 이내 답변드립니다.
          </p>
          <a
            href="mailto:dermalens2026@gmail.com"
            className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-[13px] font-bold hover:brightness-110 transition"
          >
            <Mail size={14} />
            dermalens2026@gmail.com
          </a>
        </div>
      </section>

      <p className="text-center text-[11px] text-text-sub pt-2">
        Dermalens Admin Console · v0.1.0
      </p>
    </div>
  )
}

export default GuideView
