export const SBC_CONTACT = {
  phone: "653301997",
  phoneDisplay: "653 30 19 97",
  whatsapp: "https://wa.me/237653301997",
  email: "hello@prepskul.com",
  website: "https://sbc.prepskul.com",
}

export const SBC_LOGO = "/sbclogo.png"

// Keep every SBC registration surface synchronized with the actual program state.
export const SBC_REGISTRATION_OPEN = true

export const SBC_PRICING = {
  registrationDeadline: "While spaces last",
  currency: "FCFA",
}

export const SBC_PACKAGES = [
  {
    id: "explorer",
    name: "Explorer",
    tagline: "Discover AI. Build Your First Innovation.",
    price: 8_000,
    familyPrice: 5_000,
    perfectFor: "Families looking for the complete Summer Build Camp experience.",
    description: "Everything a learner needs for an exciting week of AI, innovation and entrepreneurship.",
    includes: ["Complete 5-day Summer Build Camp experience", "AI & Innovation workshops", "Team-based project development", "Entrepreneurial thinking sessions", "Hands-on activities and challenges", "Demo Day participation", "Certificate of Participation", "SBC Participant Guide", "AI Prompt Starter Pack", "Digital learning resources"],
    bestFor: "Best for first-time participants and families seeking an affordable entry into AI and innovation.",
  },
  {
    id: "creator",
    name: "Creator",
    tagline: "Turn Ideas into Real Projects.",
    price: 19_900,
    familyPrice: 15_000,
    perfectFor: "Learners who want to continue building after Summer Build Camp.",
    description: "Post-camp mentorship, AI tools and practical resources to refine ideas and keep building.",
    includes: ["Everything in Explorer", "2 weeks of guided post-camp mentorship", "Weekly mentor check-ins", "Project review and feedback sessions", "1,000 SBC AI Credits", "Innovation Toolkit, Business Model Canvas and Pitch Deck Templates", "Project Planning Toolkit and extended AI learning resources", "Official Summer Build Camp T-Shirt", "Innovation Welcome Pack", "SBC Innovation Journal"],
    bestFor: "Best for learners who want to keep building and improving their projects after the camp.",
  },
  {
    id: "innovator",
    name: "Innovator",
    tagline: "Build, Launch and Grow with a Year of Mentorship.",
    price: 45_000,
    familyPrice: 30_000,
    perfectFor: "Young innovators ready to build, launch and grow beyond Summer Build Camp.",
    description: "The SBC Innovator Fellowship provides year-long mentorship, AI resources and growth opportunities.",
    includes: ["Everything in Creator", "1 year of personalized mentorship", "Monthly innovation coaching, goal setting and project reviews", "5,000 SBC AI Credits", "Premium AI Innovation Toolkit and ongoing resource updates", "Pitch development, presentation skills and prototype refinement", "Preparation for selected innovation and entrepreneurship competitions", "Parent progress report", "SBC Alumni Community and priority access to future programs"],
    bestFor: "Best for learners committed to turning ideas into real projects and continuing their innovation journey beyond the camp.",
  },
] as const

export type SbcPackageId = typeof SBC_PACKAGES[number]["id"]

export const SBC_SCHEDULE = {
  startDate: "August 4, 2026",
  endDate: "August 8, 2026",
  duration: "1 week",
  days: "Tuesday to Saturday",
  location: "Buea onsite + online participation",
  ages: "9 to 18",
  dateRange: "August 4 to August 8, 2026",
  sessionsPerWeek: 5,
  totalSessions: 5,
}

export const SBC_INTRO = {
  tagline: "AI and Entrepreneurship for Young Innovators",
  summary:
    "A one-week hands-on program where young learners turn ideas into real solutions using AI, creativity and teamwork.",
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
    value: "5",
    label: "Days",
    detail: "August 4–8. Every day moves the idea forward.",
  },
  {
    value: "9–18",
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
    title: "5 Days",
    description:
      "One focused week from discovery to a live Demo Day showcase.",
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
    title: "Discover & Understand",
    learn:
      "Welcome, icebreakers, real-world AI examples and the entrepreneurial mindset.",
    do: "Explore problems around us and choose one meaningful challenge to investigate.",
    produce:
      "A clearly defined real-world problem worth solving.",
  },
  {
    week: 2,
    title: "Ideate & Plan",
    learn:
      "Idea generation with AI, problem validation, customer empathy and project planning.",
    do: "Listen, learn, assign roles and turn a promising idea into a practical plan.",
    produce:
      "A validated solution concept and a simple build plan.",
  },
  {
    week: 3,
    title: "Build & Create",
    learn:
      "AI tools, prompt engineering, solution design and rapid prototyping.",
    do: "Build a first app, web, product or design prototype and test the core idea.",
    produce:
      "A working first version of the team’s solution.",
  },
  {
    week: 4,
    title: "Improve & Prepare",
    learn:
      "Product improvement, branding, storytelling, marketing and pitch training.",
    do: "Collect feedback, refine the prototype and rehearse a clear team presentation.",
    produce:
      "A stronger prototype and a confident Demo Day pitch.",
  },
  {
    week: 5,
    title: "Pitch & Celebrate",
    learn:
      "Public speaking, product demonstrations and responding to an audience.",
    do: "Present on Demo Day to parents, mentors and guests, then celebrate the journey.",
    produce:
      "A live pitch, prototype showcase and certificate of completion.",
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
      "SBC is designed for young innovators aged 9 to 18 who are curious about technology, creativity and entrepreneurship. No prior coding experience is required.",
  },
  {
    question: "Do students need their own laptop?",
    answer:
      "Students are encouraged to bring a laptop or mobile phone if they have one, so they can keep building at home. For those without devices, we provide laptops at the center during program hours.",
  },
  {
    question: "When does the program run?",
    answer:
      "SBC runs from Tuesday, August 4 to Saturday, August 8, 2026. The week ends with a live Demo Day presentation.",
  },
  {
    question: "What are the fees?",
    answer:
      "Explorer is 8,000 XAF, Creator is 19,900 XAF and Innovator is 45,000 XAF. Families registering two or more children receive a reduced per-child rate for every package.",
  },
  {
    question: "Do all learners receive the same training?",
    answer: "Yes. Every learner receives the complete five-day curriculum, workshops, team projects, Demo Day and certificate. Packages differ only in the continued mentorship, AI resources and support available after camp.",
  },
  {
    question: "Can I upgrade a package later?",
    answer: "Yes. Subject to availability, families may upgrade to a higher package before or during Summer Build Camp by paying the difference in package fees.",
  },
  {
    question: "What will my child walk away with?",
    answer:
      "Every participant builds a working product, creates a full brand identity, delivers a live pitch on Demo Day, and earns a certificate. These are tangible outputs they own and can show anyone.",
  },
  {
    question: "Is this only for Buea residents?",
    answer:
      "No. The onsite experience is hosted in Buea, with online participation available for learners joining from elsewhere.",
  },
  {
    question: "Can my organization partner with SBC?",
    answer:
      "Yes. We welcome investors, startups, NGOs, corporate sponsors, schools, and media partners. Visit the Partner page on sbc.prepskul.com to submit a partnership inquiry.",
  },
]
