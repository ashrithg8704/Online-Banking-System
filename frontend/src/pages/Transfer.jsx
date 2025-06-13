import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material'
import { SwapHoriz } from '@mui/icons-material'
import accountService from '../services/accountService'
import transactionService from '../services/transactionService'
import { toast } from 'react-toastify'

const Transfer = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [transferLoading, setTransferLoading] = useState(false)
  const [error, setError] = useState('')
  const [transferData, setTransferData] = useState({
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: '',
    description: '',
  })

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

  const handleInputChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    
    if (transferData.fromAccountNumber === transferData.toAccountNumber) {
      toast.error('Cannot transfer to the same account')
      return
    }

    try {
      setTransferLoading(true)
      const response = await transactionService.transfer({
        ...transferData,
        amount: parseFloat(transferData.amount),
      })
      
      toast.success('Transfer completed successfully!')
      
      // Reset form
      setTransferData({
        fromAccountNumber: '',
        toAccountNumber: '',
        amount: '',
        description: '',
      })
      
      // Refresh accounts to show updated balances
      fetchAccounts()
    } catch (error) {
      const errorMessage = error.response?.data || 'Transfer failed'
      toast.error(errorMessage)
    } finally {
      setTransferLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getSelectedFromAccount = () => {
    return accounts.find(account => account.accountNumber === transferData.fromAccountNumber)
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
        Transfer Funds
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <SwapHoriz color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Transfer Money</Typography>
              </Box>

              <Box component="form" onSubmit={handleTransfer}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>From Account</InputLabel>
                      <Select
                        name="fromAccountNumber"
                        value={transferData.fromAccountNumber}
                        onChange={handleInputChange}
                        label="From Account"
                        required
                      >
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.accountNumber}>
                            {account.accountType} - {account.accountNumber} 
                            ({formatCurrency(account.balance)})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="toAccountNumber"
                      label="To Account Number"
                      value={transferData.toAccountNumber}
                      onChange={handleInputChange}
                      required
                      helperText="Enter the recipient's account number"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="amount"
                      label="Amount"
                      type="number"
                      value={transferData.amount}
                      onChange={handleInputChange}
                      required
                      inputProps={{ 
                        min: 0.01, 
                        step: 0.01,
                        max: getSelectedFromAccount()?.balance || 0
                      }}
                      helperText={
                        getSelectedFromAccount() 
                          ? `Available: ${formatCurrency(getSelectedFromAccount().balance)}`
                          : 'Select from account first'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="description"
                      label="Description (Optional)"
                      value={transferData.description}
                      onChange={handleInputChange}
                      helperText="Add a note for this transfer"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => setTransferData({
                          fromAccountNumber: '',
                          toAccountNumber: '',
                          amount: '',
                          description: '',
                        })}
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={
                          !transferData.fromAccountNumber ||
                          !transferData.toAccountNumber ||
                          !transferData.amount ||
                          parseFloat(transferData.amount) <= 0 ||
                          parseFloat(transferData.amount) > (getSelectedFromAccount()?.balance || 0) ||
                          transferLoading
                        }
                      >
                        {transferLoading ? <CircularProgress size={24} /> : 'Transfer'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transfer Limits & Information
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Daily Transfer Limit
                </Typography>
                <Typography variant="h6" color="primary">
                  $10,000.00
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Transfer Fee
                </Typography>
                <Typography variant="h6" color="success.main">
                  FREE
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Processing Time
                </Typography>
                <Typography variant="body1">
                  Instant
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Security Notice:</strong> Always verify the recipient's account number before transferring funds. Transfers cannot be reversed once completed.
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {accounts.length === 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Alert severity="warning">
                  You need at least one account to make transfers. Please create an account first.
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default Transfer
