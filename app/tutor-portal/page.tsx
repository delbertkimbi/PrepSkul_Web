export default function TutorPortalHomePage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-none p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tutor session portal</h1>
        <p className="text-sm text-gray-600 mt-3">
          Session completion reports open from a secure link PrepSkul sends you after a session. That link includes a
          token in the address bar so your report is tied to the right booking.
        </p>
        <p className="text-sm text-gray-600 mt-3">
          If you landed here without a link, check your email or WhatsApp for the latest session message from PrepSkul
          and open the report URL from there.
        </p>
      </div>
    </main>
  );
}
