import axios from 'axios'

// ── AXIOS INSTANCE ────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — JWT token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — token yenile / cihaz çakışması yakala
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original  = error.config
    const errCode   = error.response?.data?.code
    const errStatus = error.response?.status

    // ── Cihaz çakışması: başka cihazda oturum açıldı ──────────
    if (errCode === 'device_conflict') {
      localStorage.clear()
      sessionStorage.setItem('logout_reason', 'device_conflict')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── Normal 401: access token süresi doldu → refresh dene ──
    if (errStatus === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/auth/token/refresh/`,
          { refresh }
        )
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login:          (data)   => api.post('/auth/login/', data),
  register:       (data)   => api.post('/auth/register/', data),
  logout:         (data)   => api.post('/auth/logout/', data),
  me:             ()       => api.get('/auth/me/'),
  updateMe:       (data)   => api.patch('/auth/me/', data),
  forgotPassword: (data)   => api.post('/auth/password-reset/', data),
}

// ── USERS ─────────────────────────────────────────────────────
export const usersAPI = {
  list:            (params)      => api.get('/users/', { params }),
  get:             (id)          => api.get(`/users/${id}/`),
  create:          (data)        => api.post('/users/', data),
  update:          (id, d)       => api.patch(`/users/${id}/`, d),
  suspend:         (id)          => api.post(`/users/${id}/suspend/`),
  activate:        (id)          => api.post(`/users/${id}/activate/`),
  resetPassword:   (id)          => api.post(`/users/${id}/reset_password/`),
  grantFreePeriod: (id, days, plan) => api.post(`/users/${id}/grant_free_period/`, { days, plan }),
  trainers:        ()             => api.get('/trainers/'),
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────
export const subscriptionsAPI = {
  list:   (params) => api.get('/subscriptions/', { params }),
  create: (data)   => api.post('/subscriptions/', data),
  cancel: (id)     => api.post(`/subscriptions/${id}/cancel/`),
}

// ── COURSES ───────────────────────────────────────────────────
export const coursesAPI = {
  list: () => api.get('/books/'),
  get:  (id) => api.get(`/books/${id}/`),
}

// ── FLASHCARDS ────────────────────────────────────────────────
export const cardsAPI = {
  list:    (params) => api.get('/cards/', { params }),
  get:     (id)     => api.get(`/cards/${id}/`),
  create:  (data)   => api.post('/cards/', data),
  update:  (id, d)  => api.patch(`/cards/${id}/`, d),
  delete:  (id)     => api.delete(`/cards/${id}/`),
  approve: (id)     => api.post(`/cards/${id}/approve/`),
  reject:  (id)     => api.post(`/cards/${id}/reject/`),
  due:     ()       => api.get('/cards/due/'),
  rate:    (id, confidence) => api.post(`/cards/${id}/rate/`, { confidence }),
  progress: ()      => api.get('/cards/progress/'),
}

// ── QUIZ ──────────────────────────────────────────────────────
export const quizAPI = {
  list:   (params) => api.get('/quiz/', { params }),
  get:    (id)     => api.get(`/quiz/${id}/`),
  create: (data)   => api.post('/quiz/', data),
  update: (id, d)  => api.patch(`/quiz/${id}/`, d),
  delete: (id)     => api.delete(`/quiz/${id}/`),
  submit: (data)   => api.post('/quiz/submit/', data),
}

// ── QUESTIONS ─────────────────────────────────────────────────
export const questionsAPI = {
  list:   (params) => api.get('/questions/', { params }),
  create: (data)   => api.post('/questions/', data),
  answer: (id, d)  => api.post(`/questions/${id}/answer/`, d),
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsAPI = {
  list: (params) => api.get('/notifications/', { params }),
  send: (data)   => api.post('/notifications/send/', data),
}

// ── AI ────────────────────────────────────────────────────────
export const aiAPI = {
  generateCards: (data) => api.post('/ai/generate-cards/', data),
}

// ── REPORTS ───────────────────────────────────────────────────
export const reportsAPI = {
  get: (params) => api.get('/reports/', { params }),
}

// ── LIBRARY ───────────────────────────────────────────────────
export const libraryAPI = {
  list:   (params) => api.get('/library/', { params }),
  get:    (id)     => api.get(`/library/${id}/`),
  upload: (formData) => api.post('/library/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:        (id)         => api.delete(`/library/${id}/`),
  update:        (id, d)      => api.patch(`/library/${id}/`, d),
  generateCards: (id, params) => api.post(`/library/${id}/generate-cards/`, params),
}

// ── DUS SINAV SORULARI ────────────────────────────────────────
export const examQuestionsAPI = {
  list:   (params) => api.get('/exam-questions/', { params }),
  create: (data)   => api.post('/exam-questions/', data),
  update: (id, d)  => api.patch(`/exam-questions/${id}/`, d),
  delete: (id)     => api.delete(`/exam-questions/${id}/`),
}

// ── KART AI + DUS SORUSU ──────────────────────────────────────
export const cardExtrasAPI = {
  generateQuestion: (cardId) => api.post(`/cards/${cardId}/generate_question/`),
  dusQuestion:      (cardId) => api.get(`/cards/${cardId}/dus_question/`),
}

// ── IMAGE CARDS (BİLGİ KARTLARI) ─────────────────────────────
export const imageCardsAPI = {
  list:    (params)       => api.get('/image-cards/', { params }),
  get:     (id)           => api.get(`/image-cards/${id}/`),
  upload:  (formData)     => api.post('/image-cards/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:  (id, formData) => api.patch(`/image-cards/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:  (id)           => api.delete(`/image-cards/${id}/`),
  approve: (id)           => api.post(`/image-cards/${id}/approve/`),
  reject:  (id)           => api.post(`/image-cards/${id}/reject/`),
}

// ── USER ACTIVITY LOG ─────────────────────────────────────────
export const activityAPI = {
  log: (data) => api.post('/activities/', data),
  // data: { action, entity_type, entity_id, metadata, session_id }
  // action örnekleri: card_viewed, card_rated, image_card_known,
  //   image_card_review, image_card_skipped, quiz_started, deck_opened, page_visited
  list:    (params) => api.get('/activities/', { params }),
  summary: ()       => api.get('/activities/summary/'),
}

export default api
