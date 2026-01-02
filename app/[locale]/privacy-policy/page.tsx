import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Privacy Policy | PrepSkul',
  description: 'Privacy Policy for PrepSkul - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600">
                Your privacy is important to us. This policy explains how we handle your personal information.
              </p>
              <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Last Updated: January 2, 2026
              </div>
            </div>

            {/* PrepSkul Logo */}
            <div className="flex flex-col items-center justify-center mt-4 md:mt-0 shrink-0 md:mr-8">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image 
                  src="/app_logo(blue).png" 
                  alt="PrepSkul Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-primary font-bold text-xl md:text-2xl mt-2 tracking-tight">PrepSkul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-12">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to <strong>PrepSkul</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website (prepskul.com), our mobile application, the Ticha AI tool, the SkulMate game, and any related services (collectively, the "Services").
            </p>
            <p className="text-gray-700 leading-relaxed">
               If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <a href="mailto:info@prepskul.com" className="text-blue-600 hover:underline">info@prepskul.com</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services (such as using Ticha or booking a tutor), or otherwise contacting us.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information Provided by You</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Identity Data:</strong> Name, profile picture, date of birth.</li>
                  <li><strong>Contact Data:</strong> Email address, phone number, billing address.</li>
                  <li><strong>Financial Data:</strong> Payment details (processed securely by third-party payment processors; we do not store full credit card numbers).</li>
                  <li><strong>Profile Data:</strong> User role (Tutor/Learner), educational subjects, biography, and session history.</li>
                  <li><strong>Content Data:</strong> Files, presentations, and text input you upload for use with Ticha or during sessions.</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Information Automatically Collected</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Device Information:</strong> Device model, operating system, unique device identifiers, and mobile network information.</li>
                  <li><strong>Usage Data:</strong> Information about how you use our Services, such as the date and time of your visit, features used, and crash logs.</li>
                  <li><strong>Location Data:</strong> Approximate location based on IP address to provide localized content and tutor matching.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use personal information collected via our Services for legitimate business purposes, to perform our contract with you, and to comply with our legal obligations. Specifically:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span><strong>Service Provision:</strong> To facilitate account creation, login, session booking, and video conferencing.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span><strong>AI & Interactive Features:</strong> To process your inputs in Ticha (for presentation generation) and SkulMate (converting notes into game questions) to provide the requested educational content.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span><strong>Payments:</strong> To process tuition fees and tutor payouts.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span><strong>Safety & Support:</strong> To detect fraud, monitor for inappropriate behavior during sessions, and respond to support inquiries.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your data with the following categories of third parties:
            </p>
            <ul className="mt-2 space-y-2 text-gray-700 list-disc list-inside">
               <li><strong>Service Providers:</strong> Hosting services, payment processors (e.g., Stripe, Mobile Money providers), and email delivery services.</li>
               <li><strong>AI Partners:</strong> We use third-party AI models (such as OpenAI via OpenRouter) to power Ticha. Your text inputs may be sent to these providers solely for the purpose of generating the requested content. We do not allow them to use your data to train their models.</li>
               <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so to comply with applicable law, governmental requests, or a judicial proceeding.</li>
            </ul>
          </section>

          {/* Section 5 - Google Calendar Integration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Google Calendar Integration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              PrepSkul uses Google Calendar API exclusively for the following purposes:
            </p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">What We Use Google Calendar For:</h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                <li><strong>Session Scheduling:</strong> To create calendar events for tutoring sessions you book</li>
                <li><strong>Meet Link Generation:</strong> To generate Google Meet links for online tutoring sessions</li>
                <li><strong>Calendar Invitations:</strong> To send calendar invitations to tutors and students for scheduled sessions</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">What We Access:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                  <span>We only create calendar events for tutoring sessions you book</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT read your existing calendar events</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT access any other calendar data</span>
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">What We Do NOT Do:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT sell your Google Calendar data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT use your calendar data for advertising</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT use your calendar data for analytics beyond app functionality</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-red-500 flex-shrink-0">✕</span>
                  <span>We do NOT share your calendar data with third parties (except tutors/students for session coordination)</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Data Storage & Control:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>We only store calendar event IDs and Meet links necessary for session management</li>
                <li>You can revoke access at any time through your Google Account settings</li>
                <li>This access is required solely to provide the core functionality of PrepSkul - scheduling and managing tutoring sessions</li>
                <li>Without this access, we cannot create calendar events or generate Meet links for your sessions</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. This helps us remember your login status, preferences (such as language), and analyze traffic. You can control the use of cookies at the individual browser level, but if you choose to disable cookies, it may limit your use of certain features or functions on our Services.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention & Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We keep your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy. For example, we retain transaction records for accounting purposes as required by law.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We have implemented appropriate technical and organizational security measures (such as encryption and access controls) designed to protect the security of any personal information we process. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Our servers are located in multiple regions to ensure speed and reliability. If you are accessing our Services from outside Cameroon, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information, in other countries.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not knowingly solicit data from or market to children under 13 years of age without parental consent. If you become aware that any data has been collected from children under age 13 without verification of parental consent, please contact us at info@prepskul.com, and we will delete that information.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you have questions or comments about this policy, you may email us or contact us by post at:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 inline-block pr-12">
              <h3 className="font-bold text-gray-900">PrepSkul Support</h3>
              <p className="text-gray-600 mt-1">Email: <a href="mailto:info@prepskul.com" className="text-blue-600 hover:underline">info@prepskul.com</a></p>
              <p className="text-gray-600 mt-1">Phone: +237 6 53 30 19 97</p>
              <p className="text-gray-600 mt-1">Location: Cameroon</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
