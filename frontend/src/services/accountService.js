import api from './api'

const accountService = {
  getMyAccounts: async () => {
    const response = await api.get('/accounts/my-accounts')
    return response.data
  },

  createAccount: async (accountType) => {
    const response = await api.post(`/accounts/create?accountType=${accountType}`)
    return response.data
  },

  getAccountBalance: async (accountNumber) => {
    const response = await api.get(`/accounts/${accountNumber}/balance`)
    return response.data
  },

  deposit: async (accountNumber, amount) => {
    const response = await api.post(`/accounts/${accountNumber}/deposit?amount=${amount}`)
    return response.data
  },

  withdraw: async (accountNumber, amount) => {
    const response = await api.post(`/accounts/${accountNumber}/withdraw?amount=${amount}`)
    return response.data
  },
}

export default accountService
