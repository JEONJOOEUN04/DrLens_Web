import { client, unwrap } from './client'

// ===== 프로필 =====
export async function getProfile(userId) {
  const res = await client.get(`/api/users/profile/${userId}/`)
  return unwrap(res)
}

export async function updateNickname(userId, nickname) {
  const res = await client.patch(`/api/users/profile/${userId}/nickname/`, { nickname })
  return unwrap(res)
}

export async function deleteAccount(userId) {
  const res = await client.delete(`/api/users/delete/${userId}/`)
  return unwrap(res)
}

// ===== 피부 프로필 =====
export async function getSkinProfile(userId) {
  const res = await client.get(`/api/users/skin-profile/${userId}/`)
  return unwrap(res)
}

export async function updateSkinProfile(userId, payload) {
  const res = await client.patch(`/api/users/skin-profile/${userId}/update/`, payload)
  return unwrap(res)
}

// ===== 설문 =====
export async function submitSurvey({ user_id, selected_option_ids }) {
  const res = await client.post('/api/users/survey/', { user_id, selected_option_ids })
  return unwrap(res)
}

// ===== 마이페이지 =====
export async function getMyPage(userId) {
  const res = await client.get(`/api/users/mypage/${userId}/`)
  return unwrap(res)
}

export async function getMyLikes(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/users/mypage/${userId}/likes/`, {
    params: { page, size },
  })
  return unwrap(res)
}

export async function getMyReviews(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/users/mypage/${userId}/reviews/`, {
    params: { page, size },
  })
  return unwrap(res)
}

export async function getMyAnalysis(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/users/mypage/${userId}/analysis/`, {
    params: { page, size },
  })
  return unwrap(res)
}

export async function getMyRecommendations(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/users/mypage/${userId}/recommendations/`, {
    params: { page, size },
  })
  return unwrap(res)
}

// ===== 카카오 로그인 =====
export async function getKakaoAuthUrl() {
  const res = await client.get('/api/users/kakao/')
  return unwrap(res)
}
