import api from './api'

const transactionService = {
  transfer: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData)
    return response.data
  },

  getAccountTransactions: async (accountNumber, page = 0, size = 10) => {
    const response = await api.get(`/transactions/account/${accountNumber}?page=${page}&size=${size}`)
    return response.data
  },

  getMyTransactions: async (page = 0, size = 10) => {
    const response = await api.get(`/transactions/my-transactions?page=${page}&size=${size}`)
    return response.data
  },

  generateStatement: async (accountNumber, startDate, endDate) => {
    const response = await api.get(
      `/transactions/account/${accountNumber}/statement?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' }
    )
    return response.data
  },
}

export default transactionService
