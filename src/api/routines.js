import { client, unwrap } from './client'

export async function createRoutine({ user_id, title, is_public = true, steps = [] }) {
  const res = await client.post('/api/recommendation/routine/', {
    user_id,
    title,
    is_public,
    steps,
  })
  return unwrap(res)
}

export async function updateRoutine(routineId, { user_id, title, is_public, steps }) {
  const res = await client.patch(`/api/recommendation/routine/${routineId}/`, {
    user_id,
    ...(title !== undefined && { title }),
    ...(is_public !== undefined && { is_public }),
    ...(steps !== undefined && { steps }),
  })
  return unwrap(res)
}

export async function deleteRoutine(routineId, userId) {
  const res = await client.delete(`/api/recommendation/routine/${routineId}/delete/`, {
    params: { user_id: userId },
  })
  return unwrap(res)
}

export async function getUserRoutines(userId) {
  const res = await client.get(`/api/recommendation/routine/user/${userId}/`)
  return unwrap(res)
}

export async function getPopularRoutines(skinTypeCode) {
  const res = await client.get(`/api/recommendation/routine/popular/${skinTypeCode}/`)
  return unwrap(res)
}
