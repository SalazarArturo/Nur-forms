import api from './client'

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Campaigns
export const campaignsApi = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  remove: (id) => api.delete(`/campaigns/${id}`),
  duplicate: (id) => api.post(`/campaigns/${id}/duplicate`),
  addMember: (id, data) => api.post(`/campaigns/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/campaigns/${id}/members/${memberId}`),
}

// Forms
export const formsApi = {
  getByCampaign: (campaignId) => api.get(`/forms/campaign/${campaignId}`),
  getById: (id) => api.get(`/forms/${id}`),
  getPublic: (id) => api.get(`/forms/public/${id}`),
  create: (data) => api.post('/forms', data),
  update: (id, data) => api.put(`/forms/${id}`, data),
  remove: (id) => api.delete(`/forms/${id}`),
  duplicate: (id) => api.post(`/forms/${id}/duplicate`),
  publish: (id) => api.patch(`/forms/${id}/publish`),
  close: (id) => api.patch(`/forms/${id}/close`),
}

// Questions
export const questionsApi = {
  getByForm: (formId) => api.get(`/questions/form/${formId}`),
  create: (formId, data) => api.post(`/questions/form/${formId}`, data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  remove: (id) => api.delete(`/questions/${id}`),
  reorder: (formId, orderedIds) => api.patch(`/questions/form/${formId}/reorder`, { orderedIds }),
}

// Submissions
export const submissionsApi = {
  start: (formId, data) => api.post(`/submissions/form/${formId}/start`, data),
  saveAnswers: (id, answers, token) => api.patch(`/submissions/${id}/answers`, { answers, respondentToken: token }),
  submit: (id, token) => api.patch(`/submissions/${id}/submit`, { respondentToken: token }),
  getByForm: (formId) => api.get(`/submissions/form/${formId}`),
  getByToken: (token) => api.get(`/submissions/token/${token}`),
}

// Reports
export const reportsApi = {
  getSummary: (formId) => api.get(`/reports/${formId}/summary`),
  getByQuestion: (formId) => api.get(`/reports/${formId}/by-question`),
  getIndividual: (formId) => api.get(`/reports/${formId}/individual`),
  exportCSV: (formId) => api.get(`/reports/${formId}/export/csv`, { responseType: 'text' }),
  getMatchingKey: (formId) => api.get(`/reports/${formId}/matching-key`),
}

// Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
}

// Invitations
export const invitationsApi = {
  getByForm: (formId) => api.get(`/invitations/form/${formId}`),
  create: (formId, data) => api.post(`/invitations/form/${formId}`, data),
  remove: (id) => api.delete(`/invitations/${id}`),
  validate: (formId, token) => api.get(`/invitations/form/${formId}/validate?token=${token}`),
}
