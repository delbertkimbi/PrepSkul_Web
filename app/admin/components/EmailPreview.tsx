'use client';

interface EmailPreviewProps {
  subject: string;
  body: string;
  tutorName?: string;
}

export default function EmailPreview({ subject, body, tutorName }: EmailPreviewProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Email Preview</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To:</label>
          <p className="text-sm text-gray-900">{tutorName || 'Tutor'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subject:</label>
          <p className="text-sm text-gray-900 font-medium">{subject || '(No subject)'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Body:</label>
          <div 
            className="text-sm text-gray-900 whitespace-pre-wrap border border-gray-200 rounded p-3 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br />') }}
          />
        </div>
      </div>
    </div>
  );
}
