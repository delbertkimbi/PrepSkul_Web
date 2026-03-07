import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'Safeguarding Policy | PrepSkul',
  description: 'PrepSkul Safeguarding Policy - How we protect learners and tutors during onsite and online sessions.',
};

export default function SafeguardingPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Safeguarding Policy</h1>
              <p className="text-lg text-gray-600">
                How we protect learners and tutors and reduce risk through structured safeguards.
              </p>
              <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Last Updated: February 2026
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4 md:mt-0 shrink-0 md:mr-8">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image src="/app_logo(blue).png" alt="PrepSkul Logo" fill className="object-contain" priority />
              </div>
              <span className="text-primary font-bold text-xl md:text-2xl mt-2 tracking-tight">PrepSkul</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-12">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Purpose</h2>
            <p className="text-gray-700 leading-relaxed">
              PrepSkul is committed to reducing risk for everyone on our platform—learners, parents, and tutors. This Safeguarding Policy sets out expectations for onsite and online sessions and how we respond when something goes wrong. We do not claim to eliminate all risk; we reduce it through verification, clear rules, reporting, and evidence-based decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. For Learners (especially minors)</h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li><strong>Parent or guardian presence:</strong> For learners under 18, a parent or guardian should be present at home or immediately reachable during onsite sessions.</li>
              <li><strong>Sessions in visible areas:</strong> Onsite sessions should take place in visible areas of the home, not behind closed doors.</li>
              <li><strong>No closed-door one-on-one:</strong> A tutor must not be alone in a locked or closed room with a minor.</li>
              <li><strong>No inappropriate physical contact:</strong> Physical contact must be limited to what is acceptable in a professional teaching context.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Reporting</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If anything feels wrong during or after a session, anyone involved can report it. In the PrepSkul app, use &quot;Something wrong? Report issue&quot; (e.g. &quot;Felt unsafe,&quot; &quot;Tutor no-show,&quot; &quot;Location issue&quot;). That creates a safety incident and notifies our team.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We investigate using the evidence we have (session timeline, check-in, location, feedback) and may warn, suspend, or bar accounts. We support the affected party and do not force tutors back into households where they felt unsafe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Zero Tolerance for Abuse</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Abuse by anyone—tutor or parent—is not tolerated. This includes:
            </p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li><strong>By tutors:</strong> No-show, harassment, misconduct, or any behavior that puts a learner at risk.</li>
              <li><strong>By parents or learners:</strong> Harassment of a tutor, false claims that a session did not happen to avoid payment, threatening behavior, or any abuse of the reporting or dispute system.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We will warn, suspend, or bar accounts as appropriate and support the affected party. We use documented evidence (sessions, check-in, incidents, feedback) to make decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Escalation and Blacklist Protocol</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When we receive a safeguarding report or detect serious risk signals, we follow an escalation process. We do not promise a specific outcome in every case, but we act on the evidence we have.
            </p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li><strong>1. Receive and triage:</strong> We log the report or incident, review the session timeline, check-in, and any prior incidents, and assign a severity level.</li>
              <li><strong>2. Protect first:</strong> For serious concerns, we may immediately pause sessions or bookings between the parties involved while we review, so no one is forced back into a situation that feels unsafe.</li>
              <li><strong>3. Investigate:</strong> We use available evidence (session data, messages, feedback, and reports from each side) to understand what happened.</li>
              <li><strong>4. Decide and act:</strong> Depending on severity and patterns, we may warn, temporarily suspend, or permanently bar (blacklist) tutors or households from using PrepSkul.</li>
              <li><strong>5. Cooperate where required:</strong> In serious cases, and where the law requires or permits, we may cooperate with authorities and share relevant records.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Blacklisting means that an account, and in some cases a person or household, is not allowed to use PrepSkul in the future. We use this in line with our evidence and local law, focusing on safety for learners, tutors, and families.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For safeguarding concerns or questions, contact us at <a href="mailto:info@prepskul.com" className="text-blue-600 hover:underline">info@prepskul.com</a>. We take all reports seriously and respond in line with this policy.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
