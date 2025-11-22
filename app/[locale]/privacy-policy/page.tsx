import React from 'react';

export const metadata = {
  title: 'Privacy Policy | PrepSkul',
  description: 'Privacy Policy for PrepSkul - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. This policy explains how we handle your personal information.
          </p>
          <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            Last Updated: November 22, 2025
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
              Welcome to <strong>PrepSkul</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <a href="mailto:info@prepskul.com" className="text-blue-600 hover:underline">info@prepskul.com</a>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy applies to all information collected through our website (prepskul.com), our mobile application, and any related services, sales, marketing, or events (collectively, the "Services").
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services, or otherwise contacting us.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information Provided by You</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Name and Contact Data (Email, Phone Number)</li>
                  <li>Credentials (Passwords, Security info)</li>
                  <li>Payment Data (processed securely by our payment processors)</li>
                  <li>Profile Data (User role, educational preferences)</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Information Automatically Collected</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Device Information (Model, OS version, Unique Device Identifiers)</li>
                  <li>Usage Data (Features used, time spent, crash logs)</li>
                  <li>Location Data (IP address-based broad location)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span>To facilitate account creation and logon process.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span>To send you administrative information (product updates, terms changes).</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span>To fulfill and manage your orders and payments.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span>To enable user-to-user communications (between Tutors and Learners).</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500 flex-shrink-0">✓</span>
                <span>To enforce our terms, conditions, and policies.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., Payment Processing, Data Analysis, Email Delivery, Hosting Services, Customer Service, and Marketing Efforts).
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Logins</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Services offer you the ability to register and login using your third-party social media account details (like your Google or Facebook logins). Where you choose to do this, we will receive certain profile information about you from your social media provider.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We will use the information we receive only for the purposes that are described in this privacy policy or that are otherwise made clear to you on the Services.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention & Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
            </p>
            <p className="text-gray-700 leading-relaxed">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In some regions, you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.
            </p>
            <p className="text-gray-700 leading-relaxed">
              To make such a request, please use the contact details provided below. We will consider and act upon any request in accordance with applicable data protection laws.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
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
