export function SbcPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sbc-site min-h-screen flex flex-col bg-[#FAF8F3] text-[#132d63] overflow-x-hidden">
      <div className="relative flex flex-col min-h-screen">{children}</div>
    </div>
  )
}
