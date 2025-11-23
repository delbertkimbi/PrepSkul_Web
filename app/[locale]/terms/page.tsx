import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Terms of Service | PrepSkul',
  description: 'Terms of Service for PrepSkul - Rules and regulations for using our platform.',
};

export default function TermsPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-600">
                Please read these terms carefully before using our services.
              </p>
              <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Last Updated: November 22, 2025
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>PrepSkul</strong> ("we," "us" or "our"), concerning your access to and use of the prepskul.com website, the PrepSkul mobile application, the Ticha AI tool, and any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site" or "Platform").
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              By accessing the Site, you acknowledge that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Nature of the Platform</h2>
            <p className="text-gray-700 leading-relaxed">
              PrepSkul is a marketplace platform that connects learners ("Students" or "Learners") with independent tutors ("Tutors") for educational sessions. 
            </p>
            <ul className="mt-4 space-y-2 text-gray-700 list-disc list-inside">
              <li>We provide the infrastructure for booking, payment processing, and video conferencing.</li>
              <li><strong>We are not an educational institution.</strong> Tutors are independent contractors, not employees of PrepSkul. We do not endorse or guarantee the quality of any specific Tutor, although we implement verification processes.</li>
              <li>The "Ticha" feature is an AI-powered assistant provided as a tool to aid in content creation and study. It is not a substitute for professional human instruction.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              <strong>User Generated Content:</strong> Tutors retain ownership of the educational materials they upload. However, by uploading content to PrepSkul, you grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute such content for the purpose of operating the Service.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Representations & Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using the Site, you represent that your registration information is accurate and you have the legal capacity to agree to these terms. You agree <strong>NOT</strong> to:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 text-red-500 font-bold flex-shrink-0">✕</span>
                <span>Circumvent the Platform by soliciting or accepting payments outside of PrepSkul for services found through PrepSkul.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-red-500 font-bold flex-shrink-0">✕</span>
                <span>Engage in academic dishonesty, cheating, or plagiarism.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-red-500 font-bold flex-shrink-0">✕</span>
                <span>Harass, abuse, or harm another person, including using hate speech or inappropriate language during sessions.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-red-500 font-bold flex-shrink-0">✕</span>
                <span>Use the Ticha AI tool to generate content that is illegal, harmful, or violates third-party rights.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Educational Services & Booking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>For Tutors:</strong> You are responsible for setting your availability and delivering sessions as scheduled. Repeated cancellations or no-shows may result in account suspension.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>For Learners:</strong> You agree to attend booked sessions on time. Sessions missed by the Learner without proper notice ("No-Show") are generally non-refundable, subject to our Cancellation Policy.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Purchases, Payments & Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Fees:</strong> PrepSkul charges a service fee on transactions to cover platform maintenance, support, and payment processing costs. This fee is deducted from the Tutor's set rate or added to the Learner's total, as displayed at checkout.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Payouts:</strong> Tutors receive payouts via Mobile Money or Bank Transfer after the successful completion of a session, subject to a clearing period defined in the Tutor Dashboard.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Refunds:</strong> Refunds are not automatic. If a Tutor fails to show up or there is a significant technical failure attributable to the Platform, Learners may request a refund or credit. Disputes must be raised within 48 hours of the scheduled session.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. AI Tools (Ticha)</h2>
            <p className="text-gray-700 leading-relaxed">
              The Ticha AI presentation and study tool is provided "as is." While we strive for accuracy, AI-generated content may contain errors or inaccuracies. You are responsible for verifying any information generated by Ticha before using it for academic or professional purposes.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              IN NO EVENT WILL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE. We do not guarantee specific educational outcomes or grades resulting from the use of our services.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law & Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and defined following the laws of the Republic of Cameroon. Any dispute arising out of or in connection with these terms shall first be attempted to be settled through amicable negotiation. If negotiation fails, the dispute shall be referred to the competent courts of Cameroon.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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
