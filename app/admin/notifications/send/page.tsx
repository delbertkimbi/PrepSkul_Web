'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, User, GraduationCap, CheckCircle2, X, Mail, Phone, Bell, Send } from 'lucide-react';

interface UserProfile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  userType: string;
  avatarUrl: string | null;
}

export default function SendNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'admin_message',
    title: '',
    message: '',
    priority: 'normal',
    sendEmail: true,
    sendPush: true,
    actionUrl: '',
    actionText: '',
  });

  const notificationTypes = [
    { value: 'admin_message', label: '📢 Admin Message' },
    { value: 'booking_request', label: '📅 Booking Request' },
    { value: 'booking_accepted', label: '✅ Booking Accepted' },
    { value: 'booking_rejected', label: '❌ Booking Rejected' },
    { value: 'trial_request', label: '🎯 Trial Request' },
    { value: 'trial_accepted', label: '✅ Trial Accepted' },
    { value: 'trial_rejected', label: '❌ Trial Rejected' },
    { value: 'payment_received', label: '💰 Payment Received' },
    { value: 'payment_failed', label: '⚠️ Payment Failed' },
    { value: 'session_reminder', label: '⏰ Session Reminder' },
    { value: 'session_completed', label: '🎉 Session Completed' },
    { value: 'profile_approved', label: '✅ Profile Approved' },
    { value: 'profile_rejected', label: '❌ Profile Rejected' },
    { value: 'profile_improvement', label: '📝 Profile Needs Improvement' },
    { value: 'test', label: '🧪 Test Notification' },
  ];

  const priorities = [
    { value: 'low', label: '🔵 Low' },
    { value: 'normal', label: '🟢 Normal' },
    { value: 'high', label: '🟡 High' },
    { value: 'urgent', label: '🔴 Urgent' },
  ];

  // Debounced search function
  const searchUsers = useCallback(async (query: string, type: string) => {
    if (query.length < 2 && type === 'all') {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams({
        q: query,
        type: type,
        limit: '15',
      });

      const response = await fetch(`/api/admin/users/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.users || []);
      } else {
        toast.error('Failed to search users');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching users');
    } finally {
      setSearching(false);
    }
  }, []);

  // Search when query or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery, userTypeFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, userTypeFilter, searchUsers]);

  // Load initial users on mount
  useEffect(() => {
    searchUsers('', userTypeFilter);
  }, []);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const result = data.channels || {};
        const inAppStatus = result.inApp?.success ? '✅' : '❌';
        const emailStatus = result.email?.sent ? '✅' : (formData.sendEmail ? '❌' : '⏭️');
        const pushStatus = (() => {
          if (!formData.sendPush) return '⏭️';
          const sent = Number(result.push?.sent || 0);
          const errors = Number(result.push?.errors || 0);
          const errMsg = result.push?.error ? String(result.push.error) : '';
          if (sent > 0) {
            return `✅ (${sent} device${sent > 1 ? 's' : ''}${errors > 0 ? `, ${errors} error${errors > 1 ? 's' : ''}` : ''})`;
          }
          if (errMsg) return `❌ (${errMsg})`;
          return '❌ (no FCM token or push disabled)';
        })();

        toast.success(`Notification sent to ${selectedUser.fullName}!`, {
          description: `In-app: ${inAppStatus} | Email: ${emailStatus} | Push: ${pushStatus}`,
          duration: 8000,
        });

        // Reset form but keep filters
        setFormData({
          type: 'admin_message',
          title: '',
          message: '',
          priority: 'normal',
          sendEmail: true,
          sendPush: true,
          actionUrl: '',
          actionText: '',
        });
        setSelectedUser(null);
      } else {
        toast.error('Failed to send notification', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error: any) {
      toast.error('Error sending notification', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (userType: string) => {
    return userType === 'tutor' ? (
      <GraduationCap className="h-4 w-4 text-blue-600" />
    ) : (
      <User className="h-4 w-4 text-green-600" />
    );
  };

  const getUserTypeBadge = (userType: string) => {
    return userType === 'tutor' ? (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        Tutor
      </span>
    ) : (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
        Student
      </span>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Send Notification
        </h1>
        <p className="text-muted-foreground mt-2">
          Send notifications to users via in-app, email, and push notifications
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Recipient
            </CardTitle>
            <CardDescription>
              Search and select a user to send the notification to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected User Display */}
            {selectedUser && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex items-center gap-2">
                    {getUserTypeIcon(selectedUser.userType)}
                    <div>
                      <p className="font-medium">{selectedUser.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email || selectedUser.phone || 'No contact info'}
                      </p>
                    </div>
                  </div>
                  {getUserTypeBadge(selectedUser.userType)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            )}

            {/* Search Input and Filter */}
            {!selectedUser && (
              <>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="tutor">Tutors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Results */}
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery.length >= 2 
                        ? 'No users found' 
                        : 'Type at least 2 characters to search, or select a filter'}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {getUserTypeIcon(user.userType)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {user.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </span>
                                )}
                                {user.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {getUserTypeBadge(user.userType)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Details</CardTitle>
            <CardDescription>
              Configure the notification content and delivery options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Notification Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Action URL & Text */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                  <Input
                    id="actionUrl"
                    type="text"
                    placeholder="/bookings/123 or /dashboard"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deep link for notification tap
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionText">Action Text (Optional)</Label>
                  <Input
                    id="actionText"
                    type="text"
                    placeholder="View Details"
                    value={formData.actionText}
                    onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Button text in email
                  </p>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <Label className="text-base font-semibold">Delivery Channels</Label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-4 w-4 rounded"
                    />
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">In-App (always)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="h-4 w-4 rounded"
                    />
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendPush}
                      onChange={(e) => setFormData({ ...formData, sendPush: e.target.checked })}
                      className="h-4 w-4 rounded"
                    />
                    <Phone className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Push Notification</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Push notifications require the user to have the app installed with notifications enabled
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !selectedUser}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Test Section */}
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              🧪 Quick Test
            </CardTitle>
            <CardDescription>
              Test that notifications are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>To test notifications:</strong></p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Search for your own user account above</li>
                <li>Select notification type: <strong>"🧪 Test Notification"</strong></li>
                <li>Enter a test title and message</li>
                <li>Enable both Email and Push checkboxes</li>
                <li>Click Send and check:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>📱 Your phone for push notification</li>
                    <li>📧 Your email inbox (check spam too!)</li>
                    <li>🔔 In-app notification bell in the PrepSkul app</li>
                  </ul>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-xs">
                  <strong>Note:</strong> Push notifications only work if the user has the PrepSkul app installed 
                  with notification permissions granted. The app stores an FCM token in the database when this happens.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
