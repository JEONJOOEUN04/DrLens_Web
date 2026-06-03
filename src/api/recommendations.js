import { client, unwrap } from './client'

export async function generateRecommendations({ user_id, category_id, top_n = 10 } = {}) {
  const res = await client.post('/api/recommendation/generate/', {
    user_id,
    ...(category_id && { category_id }),
    top_n,
  })
  return unwrap(res)
}

export async function getUserRecommendations(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/recommendation/user/${userId}/`, {
    params: { page, size },
  })
  return unwrap(res)
}

export async function toggleLike({ user_id, product_id }) {
  const res = await client.post('/api/recommendation/like/', { user_id, product_id })
  return unwrap(res)
}

export async function getLikeStatus(userId, productId) {
  const res = await client.get(`/api/recommendation/like/${userId}/${productId}/`)
  return unwrap(res)
}
