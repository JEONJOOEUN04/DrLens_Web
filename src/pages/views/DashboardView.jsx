import { useQuery } from '@tanstack/react-query'
import { Users, UserPlus, Activity, ClipboardCheck, Loader2 } from 'lucide-react'
import KpiCard from '../../components/KpiCard'

// Charts
import DauChart from '../../components/charts/DauChart'
import SafetyDistribution from '../../components/charts/SafetyDistribution'
import CategoryChart from '../../components/charts/CategoryChart'
import SignupsChart from '../../components/charts/SignupsChart'
import ChatUsageChart from '../../components/charts/ChatUsageChart'
import SkinTypeChart from '../../components/charts/SkinTypeChart'
import ProviderChart from '../../components/charts/ProviderChart'
import ChatIntentsChart from '../../components/charts/ChatIntentsChart'

// Lists
import TopIngredientsCard from '../../components/TopIngredientsCard'
import TopAnalyzedProductsCard from '../../components/TopAnalyzedProductsCard'
import TopRatedProductsCard from '../../components/TopRatedProductsCard'
import PopularProductsCard from '../../components/PopularProductsCard'
import RiskyIngredientsCard from '../../components/RiskyIngredientsCard'
import RecentAnalysesCard from '../../components/RecentAnalysesCard'

import { getUsersCount, getUsersSignups, getSurveyCompletion } from '../../api/admin'

function DashboardView({ user, onNavigate }) {
  // KPI 데이터 병렬 조회
  const usersCountQuery = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: getUsersCount,
    staleTime: 1000 * 60 * 5,
  })

  const signupsQuery = useQuery({
    queryKey: ['admin-signups-daily-summary'],
    queryFn: () => getUsersSignups({ period: 'daily' }),
    staleTime: 1000 * 60 * 5,
  })

  const surveyQuery = useQuery({
    queryKey: ['admin-survey-completion'],
    queryFn: getSurveyCompletion,
    staleTime: 1000 * 60 * 10,
  })

  const stats = usersCountQuery.data?.stats ?? {}
  const todaySignups =
    signupsQuery.data?.series?.[signupsQuery.data.series.length - 1]?.count ?? 0
  const completionRate = surveyQuery.data?.completion_rate ?? 0

  const fmt = (n) => (n != null ? n.toLocaleString() : '-')

  return (
    <div className="space-y-6">
      {/* ============ KPI 4개 ============ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          icon={Users}
          label="전체 가입자"
          value={
            usersCountQuery.isLoading ? (
              <Loader2 size={18} className="animate-spin text-primary inline" />
            ) : (
              fmt(stats.total)
            )
          }
          caption="누적 가입 사용자"
        />
        <KpiCard
          icon={UserPlus}
          label="오늘 신규 가입"
          value={signupsQuery.isLoading ? '-' : fmt(todaySignups)}
          caption={
            signupsQuery.data?.total
              ? `최근 ${signupsQuery.data.series?.length ?? 0}일 합계 ${fmt(signupsQuery.data.total)}명`
              : '-'
          }
        />
        <KpiCard
          icon={Activity}
          label="활성 사용자"
          value={
            usersCountQuery.isLoading ? '-' : fmt(stats.active_last_30d)
          }
          caption="최근 30일"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="설문 완료율"
          value={
            surveyQuery.isLoading
              ? '-'
              : `${Math.round((completionRate ?? 0) * 100)}%`
          }
          caption={
            surveyQuery.data
              ? `${fmt(surveyQuery.data.completed)} / ${fmt(
                  (surveyQuery.data.completed ?? 0) +
                    (surveyQuery.data.not_completed ?? 0)
                )}`
              : '-'
          }
        />
      </section>

      {/* ============ 일별 분석 (2/3) + 신호등 분포 (1/3) ============ */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DauChart />
        </div>
        <SafetyDistribution />
      </section>

      {/* ============ 신규 가입 추이 (1/2) + 챗봇 이용 추이 (1/2) ============ */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SignupsChart />
        <ChatUsageChart />
      </section>

      {/* ============ 도넛 3개 ============ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <SkinTypeChart />
        <ProviderChart />
        <ChatIntentsChart />
      </section>

      {/* ============ 많이 분석된 제품 + 위험 성분 ============ */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopAnalyzedProductsCard />
        <RiskyIngredientsCard />
      </section>

      {/* ============ 평점 높은 제품 + 좋아요 인기 제품 ============ */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopRatedProductsCard />
        <PopularProductsCard />
      </section>

      {/* ============ 카테고리별 (2/3) + 급상승 검색어 (1/3) ============ */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CategoryChart />
        </div>
        <TopIngredientsCard />
      </section>

      {/* ============ 내 최근 분석 (개인) ============ */}
      <section>
        <RecentAnalysesCard user={user} onViewAll={() => onNavigate?.('logs')} />
      </section>
    </div>
  )
}

export default DashboardView
