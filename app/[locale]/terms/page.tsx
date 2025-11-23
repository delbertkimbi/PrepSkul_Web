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
            <div className="flex flex-col items-center md:items-end mt-4 md:mt-0 shrink-0">
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
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>PrepSkul</strong> ("we," "us" or "our"), concerning your access to and use of the prepskul.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Representations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using the Site, you represent and warrant that:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">•</span>
                <span>All registration information you submit will be true, accurate, current, and complete.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">•</span>
                <span>You will maintain the accuracy of such information and promptly update such registration information as necessary.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">•</span>
                <span>You have the legal capacity and you agree to comply with these Terms of Service.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">•</span>
                <span>You are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Registration</h2>
            <p className="text-gray-700 leading-relaxed">
              You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Educational Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>For Tutors:</strong> You are responsible for providing high-quality educational content and conducting sessions professionally. You must not solicit students to move off the PrepSkul platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>For Learners:</strong> You agree to treat tutors with respect and adhere to the booking and cancellation policies. We reserve the right to terminate access for any user who engages in harassment or inappropriate behavior.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Purchases and Payment</h2>
            <p className="text-gray-700 leading-relaxed">
              We accept various forms of payment including Mobile Money and Credit Cards. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Term and Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and defined following the laws of Cameroon. PrepSkul and yourself irrevocably consent that the courts of Cameroon shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
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
