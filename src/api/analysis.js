import { client, unwrap } from './client'

// ===== OCR / 이미지 업로드 =====
export async function uploadImage({ user_id, product_id, image_type = 'ingredient_label', file }) {
  const fd = new FormData()
  fd.append('user_id', user_id)
  if (product_id) fd.append('product_id', product_id)
  fd.append('image_type', image_type)
  fd.append('image', file)
  const res = await client.post('/api/analysis/upload-image/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(res)
}

export async function submitOcrResult(payload) {
  // { user_id, product_id, raw_text, ingredients, ocr_confidence, ocr_image_id }
  const res = await client.post('/api/analysis/ocr-result/', payload)
  return unwrap(res)
}

export async function analyzeProduct({ user_id, product_id }) {
  const res = await client.post('/api/analysis/analyze-product/', { user_id, product_id })
  return unwrap(res)
}

export async function requestOcr({ user_id, image_url, file }) {
  // file 또는 image_url 둘 중 하나
  if (file) {
    const fd = new FormData()
    fd.append('user_id', user_id)
    fd.append('image', file)
    const res = await client.post('/api/analysis/request-ocr/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap(res)
  }
  const fd = new FormData()
  fd.append('user_id', user_id)
  fd.append('image_url', image_url)
  const res = await client.post('/api/analysis/request-ocr/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(res)
}

// ===== 분석 결과 조회/삭제 =====
export async function getAnalysisDetail(analysisId) {
  const res = await client.get(`/api/analysis/detail/${analysisId}/`)
  return unwrap(res)
}

export async function deleteAnalysis(analysisId, userId) {
  const res = await client.delete(`/api/analysis/delete/${analysisId}/`, {
    params: { user_id: userId },
  })
  return unwrap(res)
}

export async function getAnalysisHistory(userId, { page = 1, size = 20 } = {}) {
  const res = await client.get(`/api/analysis/history/${userId}/`, {
    params: { page, size },
  })
  return unwrap(res)
}

// ===== 챗봇 =====
export async function chat({ user_id, message }) {
  const res = await client.post('/api/analysis/chat/', { user_id, message })
  return unwrap(res)
}

export async function startChatSession(user_id) {
  const res = await client.post('/api/analysis/chat/start/', { user_id })
  return unwrap(res)
}

export async function sendChatMessage({ user_id, session_id, message }) {
  const res = await client.post('/api/analysis/chat/message/', {
    user_id,
    session_id,
    message,
  })
  return unwrap(res)
}

export async function getChatHistory(sessionId) {
  const res = await client.get(`/api/analysis/chat/history/${sessionId}/`)
  return unwrap(res)
}

export async function getChatSessions(userId) {
  const res = await client.get(`/api/analysis/chat/sessions/${userId}/`)
  return unwrap(res)
}
