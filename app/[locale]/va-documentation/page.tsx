import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'About PrepSkul VA | PrepSkul',
  description: 'PrepSkul Virtual Assistant (VA) – monitoring and supervision in live tutoring sessions.',
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';

export default function VADocumentationPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                About PrepSkul&apos;s Virtual Assistant
              </h1>
              <p className="text-lg text-gray-600">
                Monitoring and supervision in every live tutoring session.
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Documentation
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4 md:mt-0 shrink-0 md:mr-8">
              <div className="relative w-14 h-14 md:w-16 md:h-16">
                <Image
                  src="/app_logo(blue).png"
                  alt="PrepSkul Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-primary font-bold text-lg md:text-xl mt-2 tracking-tight">PrepSkul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What is PrepSkul&apos;s VA?</h2>
            <p className="text-gray-700 leading-relaxed">
              PrepSkul&apos;s Virtual Assistant (VA) is an AI-powered monitoring and supervision system that joins every live tutoring session. It helps keep sessions focused, safe, and productive without participating in the conversation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How does it join sessions?</h2>
            <p className="text-gray-700 leading-relaxed">
              The VA automatically joins your session when both you and your tutor or learner are connected. It runs in the background and does not interfere with your video or audio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Monitoring and supervision</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              The VA monitors session content to ensure discussions stay focused on education and the subject of the lesson. It supports supervision by helping to keep the environment appropriate and on-topic.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Session content is monitored for relevance and appropriateness</li>
              <li>Supervision is continuous and unobtrusive</li>
              <li>No support or intervention in the conversation; monitoring only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Session summaries</h2>
            <p className="text-gray-700 leading-relaxed">
              At the end of each session, the VA produces concise summaries of what was covered. These summaries capture key topics, concepts, and learning points for your records and for use in SkulMate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">SkulMate – interactive learning</h2>
            <p className="text-gray-700 leading-relaxed">
              Session summaries power SkulMate, PrepSkul&apos;s interactive learning tool. SkulMate turns your session summaries into revision materials, quizzes, and learning activities to reinforce what you learned.
            </p>
          </section>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-2xl flex-shrink-0">ℹ</span>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is respected. The VA is designed for monitoring and supervision and to maintain session quality only.
              </p>
            </div>
          </div>
        </div>

        {/* Go back to app */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-center text-gray-600 text-sm">
            If the PrepSkul app is still open in another tab, switch to that tab to continue your call.
          </p>
          <Link
            href={APP_URL}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            <span>←</span>
            Go back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
