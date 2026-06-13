export const SBC_CONTACT = {
  phone: "653301997",
  phoneDisplay: "653 30 19 97",
  whatsapp: "https://wa.me/237653301997",
  email: "hello@prepskul.com",
  website: "https://sbc.prepskul.com",
}

export const SBC_LOGO = "/sbclogo.png"

export const SBC_PRICING = {
  registrationFee: 10_000,
  programFee: 39_000,
  registrationDeadline: "June 30, 2026",
  currency: "FCFA",
}

export const SBC_SCHEDULE = {
  startDate: "July 19, 2026",
  endDate: "August 30, 2026",
  duration: "6 weeks",
  days: "Saturdays & Sundays",
  location: "UB Junction, Buea",
  ages: "10 to 17",
  dateRange: "July 19, 2026 to August 30, 2026",
}

export const SBC_LEARN = [
  "Entrepreneurial Thinking",
  "Prompt Engineering",
  "Brand Design",
  "Product Building",
  "Marketing & Storytelling",
]

export const SBC_LEARN_DETAILS: Record<string, string> = {
  "Entrepreneurial Thinking": "Spot real problems, validate ideas, and think like a founder from day one.",
  "Prompt Engineering": "Master AI tools to research, design, and build faster with confidence.",
  "Brand Design": "Create a visual identity and story that makes their product memorable.",
  "Product Building": "Turn concepts into working prototypes using modern no-code and AI tools.",
  "Marketing & Storytelling": "Learn to present, promote, and connect with real audiences.",
}

export const SBC_OUTCOMES = [
  "A Product Built",
  "A Brand Created",
  "A Pitch Delivered",
  "A Certificate Earned",
]

export const SBC_OUTCOME_DETAILS: Record<string, string> = {
  "A Product Built": "A working prototype they can demo, iterate on, and be proud of.",
  "A Brand Created": "Logo, colors, and messaging that reflect their vision.",
  "A Pitch Delivered": "A confident Demo Day presentation to parents and stakeholders.",
  "A Certificate Earned": "Official recognition of their builder journey with SBC.",
}

export const SBC_HERO_STATS = [
  {
    label: "6 weeks",
    sub: "July 19, 2026 to August 30, 2026",
    back: "Every Saturday and Sunday. A full summer of building, learning, and launching.",
  },
  {
    label: "Ages 10 to 17",
    sub: "Saturdays & Sundays",
    back: "No prior coding required. Just curiosity, creativity, and the drive to build.",
  },
  {
    label: "Buea",
    sub: "UB Junction, Buea",
    back: "On-site at UB Junction with mentors, peers, and laptops for those who need them.",
  },
] as const

export const SBC_JOURNEY = [
  {
    step: 1,
    title: "Ideation",
    description: "Students arrive with curiosity and raw ideas. We help them spot real problems worth solving.",
    flipDetail: "Brainstorm sessions, team formation, and problem discovery with mentors.",
    icon: "lightbulb" as const,
  },
  {
    step: 2,
    title: "Problem Thinking",
    description: "Learn to analyze challenges, ask the right questions, and think like founders.",
    flipDetail: "User interviews, research methods, and validating whether an idea is worth building.",
    icon: "search" as const,
  },
  {
    step: 3,
    title: "Solution Design",
    description: "Propose bold solutions, then refine them with AI tools, design thinking, and mentorship.",
    flipDetail: "Wireframes, brand sketches, and solution architecture before writing a single line of code.",
    icon: "palette" as const,
  },
  {
    step: 4,
    title: "Build",
    description: "Turn ideas into working prototypes and real products using emerging technologies.",
    flipDetail: "Hands-on building with AI, no-code tools, and mentor support every weekend.",
    icon: "code" as const,
  },
  {
    step: 5,
    title: "Market & Pitch",
    description: "Craft your brand story, learn to market, and pitch to parents and stakeholders on Demo Day.",
    flipDetail: "Pitch decks, marketing assets, and a live Demo Day in front of parents and partners.",
    icon: "megaphone" as const,
  },
]

export const SBC_WEEKEND_WEEKS = [
  { week: 1, focus: "Orientation & Ideation", detail: "Meet mentors, form teams, identify problems worth solving", back: "Students meet their cohort, explore tools, and pick a problem they care about." },
  { week: 2, focus: "Problem Analysis", detail: "Research, interview users, validate ideas with real-world thinking", back: "Field research, user empathy maps, and deciding if the idea is worth pursuing." },
  { week: 3, focus: "Solution Design", detail: "Sketch solutions, brand identity, and product architecture", back: "Wireframes, brand mood boards, and a clear plan before building starts." },
  { week: 4, focus: "Building Begins", detail: "Hands-on product building with AI tools and no-code/low-code platforms", back: "The first working version comes to life with mentor guidance." },
  { week: 5, focus: "Build & Brand", detail: "Refine prototypes, create marketing materials and pitch decks", back: "Polish the product, design pitch slides, and prepare for the spotlight." },
  { week: 6, focus: "Demo Day", detail: "Pitch to parents, stakeholders, and celebrate launches", back: "Live pitches, applause, and a celebration of everything they built." },
] as const

export const SBC_PARTNERSHIP_ORG_TYPES = [
  { value: "investor", label: "Investor / Funder" },
  { value: "startup", label: "Startup or Tech Company" },
  { value: "ngo", label: "NGO or Non-Profit" },
  { value: "corporate", label: "Corporate / Brand Sponsor" },
  { value: "school", label: "School or Educational Institution" },
  { value: "media", label: "Media or Content Partner" },
  { value: "government", label: "Government or Public Agency" },
  { value: "individual", label: "Individual / Angel Backer" },
  { value: "other", label: "Other" },
] as const

export const SBC_PARTNERSHIP_INTERESTS = [
  { value: "investment", label: "Financial investment in the program" },
  { value: "sponsorship", label: "Sponsorship (cash or in-kind)" },
  { value: "scholarships", label: "Scholarships for students" },
  { value: "mentorship", label: "Mentors or expert sessions" },
  { value: "resources", label: "Equipment, laptops, or tools" },
  { value: "venue", label: "Venue or logistics support" },
  { value: "curriculum", label: "Curriculum or learning content" },
  { value: "media", label: "Media coverage or promotion" },
  { value: "demo_day", label: "Demo Day attendance or judging" },
  { value: "hiring", label: "Talent pipeline / internships" },
  { value: "other", label: "Other" },
] as const

export const SBC_FAQ = [
  {
    question: "Who is Summer Build Camp for?",
    answer:
      "SBC is designed for young innovators aged 10 to 17 across Cameroon and Africa who are curious about technology and entrepreneurship. No prior coding experience is required.",
  },
  {
    question: "Do students need their own laptop?",
    answer:
      "Students are encouraged to bring a laptop or mobile phone if they have one, so they can keep building at home. For those without devices, we provide laptops at the center during program hours.",
  },
  {
    question: "When does the program run?",
    answer:
      "SBC runs for 6 weeks from July 19 to August 30, 2026, on weekends only (Saturdays and Sundays) at UB Junction, Buea.",
  },
  {
    question: "What are the fees?",
    answer:
      "Registration is 10,000 FCFA (deadline: June 30, 2026). The program fee of 39,000 FCFA is paid in installments throughout the 6-week program.",
  },
  {
    question: "What will my child walk away with?",
    answer:
      "Every participant builds a working prototype, creates a brand, delivers a pitch on Demo Day, and earns a certificate, plus the confidence to keep creating.",
  },
  {
    question: "Is this only for Buea residents?",
    answer:
      "The program is hosted in Buea, but we welcome students from across Cameroon and Africa who can attend weekend sessions on-site.",
  },
  {
    question: "Can my organization partner with SBC?",
    answer:
      "Yes. We welcome investors, startups, NGOs, corporate sponsors, schools, and media partners. Visit the Partner page on sbc.prepskul.com to submit a partnership inquiry.",
  },
]
