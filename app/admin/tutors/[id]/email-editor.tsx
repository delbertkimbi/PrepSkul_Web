'use client';

import { useState } from 'react';
import { Mail, Send, FileText, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface EmailEditorProps {
  tutorEmail: string;
  tutorName: string;
  tutorId: string;
}

type EmailTemplate = 'approval' | 'rejection' | 'enhancement';

const emailTemplates = {
  approval: {
    subject: 'Your PrepSkul Tutor Profile Has Been Approved! 🎉',
    content: `Hi ${tutorName},

Great news! Your PrepSkul tutor profile has been reviewed and approved by our admin team.

What's next?
• Your profile is now live and visible to students
• You can start receiving booking requests
• Log in to your dashboard to manage your profile

Welcome to the PrepSkul community! 🎓

Best regards,
The PrepSkul Team`,
  },
  rejection: {
    subject: 'Your PrepSkul Tutor Profile Needs Updates',
    content: `Hi ${tutorName},

Thank you for your interest in becoming a PrepSkul tutor. After reviewing your application, we need some additional information or clarifications.

What needs to be addressed:
[Please provide specific feedback here]

What's next?
• Review the feedback above carefully
• Update your profile with the requested information
• Resubmit your application for review

We're here to help! If you have any questions, please reach out to our support team.

Best regards,
The PrepSkul Team`,
  },
  enhancement: {
    subject: 'Enhancement Opportunity for Your PrepSkul Profile',
    content: `Hi ${tutorName},

We noticed some great potential in your tutor profile! Here are some suggestions to help you stand out:

Enhancement Suggestions:
[Add your suggestions here]

These improvements will help:
• Increase your visibility to students
• Improve your profile completion score
• Attract more booking requests

Feel free to update your profile whenever you're ready!

Best regards,
The PrepSkul Team`,
  },
};

export default function EmailEditor({ tutorEmail, tutorName, tutorId }: EmailEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>('approval');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(tutorEmail);
  const [isSending, setIsSending] = useState(false);

  // Load template when selected
  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    const templateData = emailTemplates[template];
    setSubject(templateData.subject);
    setContent(templateData.content);
  };

  // Convert plain text to HTML for email
  const convertTextToHtml = (text: string, templateType: EmailTemplate): string => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    let html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%); color: white; padding: 40px 30px; text-align: center;">
            <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" style="max-width: 120px; height: auto; margin: 0 auto 20px; display: block;" />
          </div>
          <div style="padding: 40px 30px; background: #f9f9f9;">
    `;

    paragraphs.forEach(para => {
      if (para.trim().startsWith('•') || para.trim().startsWith('-')) {
        // It's a list item
        html += `<ul style="padding-left: 20px;"><li style="margin: 8px 0;">${para.trim().replace(/^[•\-]\s*/, '')}</li></ul>`;
      } else if (para.includes(':')) {
        // Might be a heading or section
        const [key, ...valueParts] = para.split(':');
        if (key.length < 30) {
          html += `<h3 style="color: #1B2C4F; margin-top: 20px;">${key.trim()}:</h3><p>${valueParts.join(':').trim()}</p>`;
        } else {
          html += `<p>${para.trim().replace(/\n/g, '<br>')}</p>`;
        }
      } else {
        html += `<p>${para.trim().replace(/\n/g, '<br>')}</p>`;
      }
    });

    html += `
          </div>
          <div style="background: #ffffff; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee;">
            <p style="margin: 0;">© ${new Date().getFullYear()} PrepSkul. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    return html;
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content');
      return;
    }

    if (!recipientEmail.trim()) {
      alert('Please enter a recipient email');
      return;
    }

    setIsSending(true);

    try {
      // Convert text to HTML
      const htmlContent = convertTextToHtml(content, selectedTemplate);

      // Send via API
      const response = await fetch('/api/admin/tutors/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          html: htmlContent,
          tutorId,
          templateType: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('✅ Email sent successfully!');
      // Reset form
      setSubject('');
      setContent('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Send Custom Email
      </h2>

      {/* Template Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Template
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTemplateChange('approval')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedTemplate === 'approval'
                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approval
          </button>
          <button
            onClick={() => handleTemplateChange('rejection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedTemplate === 'rejection'
                ? 'bg-red-100 text-red-800 border-2 border-red-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejection
          </button>
          <button
            onClick={() => handleTemplateChange('enhancement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedTemplate === 'enhancement'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Enhancement
          </button>
        </div>
      </div>

      {/* Recipient Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Send To
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="tutor@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Default: {tutorEmail}</p>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content Editor - Simple Text Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your email message here... (plain text, we'll format it automatically)"
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          💡 Just type normally - we'll convert it to a beautiful HTML email automatically!
        </p>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isSending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isSending ? (
          <>⏳ Sending...</>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Email
          </>
        )}
      </button>
    </div>
  );
}



