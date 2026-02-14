'use client';

export default function OpeningAppScreen() {
  return (
    <div className="min-h-screen bg-[#1B2C4F] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="text-white text-2xl font-semibold mb-2">Opening PrepSkul…</h1>
        <p className="text-white/80 text-sm">
          If nothing happens, you’ll be taken to the web version automatically.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
          <div className="ml-2 h-2 w-2 rounded-full bg-white/60 animate-pulse" />
          <div className="ml-2 h-2 w-2 rounded-full bg-white/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

