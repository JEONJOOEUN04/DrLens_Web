import { client, unwrap } from './client'

// ===== CRUD =====
export async function createReview({ user_id, product_id, rating, review_text }) {
  const res = await client.post('/api/review/', {
    user_id,
    product_id,
    rating,
    review_text,
  })
  return unwrap(res)
}

export async function updateReview(reviewId, { user_id, rating, review_text }) {
  const res = await client.patch(`/api/review/${reviewId}/update/`, {
    user_id,
    ...(rating !== undefined && { rating }),
    ...(review_text !== undefined && { review_text }),
  })
  return unwrap(res)
}

export async function deleteReview(reviewId, userId) {
  const res = await client.delete(`/api/review/${reviewId}/delete/`, {
    data: { user_id: userId },
  })
  return unwrap(res)
}

// ===== 조회 =====
export async function listProductReviews(productId, { page = 1, size = 20, sort = 'latest' } = {}) {
  const res = await client.get(`/api/review/product/${productId}/`, {
    params: { page, size, sort },
  })
  return unwrap(res)
}

export async function listUserReviews(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/review/user/${userId}/`, { params: { page, size } })
  return unwrap(res)
}

// ===== 앱 피드백 =====
export async function createFeedback({ user_id, product_id, feedback_type, satisfaction_score, side_effect_text = '' }) {
  const res = await client.post('/api/review/feedback/', {
    user_id,
    product_id,
    feedback_type,
    satisfaction_score,
    side_effect_text,
  })
  return unwrap(res)
}

export async function listUserFeedback(userId) {
  const res = await client.get(`/api/review/feedback/${userId}/`)
  return unwrap(res)
}

// ===== 검색 로그 =====
export async function logSearch({ user_id, keyword, clicked_product_id }) {
  const res = await client.post('/api/review/search-log/', {
    user_id,
    keyword,
    ...(clicked_product_id && { clicked_product_id }),
  })
  return unwrap(res)
}

export async function getSearchHistory(userId) {
  const res = await client.get(`/api/review/search-history/${userId}/`)
  return unwrap(res)
}

export async function trendingKeywords() {
  const res = await client.get('/api/review/trending/')
  return unwrap(res)
}

// ===== 최근 본 제품 =====
export async function logProductView({ user_id, product_id }) {
  const res = await client.post('/api/review/product-view/', { user_id, product_id })
  return unwrap(res)
}

export async function getRecentlyViewed(userId) {
  const res = await client.get(`/api/review/recently-viewed/${userId}/`)
  return unwrap(res)
}

// ===== 리뷰 이미지 =====
export async function uploadReviewImages(reviewId, { user_id, files }) {
  const fd = new FormData()
  fd.append('user_id', user_id)
  files.forEach((f) => fd.append('images', f))
  const res = await client.post(`/api/review/${reviewId}/images/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(res)
}

export async function deleteReviewImage(reviewId, imageId, userId) {
  const res = await client.delete(`/api/review/${reviewId}/images/${imageId}/`, {
    params: { user_id: userId },
  })
  return unwrap(res)
}
