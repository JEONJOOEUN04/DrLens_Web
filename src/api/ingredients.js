import { client, unwrap } from './client'

export async function listIngredients({ page = 1, size = 50 } = {}) {
  const res = await client.get('/api/products/ingredients/', { params: { page, size } })
  return unwrap(res) // { success, page, count, ingredients }
}

export async function searchIngredients(name) {
  const res = await client.get('/api/products/ingredients/search/', { params: { name } })
  return unwrap(res) // { success, keyword, count, results }
}

export async function getIngredient(ingredientId) {
  const res = await client.get(`/api/products/ingredients/${ingredientId}/`)
  return unwrap(res)
}
