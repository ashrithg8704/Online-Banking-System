import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Download, FilterList } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import accountService from '../services/accountService'
import transactionService from '../services/transactionService'
import { toast } from 'react-toastify'

const Transactions = () => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'))
  const [endDate, setEndDate] = useState(dayjs())
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions()
    } else {
      fetchAllTransactions()
    }
  }, [selectedAccount, page])

  const fetchAccounts = async () => {
    try {
      const data = await accountService.getMyAccounts()
      setAccounts(data)
      if (data.length > 0) {
        setSelectedAccount(data[0].accountNumber)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load accounts'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getAccountTransactions(selectedAccount, page, 10)
      setTransactions(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load transactions'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getMyTransactions(page, 10)
      setTransactions(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load transactions'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStatement = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account')
      return
    }

    try {
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()
      
      const pdfBlob = await transactionService.generateStatement(
        selectedAccount,
        startDateISO,
        endDateISO
      )
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `statement_${selectedAccount}_${startDate.format('YYYY-MM-DD')}_${endDate.format('YYYY-MM-DD')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Statement downloaded successfully!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate statement'
      toast.error(errorMessage)
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionColor = (transaction) => {
    if (transaction.transactionType === 'DEPOSIT') return 'success'
    if (transaction.transactionType === 'WITHDRAWAL') return 'error'
    if (transaction.transactionType === 'TRANSFER') {
      return transaction.fromAccountNumber === selectedAccount ? 'error' : 'success'
    }
    return 'default'
  }

  const getTransactionAmount = (transaction) => {
    if (transaction.transactionType === 'DEPOSIT') return `+${formatCurrency(transaction.amount)}`
    if (transaction.transactionType === 'WITHDRAWAL') return `-${formatCurrency(transaction.amount)}`
    if (transaction.transactionType === 'TRANSFER') {
      return transaction.fromAccountNumber === selectedAccount 
        ? `-${formatCurrency(transaction.amount)}`
        : `+${formatCurrency(transaction.amount)}`
    }
    return formatCurrency(transaction.amount)
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Transaction History
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    label="Account"
                  >
                    <MenuItem value="">All Accounts</MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.accountNumber}>
                        {account.accountType} - {account.accountNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleGenerateStatement}
                  disabled={!selectedAccount}
                >
                  Download Statement
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Transactions ({totalElements} total)
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : transactions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No transactions found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedAccount 
                    ? 'No transactions found for the selected account and date range.'
                    : 'You haven\'t made any transactions yet.'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>From Account</TableCell>
                        <TableCell>To Account</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Reference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {formatDate(transaction.transactionDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.transactionType}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {transaction.fromAccountNumber || '-'}
                          </TableCell>
                          <TableCell>
                            {transaction.toAccountNumber || '-'}
                          </TableCell>
                          <TableCell>
                            {transaction.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={getTransactionColor(transaction)}
                              fontWeight="medium"
                            >
                              {getTransactionAmount(transaction)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={
                                transaction.status === 'COMPLETED'
                                  ? 'success'
                                  : transaction.status === 'FAILED'
                                  ? 'error'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {transaction.referenceNumber}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalPages}
                      page={page + 1}
                      onChange={(event, value) => setPage(value - 1)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  )
}

export default Transactions
