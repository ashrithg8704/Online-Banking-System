import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  SwapHoriz,
  History,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import accountService from '../services/accountService'
import transactionService from '../services/transactionService'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [accounts, setAccounts] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [accountsData, transactionsData] = await Promise.all([
        accountService.getMyAccounts(),
        transactionService.getMyTransactions(0, 5)
      ])
      
      setAccounts(accountsData)
      setRecentTransactions(transactionsData.content || [])
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + parseFloat(account.balance), 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}!
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalance color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(getTotalBalance())}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Accounts
                  </Typography>
                  <Typography variant="h5">
                    {accounts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SwapHoriz color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Recent Transactions
                  </Typography>
                  <Typography variant="h5">
                    {recentTransactions.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <History color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Account Status
                  </Typography>
                  <Chip label="Active" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Accounts Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Accounts
              </Typography>
              {accounts.length === 0 ? (
                <Typography color="textSecondary">
                  No accounts found. Create your first account to get started.
                </Typography>
              ) : (
                accounts.map((account) => (
                  <Box
                    key={account.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid #eee"
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {account.accountType} Account
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {account.accountNumber}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {recentTransactions.length === 0 ? (
                <Typography color="textSecondary">
                  No recent transactions found.
                </Typography>
              ) : (
                recentTransactions.map((transaction) => (
                  <Box
                    key={transaction.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid #eee"
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {transaction.transactionType}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(transaction.transactionDate)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.description || 'No description'}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="subtitle1"
                        color={transaction.transactionType === 'TRANSFER' ? 'error' : 'success'}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
