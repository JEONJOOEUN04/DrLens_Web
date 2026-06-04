import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import DashboardView from './views/DashboardView'
import UsersView from './views/UsersView'
import IngredientsView from './views/IngredientsView'
import IngredientManageView from './views/IngredientManageView'
import ProductsView from './views/ProductsView'
import ReviewsView from './views/ReviewsView'
import LogsView from './views/LogsView'
import SettingsView from './views/SettingsView'
import GuideView from './views/GuideView'

const pageMeta = {
  dashboard: {
    title: '대시보드',
    subtitle: '더마렌즈 사용자 활동 및 성분 분석 데이터 실시간 모니터링',
    Component: DashboardView,
  },
  users: {
    title: '회원 관리',
    subtitle: '가입자 현황 및 사용자 계정 관리',
    Component: UsersView,
  },
  ingredients: {
    title: '성분 DB',
    subtitle: '화장품 성분 데이터베이스 및 안전도 관리',
    Component: IngredientsView,
  },
  'ingredient-manage': {
    title: '성분 관리',
    subtitle: '제품 성분표 사진 등록(OCR) 및 제품별 성분 관리',
    Component: IngredientManageView,
  },
  products: {
    title: '제품 관리',
    subtitle: '등록된 화장품 제품 카탈로그',
    Component: ProductsView,
  },
  reviews: {
    title: '리뷰 관리',
    subtitle: '사용자 리뷰 모니터링 및 승인 관리',
    Component: ReviewsView,
  },
  logs: {
    title: '활동 로그',
    subtitle: '전체 사용자 활동 및 시스템 로그',
    Component: LogsView,
  },
  settings: {
    title: '설정',
    subtitle: '계정·알림·보안·API·시스템 설정',
    Component: SettingsView,
  },
  guide: {
    title: '사용 가이드',
    subtitle: '콘솔 메뉴와 기능을 한눈에 확인하세요',
    Component: GuideView,
  },
}

function DashboardPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const meta = pageMeta[activePage] ?? pageMeta.dashboard
  const View = meta.Component

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar
          user={user}
          onLogout={onLogout}
          onNavigate={setActivePage}
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-10">
          <View onNavigate={setActivePage} user={user} />
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
