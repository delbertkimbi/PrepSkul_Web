'use client';

import { useState } from 'react';
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

export default function SendNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'admin_message',
    title: '',
    message: '',
    priority: 'normal',
    sendEmail: true,
    sendPush: true, // Enable push by default
    actionUrl: '',
    actionText: '',
  });

  const notificationTypes = [
    { value: 'admin_message', label: 'Admin Message' },
    { value: 'booking_request', label: 'Booking Request' },
    { value: 'booking_accepted', label: 'Booking Accepted' },
    { value: 'booking_rejected', label: 'Booking Rejected' },
    { value: 'trial_request', label: 'Trial Request' },
    { value: 'trial_accepted', label: 'Trial Accepted' },
    { value: 'trial_rejected', label: 'Trial Rejected' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'session_reminder', label: 'Session Reminder' },
    { value: 'session_completed', label: 'Session Completed' },
    { value: 'profile_approved', label: 'Profile Approved' },
    { value: 'profile_rejected', label: 'Profile Rejected' },
    { value: 'profile_improvement', label: 'Profile Needs Improvement' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sendPush: formData.sendPush ?? true, // Ensure push is included
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const result = data.channels || {};
        const inAppStatus = result.inApp?.success ? '✅' : '❌';
        const emailStatus = result.email?.sent ? '✅' : '❌';
        const pushStatus = result.push?.sent > 0 ? `✅ (${result.push.sent} device${result.push.sent > 1 ? 's' : ''})` : '❌';
        
        toast.success('Notification sent successfully!', {
          description: `In-app: ${inAppStatus} | Email: ${emailStatus} | Push: ${pushStatus}`,
          duration: 5000,
        });
        
        // Reset form
        setFormData({
          userId: '',
          type: 'admin_message',
          title: '',
          message: '',
          priority: 'normal',
          sendEmail: true,
          sendPush: true,
          actionUrl: '',
          actionText: '',
        });
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Send Notification</h1>
        <p className="text-muted-foreground mt-2">
          Send notifications to specific users (in-app, email, and push)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
          <CardDescription>
            Fill in the details below to send a notification to a user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter user UUID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground">
                The UUID of the user to send the notification to
              </p>
            </div>

            {/* Notification Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
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
                rows={5}
                required
              />
            </div>

            {/* Action URL (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="actionUrl">Action URL (Optional)</Label>
              <Input
                id="actionUrl"
                type="text"
                placeholder="/bookings/123"
                value={formData.actionUrl}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Deep link URL for the notification action
              </p>
            </div>

            {/* Action Text (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="actionText">Action Text (Optional)</Label>
              <Input
                id="actionText"
                type="text"
                placeholder="View Booking"
                value={formData.actionText}
                onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Text for the action button
              </p>
            </div>

            {/* Send Email */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="sendEmail">Send email notification</Label>
            </div>

            {/* Send Push Notification */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendPush"
                checked={formData.sendPush ?? true}
                onChange={(e) => setFormData({ ...formData, sendPush: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="sendPush">Send push notification</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Push notifications require FCM token to be stored for the user. Check fcm_tokens table in Supabase.
            </p>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
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
    </div>
  );
}






