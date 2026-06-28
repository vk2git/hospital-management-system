const BASE_URL = 'http://localhost:8000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  options.credentials = 'include';
  
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  try {
    const res = await fetch(url, options);
    
    if (!res.ok) {
      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        try {
          data = { detail: await res.text() };
        } catch (_) {}
      }
      
      const err = new Error(data?.detail || res.statusText || 'Request failed');
      err.response = {
        data: data || { detail: 'Request failed' },
        status: res.status,
        statusText: res.statusText,
      };
      throw err;
    }

    if (res.status === 204) {
      return { data: null };
    }
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return { data };
    }
    return { data: null };
  } catch (err) {
    if (!err.response) {
      err.response = {
        data: { detail: err.message || 'Network error' }
      };
    }
    throw err;
  }
}

const api = {
  get: (url, config) => request(url, { method: 'GET', ...config }),
  post: (url, body, config) => request(url, { method: 'POST', body, ...config }),
  put: (url, body, config) => request(url, { method: 'PUT', body, ...config }),
  patch: (url, body, config) => request(url, { method: 'PATCH', body, ...config }),
  delete: (url, config) => request(url, { method: 'DELETE', ...config }),
};

export default api;

// ── Auth Endpoints ────────────────────────────────────────────────────────
export const login = (credentials) => api.post('/auth/login', credentials);
export const checkEmail = (email) => api.post('/auth/check-email', { email });
export const setPassword = (data) => api.post('/auth/set-password', data);
export const logout = () => api.post('/auth/logout');
export const registerPatient = (data) => api.post('/auth/register', data);
export const registerStaff = (data) => api.post('/auth/register/staff', data);
export const getMe = () => api.get('/auth/me');
export const requestPasswordReset = () => api.post('/auth/account-request', { type: 'password_reset' });
export const requestAccountDeletion = () => api.post('/auth/account-request', { type: 'account_deletion' });

// ── Patient Endpoints ─────────────────────────────────────────────────────
export const getPatientProfile = () => api.get('/patient/profile');
export const updatePatientProfile = (data) => api.patch('/patient/profile', data);
export const getPatientAppointments = () => api.get('/patient/appointments');
export const bookAppointment = (data) => api.post('/patient/appointments', data);
export const cancelPatientAppointment = (id) => api.delete(`/patient/appointments/${id}`);
export const getAvailableDoctors = () => api.get('/patient/doctors');
export const getAvailableTimeSlots = (doctorId, date) => api.get(`/patient/time-slots?doctor_id=${doctorId}&date=${date}`);
export const getPatientMedicalRecords = () => api.get('/patient/medical-records');
export const getPatientMedicalRecordsAiSummary = () => api.get('/patient/medical-records/ai-summary');
export const getPatientPrescriptions = () => api.get('/patient/prescriptions');
export const sharePrescription = (id) => api.post(`/patient/prescriptions/${id}/share`);
export const getPatientPayments = () => api.get('/patient/payments');
export const getHospitalPrivacySettings = () => api.get('/patient/hospitals/privacy');
export const updateHospitalPrivacy = (data) => api.patch('/patient/hospitals/privacy', data);
export const toggleAppointmentSharing = (id, shareMedicalSummary) => api.patch(`/patient/appointments/${id}/share`, { share_medical_summary: shareMedicalSummary });

// ── Doctor Endpoints ──────────────────────────────────────────────────────
export const getDoctorAppointments = () => api.get('/doctor/appointments');
export const completeDoctorAppointment = (id) => api.patch(`/doctor/appointments/${id}/complete`);
export const cancelDoctorAppointment = (id) => api.patch(`/doctor/appointments/${id}/cancel`);
export const reassignDoctorAppointment = (id, newDoctorId) => api.patch(`/doctor/appointments/${id}/reassign`, { new_doctor_id: newDoctorId });
export const getSharedPatientSummary = (id) => api.get(`/doctor/appointments/${id}/shared-summary`);
export const getDoctorPatients = (search) => api.get('/doctor/patients' + (search ? `?search=${encodeURIComponent(search)}` : ''));
export const getDoctorPatientRecords = (patientId) => api.get(`/doctor/patients/${patientId}/records`);
export const createMedicalRecord = (data) => api.post('/doctor/medical-records', data);
export const getDoctorPrescriptions = () => api.get('/doctor/prescriptions');
export const createPrescription = (data) => api.post('/doctor/prescriptions', data);
export const generateAiPrescription = (data) => api.post('/doctor/prescriptions/ai-generate', data);
export const smartSearchPatients = (query) => api.post('/doctor/smart-search', { query });
export const getOtherDoctors = () => api.get('/doctor/other-doctors');

// ── Admin Endpoints ───────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getAccountRequests = (status) => api.get('/admin/account-requests' + (status ? `?status=${status}` : ''));
export const approveAccountRequest = (id, adminNotes, newPassword) => api.patch(`/admin/account-requests/${id}/approve`, { admin_notes: adminNotes, new_password: newPassword });
export const rejectAccountRequest = (id, adminNotes) => api.patch(`/admin/account-requests/${id}/reject`, { admin_notes: adminNotes });
export const getAdminUsers = (role) => api.get('/admin/users' + (role ? `?role=${role}` : ''));
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminDoctors = () => api.get('/admin/doctors');
export const createDoctor = (data) => api.post('/admin/doctors', data);
export const getHospitals = () => api.get('/admin/hospitals');
export const createHospital = (data) => api.post('/admin/hospitals', data);
export const createHospitalRole = (data) => api.post('/admin/roles', data);

// ── Staff Endpoints ───────────────────────────────────────────────────────
export const getStaffProfile = () => api.get('/staff/profile');
export const getStaffMembers = () => api.get('/staff/members');
export const getStaffInvitations = () => api.get('/staff/invitations');
export const inviteStaff = (data) => api.post('/staff/invitations', data);

// ── Pharmacy Endpoints ────────────────────────────────────────────────────
export const verifyPrescription = (token) => api.post('/pharmacy/prescriptions/verify', { access_token: token });
export const getInventory = () => api.get('/pharmacy/inventory');
export const addInventoryItem = (data) => api.post('/pharmacy/inventory', data);
export const updateInventoryItem = (id, data) => api.patch(`/pharmacy/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/pharmacy/inventory/${id}`);
export const getPharmacyAnalytics = () => api.get('/pharmacy/analytics');

// ── Notifications Endpoints ───────────────────────────────────────────────
export const getNotifications = (limit = 50) => api.get(`/notifications?limit=${limit}`);
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// ── Chatbot Endpoints ─────────────────────────────────────────────────────
export const sendChatbotMessage = (message) => api.post('/chatbot/message', { message });
