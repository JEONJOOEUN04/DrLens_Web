import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import DashboardView from './views/DashboardView'
import UsersView from './views/UsersView'
import IngredientsView from './views/IngredientsView'
import ProductsView from './views/ProductsView'
import ReviewsView from './views/ReviewsView'
import LogsView from './views/LogsView'
import SettingsView from './views/SettingsView'
import GuideView from './views/GuideView'

const pageMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: '더마렌즈 사용자 활동 및 성분 분석 데이터 실시간 모니터링',
    Component: DashboardView,
  },
  users: {
    title: 'Users',
    subtitle: '가입자 현황 및 사용자 계정 관리',
    Component: UsersView,
  },
  ingredients: {
    title: 'Ingredients',
    subtitle: '화장품 성분 데이터베이스 및 안전도 관리',
    Component: IngredientsView,
  },
  products: {
    title: 'Products',
    subtitle: '등록된 화장품 제품 카탈로그',
    Component: ProductsView,
  },
  reviews: {
    title: 'Reviews',
    subtitle: '사용자 리뷰 모니터링 및 승인 관리',
    Component: ReviewsView,
  },
  logs: {
    title: 'Logs',
    subtitle: '시스템 이벤트 및 API 호출 로그',
    Component: LogsView,
  },
  settings: {
    title: 'Settings',
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
  const meta = pageMeta[activePage] ?? pageMeta.dashboard
  const View = meta.Component

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar
          user={user}
          onLogout={onLogout}
          onNavigate={setActivePage}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <div className="flex-1 px-8 pb-10">
          <View onNavigate={setActivePage} user={user} />
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
