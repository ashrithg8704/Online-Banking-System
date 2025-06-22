import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material'
import {
  Person,
  Security,
  Delete,
  Visibility,
  AdminPanelSettings,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import adminService from '../services/adminService'
import { toast } from 'react-toastify'

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0)
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { isAdmin, user } = useAuth()

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user)
    console.log('Is admin?', isAdmin())
  }, [user])

  useEffect(() => {
    if (tabValue === 0) {
      fetchUsers()
    } else {
      fetchAuditLogs()
    }
  }, [tabValue])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users...')
      const data = await adminService.getAllUsers()
      console.log('Users fetched successfully:', data)
      setUsers(data)
      setError('') // Clear any previous errors
    } catch (error) {
      console.error('Error fetching users:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load users'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAuditLogs()
      setAuditLogs(data.content || [])
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load audit logs'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteUser = async (userId) => {
    try {
      setActionLoading(true)
      await adminService.promoteUser(userId)
      toast.success('User promoted to admin successfully!')
      fetchUsers()
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to promote user'
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true)
      await adminService.deleteUser(selectedUser.id)
      toast.success('User deactivated successfully!')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to deactivate user'
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
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

  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Access denied. You need administrator privileges to view this page.
      </Alert>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <AdminPanelSettings color="primary" sx={{ mr: 2 }} />
        <Typography variant="h4">Admin Panel</Typography>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="User Management" />
            <Tab label="Audit Logs" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* User Management Tab */}
              {tabValue === 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    System Users ({users.length})
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.enabled ? 'Active' : 'Inactive'}
                                color={user.enabled ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                {user.role !== 'ADMIN' && user.enabled && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Security />}
                                    onClick={() => handlePromoteUser(user.id)}
                                    disabled={actionLoading}
                                  >
                                    Promote
                                  </Button>
                                )}
                                {user.enabled && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setDeleteDialogOpen(true)
                                    }}
                                    disabled={actionLoading}
                                  >
                                    Deactivate
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Audit Logs Tab */}
              {tabValue === 1 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    System Audit Logs
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Entity</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {formatDate(log.createdAt)}
                            </TableCell>
                            <TableCell>{log.username}</TableCell>
                            <TableCell>
                              <Chip
                                label={log.action}
                                size="small"
                                variant="outlined"
                                color={
                                  log.action.includes('DELETE') || log.action.includes('FAILED')
                                    ? 'error'
                                    : log.action.includes('CREATE') || log.action.includes('SUCCESS')
                                    ? 'success'
                                    : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {log.entityType} {log.entityId && `(${log.entityId})`}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {log.details}
                              </Typography>
                            </TableCell>
                            <TableCell>{log.ipAddress || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {auditLogs.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="textSecondary">
                        No audit logs found
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm User Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate user "{selectedUser?.username}"?
            This action will disable their account and prevent them from logging in.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminPanel
