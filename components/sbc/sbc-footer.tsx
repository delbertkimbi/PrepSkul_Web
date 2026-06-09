import Link from "next/link"
import Image from "next/image"
import { Phone, Globe, Facebook, Linkedin } from "lucide-react"
import { SBC_CONTACT } from "@/lib/sbc/content"

export default function SbcFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 text-slate-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="PrepSkul" width={32} height={32} className="rounded" />
              <span className="text-slate-300 text-xs font-bold">×</span>
              <Image src="/deltech.jpg" alt="DelTech Hub" width={32} height={32} className="rounded" />
            </div>
            <p className="text-sm leading-relaxed">
              Summer Build Camp bridges the technology and entrepreneurial gap for young innovators across Africa.
            </p>
          </div>

          <div>
            <h3 className="text-[#1B2C4F] font-semibold mb-3">Program</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sbc#about" className="hover:text-[#FF8A00] transition-colors">About SBC</Link></li>
              <li><Link href="/sbc/program" className="hover:text-[#FF8A00] transition-colors">Curriculum</Link></li>
              <li><Link href="/sbc#pricing" className="hover:text-[#FF8A00] transition-colors">Pricing</Link></li>
              <li><Link href="/sbc/register" className="hover:text-[#FF8A00] transition-colors">Register</Link></li>
              <li><Link href="/sbc/faq" className="hover:text-[#FF8A00] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1B2C4F] font-semibold mb-3">Partners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://prepskul.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF8A00] transition-colors">
                  PrepSkul
                </a>
              </li>
              <li>
                <a href="https://deltech-hub.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF8A00] transition-colors">
                  DelTech Hub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1B2C4F] font-semibold mb-3">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#FF8A00] shrink-0" />
                <a href={`tel:+237${SBC_CONTACT.phone}`} className="hover:text-[#FF8A00] transition-colors">
                  +237 {SBC_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#FF8A00] shrink-0" />
                <a href={SBC_CONTACT.website} className="hover:text-[#FF8A00] transition-colors break-all">
                  sbc.prepskul.com
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a href="https://facebook.com/prepskul" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF8A00] transition-colors" aria-label="PrepSkul on Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/company/prepskul" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF8A00] transition-colors" aria-label="PrepSkul on LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Summer Build Camp · Organized by PrepSkul in collaboration with DelTech Hub</p>
        </div>
      </div>
    </footer>
  )
}
