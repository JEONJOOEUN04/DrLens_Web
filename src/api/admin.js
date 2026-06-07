import { client, unwrap } from './client'

// ===== 회원 목록 =====
export async function getUsersList({ q = '', page = 1, size = 20 } = {}) {
  const res = await client.get('/api/admin/users', {
    params: { ...(q && { q }), page, size },
  })
  return unwrap(res) // { users:[...], total_count, total_pages, page }
}

// ===== 유저 현황 =====
export async function getUsersCount() {
  const res = await client.get('/api/admin/stats/users/count')
  return unwrap(res)
}

export async function getUsersSignups({ period = 'daily', from, to } = {}) {
  const res = await client.get('/api/admin/stats/users/signups', {
    params: { period, ...(from && { from }), ...(to && { to }) },
  })
  return unwrap(res)
}

export async function getUsersBySkinType() {
  const res = await client.get('/api/admin/stats/users/by-skin-type')
  return unwrap(res)
}

export async function getUsersByProvider() {
  const res = await client.get('/api/admin/stats/users/by-provider')
  return unwrap(res)
}

export async function getSurveyCompletion() {
  const res = await client.get('/api/admin/stats/survey/completion')
  return unwrap(res)
}

// ===== 분석 활동 =====
export async function getAnalysisDaily({ from, to } = {}) {
  const res = await client.get('/api/admin/stats/analysis/daily', {
    params: { ...(from && { from }), ...(to && { to }) },
  })
  return unwrap(res)
}

export async function getAnalysisTraffic({ from, to } = {}) {
  const res = await client.get('/api/admin/stats/analysis/traffic', {
    params: { ...(from && { from }), ...(to && { to }) },
  })
  return unwrap(res)
}

export async function getTopAnalyzedProducts({ limit = 10 } = {}) {
  const res = await client.get('/api/admin/stats/analysis/top-products', {
    params: { limit },
  })
  return unwrap(res)
}

export async function getTopRiskIngredients({ limit = 10, minRiskLevel = 7 } = {}) {
  const res = await client.get('/api/admin/stats/ingredients/top-risk', {
    params: { limit, min_risk_level: minRiskLevel },
  })
  return unwrap(res)
}

// ===== 제품/리뷰 =====
export async function getTopRatedProducts({ limit = 10, minReviews = 5 } = {}) {
  const res = await client.get('/api/admin/products/top-rated', {
    params: { limit, min_reviews: minReviews },
  })
  return unwrap(res)
}

export async function getProductsByCategory({ limit } = {}) {
  const res = await client.get('/api/admin/products/by-category', {
    params: { ...(limit && { limit }) },
  })
  return unwrap(res) // { success, distribution: [{ category_id, category_name, count }], total }
}

export async function listAdminReviews({
  page = 1,
  size = 20,
  sort = 'recent',
  status = 'all',
} = {}) {
  const res = await client.get('/api/admin/reviews', {
    params: { page, size, sort, status },
  })
  return unwrap(res)
}

export async function moderateReview(reviewId, action, reason) {
  const res = await client.patch(
    `/api/admin/reviews/${reviewId}/moderate`,
    { action, ...(reason && { reason }) }
  )
  return unwrap(res)
}

// ===== 활동 로그 (전체 유저) =====
export async function getActivityLogs({ limit = 100, kind = 'all' } = {}) {
  const res = await client.get('/api/admin/activity-logs', {
    params: { limit, kind },
  })
  return unwrap(res) // { success, count, logs: [{ id, kind, user_id, nickname, time, title, detail, traffic_light, risk_score }] }
}

// ===== 챗봇 =====
export async function getChatUsage({ from, to } = {}) {
  const res = await client.get('/api/admin/stats/chat/usage', {
    params: { ...(from && { from }), ...(to && { to }) },
  })
  return unwrap(res)
}

export async function getChatIntents() {
  const res = await client.get('/api/admin/stats/chat/intents')
  return unwrap(res)
}
