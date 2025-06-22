import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import { Add, AccountBalance, Visibility } from '@mui/icons-material'
import accountService from '../services/accountService'
import { toast } from 'react-toastify'

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [newAccountType, setNewAccountType] = useState('')
  const [amount, setAmount] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await accountService.getMyAccounts()
      setAccounts(data)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load accounts'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    try {
      setActionLoading(true)
      await accountService.createAccount(newAccountType)
      toast.success('Account created successfully!')
      setCreateDialogOpen(false)
      setNewAccountType('')
      fetchAccounts()
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to create account'
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeposit = async () => {
    try {
      setActionLoading(true)
      await accountService.deposit(selectedAccount.accountNumber, parseFloat(amount))
      toast.success('Deposit successful!')
      setDepositDialogOpen(false)
      setAmount('')
      setSelectedAccount(null)
      fetchAccounts()
    } catch (error) {
      const errorMessage = error.response?.data || 'Deposit failed'
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      setActionLoading(true)
      await accountService.withdraw(selectedAccount.accountNumber, parseFloat(amount))
      toast.success('Withdrawal successful!')
      setWithdrawDialogOpen(false)
      setAmount('')
      setSelectedAccount(null)
      fetchAccounts()
    } catch (error) {
      const errorMessage = error.response?.data || 'Withdrawal failed'
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid item xs={12} md={6} lg={4} key={account.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {account.accountType} Account
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {account.accountNumber}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(account.balance)}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Created: {formatDate(account.createdAt)}
                  </Typography>
                  <Chip
                    label={account.active ? 'Active' : 'Inactive'}
                    color={account.active ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedAccount(account)
                      setDepositDialogOpen(true)
                    }}
                  >
                    Deposit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedAccount(account)
                      setWithdrawDialogOpen(true)
                    }}
                  >
                    Withdraw
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {accounts.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <AccountBalance sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No accounts found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Create your first account to get started with online banking
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value)}
              label="Account Type"
            >
              <MenuItem value="SAVINGS">Savings Account</MenuItem>
              <MenuItem value="CHECKING">Checking Account</MenuItem>
              <MenuItem value="BUSINESS">Business Account</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={!newAccountType || actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)}>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Account: {selectedAccount?.accountNumber}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0.01, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            disabled={!amount || parseFloat(amount) <= 0 || actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Deposit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)}>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Account: {selectedAccount?.accountNumber}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Available Balance: {selectedAccount && formatCurrency(selectedAccount.balance)}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0.01, step: 0.01, max: selectedAccount?.balance }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > selectedAccount?.balance ||
              actionLoading
            }
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Accounts
