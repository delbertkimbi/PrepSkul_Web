export default function LearnerPortalHomePage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-none p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Session feedback</h1>
        <p className="text-sm text-gray-600 mt-3">
          Feedback forms open from a secure link PrepSkul sends you after a session. The link includes a token so your
          feedback is matched to the correct session.
        </p>
        <p className="text-sm text-gray-600 mt-3">
          If you opened this site without that link, check your email or WhatsApp for PrepSkul&apos;s feedback message
          and use the URL provided there.
        </p>
      </div>
    </main>
  );
}
