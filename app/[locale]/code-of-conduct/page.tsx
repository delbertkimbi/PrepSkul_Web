import React from 'react';
import Link from 'next/link';
import { PaperDoc } from "@/components/marketing/paper-doc"

export const metadata = {
  title: 'Code of Conduct | PrepSkul',
  description: 'PrepSkul Code of Conduct - Professionalism, payments, and respect for tutors and users.',
};

export default function CodeOfConductPage({ params }: { params: { locale: string } }) {
  return (
    <PaperDoc
      title="Code of Conduct"
      lead="Standards for everyone on PrepSkul: tutors, learners, and parents."
      updated="Last updated: February 2026"
    >
        <div className="space-y-12">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Professionalism and Respect</h2>
            <p className="text-gray-700 leading-relaxed">
              Tutors and users (learners and parents) must act with professionalism and respect. Deliver or attend sessions on time, communicate clearly, and treat everyone on the platform with dignity. We expect punctuality, honesty, and conduct that supports a safe learning environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Payments Only Through PrepSkul</h2>
            <p className="text-gray-700 leading-relaxed">
              All payments for sessions arranged through PrepSkul must be made on the platform. Arranging or accepting payment outside the platform (e.g. cash, direct transfer, or another channel) is a breach of this Code of Conduct and may lead to suspension or barring of your account. This protects both tutors and families and keeps our system fair and auditable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Truthful Information</h2>
            <p className="text-gray-700 leading-relaxed">
              The information you provide to PrepSkul—including profile details, qualifications, and when reporting issues—must be accurate and truthful. Providing false information or misrepresenting facts can result in account suspension or removal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. No Harassment or Abuse</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tutors and users (parents and learners) must not harass, threaten, or abuse anyone on the platform. False reports, gaming the dispute system (e.g. falsely claiming a session did not happen), or any attempt to harm another user is unacceptable. We may suspend or bar accounts and support the affected party.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We use documented evidence—session timelines, check-in, incidents, and feedback—to resolve disputes and protect both tutors and families.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Adherence to Safeguarding Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Everyone must follow our <Link href={`/${params?.locale ?? 'en'}/safeguarding`} className="text-blue-600 hover:underline">Safeguarding Policy</Link>, including expectations for parent/guardian presence, visible-area sessions, no closed-door one-on-one with minors, and reporting. Breach of safeguarding expectations may result in immediate action, including suspension or barring.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Consequences of Breach</h2>
            <p className="text-gray-700 leading-relaxed">
              We may warn, suspend, or permanently bar accounts for breach of this Code of Conduct. We take reports seriously and use evidence to decide. If you have questions, contact us at <a href="mailto:info@prepskul.com" className="text-blue-600 hover:underline">info@prepskul.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Escalation and Blacklist</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serious or repeated breaches of this Code of Conduct or our Safeguarding Policy may trigger an escalation process. We review session data, reports from all sides, and any prior incidents before deciding on action.
            </p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li><strong>Warnings:</strong> For lower-severity or first-time issues, we may issue a written warning and remind you of the rules.</li>
              <li><strong>Suspension:</strong> For more serious or repeated issues, we may temporarily suspend your ability to book or deliver sessions while we investigate.</li>
              <li><strong>Blacklist (permanent barring):</strong> For severe misconduct or repeated abuse, we may permanently bar your account—and, where appropriate, the person or household behind it—from using PrepSkul.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              This escalation process is used to reduce risk and protect the PrepSkul community. It does not replace your obligations under local law. For full safeguarding details, please read our{' '}
              <Link href={`/${params?.locale ?? 'en'}/safeguarding`} className="text-blue-600 hover:underline">
                Safeguarding Policy
              </Link>.
            </p>
          </section>

        </div>
    </PaperDoc>
  );
}
