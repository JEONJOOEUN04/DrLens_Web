import { client, unwrap } from './client'

export async function listProducts({ page = 1, size = 20 } = {}) {
  const res = await client.get('/api/products/', { params: { page, size } })
  return unwrap(res) // { success, page, count, products }
}

export async function searchProducts({ q, page = 1, size = 20, user_id } = {}) {
  const res = await client.get('/api/products/search/', {
    params: { q, page, size, ...(user_id && { user_id }) },
  })
  return unwrap(res)
}

export async function popularProducts({ page = 1, size = 20 } = {}) {
  const res = await client.get('/api/products/popular/', { params: { page, size } })
  return unwrap(res)
}

export async function getProduct(productId) {
  const res = await client.get(`/api/products/${productId}/`)
  return unwrap(res)
}

export async function getProductIngredients(productId) {
  const res = await client.get(`/api/products/${productId}/ingredients/`)
  return unwrap(res)
}

export async function listCategories() {
  const res = await client.get('/api/products/categories/')
  return unwrap(res)
}

export async function listByCategory(categoryId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/products/categories/${categoryId}/`, {
    params: { page, size },
  })
  return unwrap(res)
}
