import api from './api'

const adminService = {
  getAllUsers: async () => {
    console.log('AdminService: Making request to /admin/users')
    console.log('API base URL:', api.defaults.baseURL)
    const response = await api.get('/admin/users')
    console.log('AdminService: Response received:', response)
    return response.data
  },

  promoteUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/promote`)
    return response.data
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },

  getAuditLogs: async (page = 0, size = 20) => {
    const response = await api.get(`/admin/audit-logs?page=${page}&size=${size}`)
    return response.data
  },

  getUserAuditLogs: async (username, page = 0, size = 20) => {
    const response = await api.get(`/admin/audit-logs/user/${username}?page=${page}&size=${size}`)
    return response.data
  },

  getAuditLogsByAction: async (action, page = 0, size = 20) => {
    const response = await api.get(`/admin/audit-logs/action/${action}?page=${page}&size=${size}`)
    return response.data
  },
}

export default adminService
