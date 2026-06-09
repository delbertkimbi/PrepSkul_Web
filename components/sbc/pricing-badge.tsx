import { SBC_PRICING } from "@/lib/sbc/content"

export function PricingBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full max-w-xs mx-auto rounded-2xl sm:rounded-full border-2 border-dashed border-[#4A6FBF]/50 bg-white p-4 sm:p-6 text-center shadow-lg shadow-blue-900/5 ${className}`}
    >
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#4A6FBF] font-semibold">Registration</p>
        <p className="text-xl sm:text-2xl font-black text-[#1B2C4F]">
          {SBC_PRICING.registrationFee.toLocaleString()}{" "}
          <span className="text-xs sm:text-sm font-medium text-slate-500">{SBC_PRICING.currency}</span>
        </p>
        <div className="w-8 h-px bg-slate-200 mx-auto" />
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#4A6FBF] font-semibold">Program Fee</p>
        <p className="text-lg sm:text-xl font-bold text-[#FF8A00]">
          {SBC_PRICING.programFee.toLocaleString()}{" "}
          <span className="text-xs sm:text-sm font-medium text-slate-500">{SBC_PRICING.currency}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-slate-400 pt-0.5">Paid in installments</p>
      </div>
    </div>
  )
}
