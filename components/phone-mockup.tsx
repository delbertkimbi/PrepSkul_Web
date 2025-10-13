import Image from "next/image"
import { Star, Clock, Video, BookOpen, Laptop, Globe } from "lucide-react"

export function PhoneMockup() {
  return (
    <div className="phone-mockup-container">
      <div className="relative w-[320px] h-[650px] perspective-1000">
        {/* Phone frame with soft curves */}
        <div className="relative w-full h-full bg-[#1a1d29] rounded-[3.5rem] p-2 shadow-2xl transform rotate-y-5 phone-3d">
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-[#0f1117] rounded-[3rem] p-1">
            {/* Screen */}
            <div className="relative w-full h-full bg-white rounded-[2.8rem] overflow-hidden">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-11 bg-gradient-to-b from-black/5 to-transparent z-20 flex items-center justify-between px-8 pt-2">
                <span className="text-sm font-semibold text-gray-900">14:45</span>
                <div className="flex gap-1 items-center">
                  <div className="w-4 h-2.5 bg-gray-900 rounded-sm"></div>
                  <div className="w-4 h-2.5 bg-gray-900 rounded-sm"></div>
                  <div className="w-4 h-2.5 bg-gray-900 rounded-sm"></div>
                  <div className="w-1.5 h-3 bg-gray-900 rounded-sm"></div>
                </div>
              </div>

              {/* Dynamic notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-b-3xl z-30 shadow-lg"></div>

              <div className="h-full overflow-y-auto pt-2 pb-6 scrollbar-hide">
                {/* Hero image section */}
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src="/images/hero-tutoring-nobg.png"
                    alt="PrepSkul tutoring"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
                </div>

                {/* App UI content - scrollable */}
                <div className="px-6 -mt-8 relative z-10 space-y-6 pb-8">
                  {/* Welcome card with softer design and smaller learning option buttons */}
                  <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-5 text-white shadow-xl">
                    <h2 className="text-xl font-bold mb-1.5">Find Your Tutor</h2>
                    <p className="text-xs opacity-90 mb-3">Connect with expert tutors across Cameroon</p>
                    <div className="flex gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                        Online
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                        Home
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                        Groups
                      </div>
                    </div>
                  </div>

                  {/* Featured tutor card with softer shadows */}
                  <div className="bg-white rounded-3xl p-5 space-y-4 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        JD
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base">John Doe</h3>
                        <p className="text-xs text-gray-600">Mathematics & Physics</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 rounded-full px-2.5 py-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">4.9</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>50+ sessions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>Online & Home</span>
                      </div>
                    </div>

                    <button className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                      Book Session
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-gray-900">Popular Subjects</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 text-center shadow-sm">
                        <BookOpen className="w-6 h-6 mx-auto mb-1.5 text-blue-600" />
                        <div className="text-xs font-semibold text-gray-900">Mathematics</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4 text-center shadow-sm">
                        <svg
                          className="w-6 h-6 mx-auto mb-1.5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                        <div className="text-xs font-semibold text-gray-900">Sciences</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 text-center shadow-sm">
                        <Laptop className="w-6 h-6 mx-auto mb-1.5 text-purple-600" />
                        <div className="text-xs font-semibold text-gray-900">Coding</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 text-center shadow-sm">
                        <Globe className="w-6 h-6 mx-auto mb-1.5 text-orange-600" />
                        <div className="text-xs font-semibold text-gray-900">Languages</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional scrollable content to show it's scrollable */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-sm mb-2">Why PrepSkul?</h3>
                    <ul className="space-y-2 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Verified expert tutors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Flexible scheduling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Affordable rates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute -right-0.5 top-32 w-1 h-14 bg-[#0d0f14] rounded-r-full"></div>
          <div className="absolute -right-0.5 top-52 w-1 h-20 bg-[#0d0f14] rounded-r-full"></div>
          <div className="absolute -left-0.5 top-40 w-1 h-10 bg-[#0d0f14] rounded-l-full"></div>
        </div>
      </div>
    </div>
  )
}
