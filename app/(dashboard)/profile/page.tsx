'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Settings, Shield, Edit, Save, X, Eye, EyeOff, Lock, Camera, Download, Trash2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { authAPI } from '@/lib/api'
import { profileAPI, type UserStats as ProfileUserStats } from '@/lib/profile-api'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import { authErrorHandler } from '@/lib/auth-error-handler'
import AuthCheck from '@/components/AuthCheck'

interface UserStats {
  total_transactions: number
  total_income: number
  total_expenses: number
  net_worth: number
  total_debt_loans: number
  total_lent: number
  total_borrowed: number
  debt_loan_balance: number
  member_since: string
}

export default function ProfilePage() {
  const { user: contextUser, isLoading: userLoading, refreshUser, logout } = useAuthContext()
  const [user, setUser] = useState(contextUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    display_name: '',
    description: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    dark_mode: false,
    currency: 'NPR',
    date_format: 'YYYY-MM-DD',
  })

  // Update form data when user data loads
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser)
      setFormData({
        first_name: contextUser.first_name || '',
        last_name: contextUser.last_name || '',
        email: contextUser.email || '',
        display_name: contextUser.display_name || '',
        description: (contextUser as any).description || '',
      })
      setAvatarUrl((contextUser as any).avatar_url || null)
      loadUserStats()
    }
  }, [contextUser])

  const loadUserStats = async () => {
    // Check if session is valid before making API calls
    if (!authErrorHandler.isSessionValid()) {
      console.warn('Invalid session detected - skipping user stats load')
      setUserStats({
        total_transactions: 0,
        total_income: 0,
        total_expenses: 0,
        net_worth: 0,
        total_debt_loans: 0,
        total_lent: 0,
        total_borrowed: 0,
        debt_loan_balance: 0,
        member_since: new Date().toISOString()
      })
      return
    }

    try {
      console.log('Loading user stats with session:', authErrorHandler.getSessionInfo())
      const stats = await profileAPI.getUserStats()
      setUserStats(stats)
    } catch (err: any) {
      console.error('Failed to load user stats:', err)
      
      // Don't logout on stats failure - just use fallback data
      setUserStats({
        total_transactions: 0,
        total_income: 0,
        total_expenses: 0,
        net_worth: 0,
        total_debt_loans: 0,
        total_lent: 0,
        total_borrowed: 0,
        debt_loan_balance: 0,
        member_since: new Date().toISOString()
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedUser = await profileAPI.updateProfile(formData)
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Update local user data
      setUser(updatedUser as any)
      
      // Update cookie data
      Cookies.set('user-data', JSON.stringify(updatedUser), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      // Refresh user context
      await refreshUser()
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await profileAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setSuccess('Password changed successfully!')
      setShowPasswordDialog(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      await new Promise(resolve => setTimeout(resolve, 1000))
      logout()
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or GIF image')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setIsUploadingAvatar(true)
    setError(null)

    try {
      const result = await profileAPI.uploadAvatar(file)
      setAvatarUrl(result.avatar_url)
      setSuccess('Avatar updated successfully!')
      
      // Update user context with new avatar
      const updatedUser = { ...user, avatar_url: result.avatar_url }
      setUser(updatedUser as any)
      
      // Update cookie data
      Cookies.set('user-data', JSON.stringify(updatedUser), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleAvatarDelete = async () => {
    setIsUploadingAvatar(true)
    setError(null)

    try {
      await profileAPI.deleteAvatar()
      setAvatarUrl(null)
      setSuccess('Avatar removed successfully!')
      
      // Update user context
      const updatedUser = { ...user }
      delete (updatedUser as any).avatar_url
      setUser(updatedUser as any)
      
      // Update cookie data
      Cookies.set('user-data', JSON.stringify(updatedUser), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
    } catch (err: any) {
      setError(err.message || 'Failed to remove avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthCheck>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Alert Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-600">{success}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        {getInitials(user.display_name || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={isUploadingAvatar}
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            {isUploadingAvatar ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4 mr-2" />
                                Change Photo
                              </>
                            )}
                          </Button>
                          
                          {avatarUrl && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isUploadingAvatar}
                              onClick={handleAvatarDelete}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        
                        <p className="text-xs text-gray-500">JPG, PNG, GIF up to 2MB</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="How your name appears to others"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Bio</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password">Current Password</Label>
                          <Input
                            id="current_password"
                            name="current_password"
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              current_password: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new_password">New Password</Label>
                          <Input
                            id="new_password"
                            name="new_password"
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              new_password: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              confirm_password: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPasswordDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Deleting...' : 'Yes, Delete Account'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Summary Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary-50 to-primary-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                      {getInitials(user.display_name || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user.display_name || user.username}
                  </h3>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <Badge variant="secondary" className="mb-4">
                    Active Member
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            {userStats && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="font-semibold">{userStats.total_transactions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Income</span>
                    <span className="font-semibold text-green-600">NPR {userStats.total_income.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-red-600">NPR {userStats.total_expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Net Worth</span>
                    <span className={`font-semibold ${userStats.net_worth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      NPR {userStats.net_worth.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Debt/Loan Balance</span>
                    <span className={`font-semibold ${userStats.debt_loan_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      NPR {userStats.debt_loan_balance.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold">{formatDate(userStats.member_since)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  )
}