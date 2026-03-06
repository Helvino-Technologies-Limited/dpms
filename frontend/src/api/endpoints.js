import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (token) => api.post('/auth/refresh', null, { params: { token } }),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export const patientAPI = {
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  get: (id) => api.get(`/patients/${id}`),
  list: (params) => api.get('/patients', { params }),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, null, { params: { status } }),
  get: (id) => api.get(`/appointments/${id}`),
  today: () => api.get('/appointments/today'),
  range: (start, end) => api.get('/appointments/range', { params: { start, end } }),
  list: (params) => api.get('/appointments', { params }),
};

export const staffAPI = {
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  list: () => api.get('/staff'),
  dentists: () => api.get('/staff/dentists'),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const serviceAPI = {
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  list: () => api.get('/services'),
  delete: (id) => api.delete(`/services/${id}`),
};

export const dentalChartAPI = {
  getPatientChart: (patientId) => api.get(`/dental-chart/patient/${patientId}`),
  updateTooth: (patientId, toothNumber, data) =>
    api.put(`/dental-chart/patient/${patientId}/tooth/${toothNumber}`, data),
};

export const inventoryAPI = {
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  list: (params) => api.get('/inventory', { params }),
  lowStock: () => api.get('/inventory/low-stock'),
};

export const insuranceAPI = {
  createProvider: (data) => api.post('/insurance/providers', data),
  listProviders: () => api.get('/insurance/providers'),
  listClaims: (params) => api.get('/insurance/claims', { params }),
};

export const branchAPI = {
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  list: () => api.get('/branches'),
};

export const tenantAPI = {
  getProfile: () => api.get('/tenant/profile'),
  updateProfile: (data) => api.put('/tenant/profile', data),
};

export const supplierAPI = {
  create: (data) => api.post('/suppliers', data),
  list: () => api.get('/suppliers'),
};

export const treatmentAPI = {
  createPlan: (data) => api.post('/treatment-plans', data),
  listPlans: (params) => api.get('/treatment-plans', { params }),
  updatePlanStatus: (id, status) => api.patch(`/treatment-plans/${id}/status`, null, { params: { status } }),
  getPlanRecords: (id) => api.get(`/treatment-plans/${id}/records`),
  createRecord: (data) => api.post('/treatment-records', data),
};

export const prescriptionAPI = {
  create: (data) => api.post('/prescriptions', data),
  list: (params) => api.get('/prescriptions', { params }),
  getByPatient: (patientId, params) => api.get(`/prescriptions/patient/${patientId}`, { params }),
};
