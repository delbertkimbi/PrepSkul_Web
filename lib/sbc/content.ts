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
  days: "Saturdays, Sundays & Mondays",
  location: "UB Junction, Buea",
  ages: "10 to 17",
  dateRange: "July 19, 2026 to August 30, 2026",
  sessionsPerWeek: 3,
  totalSessions: 18,
}

export const SBC_INTRO = {
  tagline: "AI and Entrepreneurship for Young Innovators",
  summary:
    "Most young people today are growing up alongside AI without ever being taught how to use it. Summer Build Camp closes that gap. Over 6 weeks, children aged 10 to 17 go from curious to capable, building real products, real brands, and real business ideas using AI tools.",
  partners: "Organized by DelTech Hub · In partnership with PrepSkul · i2D · AD",
}

export const SBC_VISION = {
  headline: "10K",
  subhead: "Young Innovators by 2030",
  quote:
    "AI is reshaping every industry. Yet most children in Africa are growing up as consumers of this technology, not builders of it. Summer Build Camp exists to close that gap, one young founder at a time.",
  compound:
    "Every cohort feeds the next. Alumni become mentors. Demo Days become hiring events. The program compounds and the community grows with it.",
}

export const SBC_MILESTONES = [
  {
    year: "2026",
    title: "First Cohort",
    description:
      "We launch in Cameroon, online and onsite, with a focused cohort that proves the model and sets the standard for what is possible across the continent.",
  },
  {
    year: "2027",
    title: "Pan-African Reach",
    description:
      "Online delivery means any child on the continent with a device and a connection can access the same curriculum, mentors, and Demo Day experience.",
  },
] as const

export const SBC_HERO_STATS = [
  {
    value: "6",
    label: "Weeks",
    detail: "July to August. Every week builds on the last.",
  },
  {
    value: "10–17",
    label: "Ages",
    detail: "Designed for young innovators across Africa.",
  },
  {
    value: "10,000",
    label: "Vision by 2030",
    detail: "Young innovators we are building toward.",
  },
] as const

export const SBC_WEEKLY_SESSIONS = [
  {
    day: "Saturday",
    type: "Onsite Session",
    description:
      "The first hands-on workshop of the week. Participants build, create, and collaborate in person under direct mentor guidance.",
  },
  {
    day: "Sunday",
    type: "Onsite Session",
    description:
      "Second in-person workshop. Progress is reviewed, new skills are introduced, and project development continues with full mentor access.",
  },
  {
    day: "Monday",
    type: "Live Online Session",
    description:
      "A live group session open to all tiers. Online participants join in real time. Content review, Q&A, and collaborative challenges keep every learner in sync.",
  },
] as const

export const SBC_PROGRAM_STRUCTURE = [
  {
    label: "Duration",
    title: "6 Weeks",
    description:
      "18 total sessions across the program. Designed to fit alongside school schedules during July and August.",
    icon: "calendar" as const,
  },
  {
    label: "Formats",
    title: "Online & Onsite",
    description:
      "Three participation tiers. One curriculum. Same quality regardless of how you join.",
    icon: "globe" as const,
  },
  {
    label: "Culmination",
    title: "Demo Day",
    description:
      "Every cohort ends with a live public presentation to parents, mentors, and industry guests.",
    icon: "star" as const,
  },
] as const

export const SBC_CURRICULUM_WEEKS = [
  {
    week: 1,
    title: "Think Like a Founder",
    learn:
      "What entrepreneurs do, how to identify real problems worth solving, and how AI is creating opportunities for young builders and creators right now.",
    do: "Conduct live interviews to discover a real problem. Use AI research tools to analyse and document findings. Begin designing a solution concept.",
    produce:
      "A validated problem statement and a first-draft solution concept ready to build on.",
  },
  {
    week: 2,
    title: "AI as Your Co-Builder",
    learn:
      "How AI tools work, how to write effective prompts, and how to use AI for writing, designing, researching, and creating content at speed.",
    do: "Use AI to generate and refine a business idea, write a company description, and design the first version of a product concept using AI creation tools.",
    produce:
      "A refined business idea, company description, and product concept document.",
  },
  {
    week: 3,
    title: "Design and Build Your Brand",
    learn:
      "Brand design fundamentals: naming, colour theory, typography, and visual identity. How to use AI design tools to create professional marketing assets.",
    do: "Design a full brand identity using AI tools: company name, logo, colour palette, tagline, and a marketing flyer ready to share with the world.",
    produce:
      "A complete brand kit: name, logo, colours, tagline, and a share-ready marketing flyer.",
  },
  {
    week: 4,
    title: "Code and Build the Product",
    learn:
      "Introduction to coding and product development using AI-assisted tools. Building apps, websites, and digital products without needing years of technical experience.",
    do: "Code and build a working product prototype using AI coding assistants and no-code platforms. Test it with real users and improve based on feedback.",
    produce:
      "A working digital prototype tested with real users and ready to demo.",
  },
  {
    week: 5,
    title: "Market, Sell and Tell Your Story",
    learn:
      "Sales and marketing fundamentals: pricing, communication, and persuasion. Creating AI-generated video content and marketing materials that get attention and drive action.",
    do: "Produce a 90-second AI-generated marketing video for their product. Write sales copy, set a price, and attempt to secure one real committed customer.",
    produce:
      "A marketing video, sales copy, pricing strategy, and at least one real customer commitment.",
  },
  {
    week: 6,
    title: "Demo Day — Present and Launch",
    learn:
      "Pitching, public speaking, and how to present a business idea with clarity and confidence to investors, mentors, and real audiences.",
    do: "Deliver a live 3-minute founder pitch. Demo the working product. Present the brand. Answer real questions from a panel of mentors and guests.",
    produce:
      "A live Demo Day pitch, product demo, and official certificate of completion.",
  },
] as const

export const SBC_DELIVERABLES = [
  {
    number: "01",
    title: "A Product They Built",
    description:
      "A working digital product or prototype built using AI tools: an app, website, or service that solves a real problem they identified themselves.",
  },
  {
    number: "02",
    title: "A Brand They Created",
    description:
      "A complete brand identity: name, logo, tagline, flyer, and a 90-second marketing video, all built using AI, ready to share with the world.",
  },
  {
    number: "03",
    title: "A Pitch They Delivered",
    description:
      "A live presentation to a real audience on Demo Day. Every participant learns to communicate their idea clearly, handle questions, and stand behind their work.",
  },
] as const

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
  "A Brand Created": "Logo, colours, and messaging that reflect their vision.",
  "A Pitch Delivered": "A confident Demo Day presentation to parents and stakeholders.",
  "A Certificate Earned": "Official recognition of their builder journey with SBC.",
}

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
  {
    week: 1,
    focus: "Think Like a Founder",
    detail: "Problem discovery, AI research, and solution concept design",
    back: "Students conduct interviews, validate problems, and draft their first solution concept.",
  },
  {
    week: 2,
    focus: "AI as Your Co-Builder",
    detail: "Prompt engineering, business ideation, and product concept creation",
    back: "AI-generated business plans and the first version of a product concept take shape.",
  },
  {
    week: 3,
    focus: "Design and Build Your Brand",
    detail: "Brand identity, visual design, and marketing assets with AI tools",
    back: "Logo, colours, tagline, and a marketing flyer ready to share.",
  },
  {
    week: 4,
    focus: "Code and Build the Product",
    detail: "AI-assisted coding and no-code prototyping with user testing",
    back: "A working prototype tested with real users and improved based on feedback.",
  },
  {
    week: 5,
    focus: "Market, Sell and Tell Your Story",
    detail: "Marketing video, sales copy, pricing, and first customer",
    back: "A 90-second marketing video and at least one real customer commitment.",
  },
  {
    week: 6,
    focus: "Demo Day — Present and Launch",
    detail: "Live pitch, product demo, and celebration with parents and guests",
    back: "Every participant delivers a 3-minute founder pitch on Demo Day.",
  },
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
      "SBC runs for 6 weeks from July 19 to August 30, 2026. Each week includes Saturday and Sunday onsite sessions in Buea, plus a live online session on Monday.",
  },
  {
    question: "What are the fees?",
    answer:
      "Registration is 10,000 FCFA (deadline: June 30, 2026). The program fee of 39,000 FCFA is paid in installments throughout the 6-week program.",
  },
  {
    question: "What will my child walk away with?",
    answer:
      "Every participant builds a working product, creates a full brand identity, delivers a live pitch on Demo Day, and earns a certificate. These are tangible outputs they own and can show anyone.",
  },
  {
    question: "Is this only for Buea residents?",
    answer:
      "The onsite sessions are hosted in Buea, but online participants can join the Monday live sessions from anywhere. We welcome students from across Cameroon and Africa.",
  },
  {
    question: "Can my organization partner with SBC?",
    answer:
      "Yes. We welcome investors, startups, NGOs, corporate sponsors, schools, and media partners. Visit the Partner page on sbc.prepskul.com to submit a partnership inquiry.",
  },
]
