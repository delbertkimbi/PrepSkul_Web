export type AliveLocale = "en" | "fr"

const EN = {
  nav: {
    mate: "SkulMate",
    tutors: "Tutors",
    about: "About",
    faq: "FAQ",
    signIn: "Sign in",
    tryMate: "Get started",
  },
  hero: {
    title: "Learn with a tutor who actually teaches.",
    subtitle:
      "Talk it through with SkulMate, the AI tutor inside PrepSkul. When you want a person, browse tutors, then book or request based on your preferences. Live online, or at the table.",
    primary: "Get started",
    secondary: "Browse tutors",
    sessions: "sessions tutored",
    rating: "avg. session rating",
    minutes: "minutes tutored",
    statLine: "11,280+ sessions tutored · 4.8/5 avg. session rating · 174,360 minutes tutored",
    stats: [
      { value: "11,280+", label: "sessions tutored", start: 11280, suffix: "+", liveMs: 28000, decimals: 0 },
      { value: "4.8/5", label: "avg. session rating", start: 4.8, suffix: "/5", liveMs: 0, decimals: 1 },
      { value: "174,360", label: "minutes tutored", start: 174360, suffix: "", liveMs: 9000, decimals: 0 },
    ],
  },
  toolsTitle: "All the tools of a tutor who teaches",
  toolsLead:
    "SkulMate holds the lesson. A PrepSkul tutor joins when you want a person in the room. Same product, two ways to learn.",
  tools: [
    {
      id: "talk",
      title: "Talk it through",
      body: "SkulMate listens without a tap. Ask out loud, interrupt, or type if the room is shared.",
      tone: "sky" as const,
      tile: "/onboard/art/tile-heart.png",
    },
    {
      id: "board",
      title: "See the idea",
      body: "The board, a picture, or a check moves with the lesson. Not a frozen chat window.",
      tone: "cream" as const,
      tile: "/onboard/art/tile-pencil.png",
    },
    {
      id: "practice",
      title: "Practice the stuck point",
      body: "Checks on the exact miss: linear undo, photosynthesis, a BEPC essay scaffold.",
      tone: "yellow" as const,
      tile: "/onboard/art/tile-maths.png",
    },
    {
      id: "subjects",
      title: "School subjects, then skills",
      body: "SIL to University. Maths, languages, sciences, hist-geo, philo, CS, and what you bring.",
      tone: "mint" as const,
      tile: "/onboard/art/tile-book.png",
    },
    {
      id: "track",
      title: "A picture of progress",
      body: "Skills, mistakes, and mastery. Parents who study get the same view for themselves.",
      tone: "peach" as const,
      tile: "/onboard/art/tile-medal.png",
    },
    {
      id: "memory",
      title: "Picks up where you stopped",
      body: "SkulMate remembers the last session: what you covered, where you stuck, how you like it explained.",
      tone: "blue" as const,
      tile: "/onboard/art/tile-globe.png",
    },
  ],
  split: {
    title: "The site tells the story. The app does the work.",
    body: "PrepSkul.com and the PrepSkul app share the same Next.js API and the same Supabase tables. Tutors you see here are the tutors you book there.",
    siteTitle: "On this site",
    siteItems: [
      { title: "The story", body: "What PrepSkul is, how SkulMate teaches, programs, and FAQ." },
      { title: "Public tutor list", body: "Approved people from tutor_profiles. Read-only. No fake cards." },
      { title: "A door into the app", body: "Get started, onboard, and Play Store or app.prepskul.com." },
    ],
    appTitle: "In the app",
    appItems: [
      { title: "Always-on Mate", body: "Talk, board, pictures, and the lesson that remembers you." },
      { title: "Book a tutor", body: "Pick someone from the same directory and pay for a live or onsite class." },
      { title: "Request a match", body: "Signed-in tutor_requests: subject, mode, city, budget. Admin matching, not a website form." },
    ],
  },
  hybrid: {
    title: "See tutors here. Book them in the app.",
    body: "This site shows approved tutors from the same database the app uses. Booking, payment, live class, and a tutor request all need a signed-in account, so they live in the app.",
    browse: "Browse tutors",
    request: "Request in the app",
    online: "Online, live",
    onsite: "At home or school",
  },
  audienceKicker: "Students, parents, and teachers",
  audiences: [
    {
      id: "students",
      title: "Students",
      image: "/young-african-female-student-smiling.jpg",
      items: [
        { title: "Curriculum-true plans", body: "BEPC, Bac, GCE, WAEC, and the class you are in now." },
        { title: "Talk as you think", body: "Always-on voice. Type if the phone is shared." },
        { title: "A person when you need one", body: "Browse tutors on the site. Book or request in the app." },
      ],
      cta: "Get started",
      href: "onboard",
      tone: "mint" as const,
    },
    {
      id: "parents",
      title: "Parents",
      image: "/african-mother-professional.jpg",
      items: [
        { title: "You study here too", body: "Your account learns. It does not spy." },
        { title: "After the session", body: "What was covered, what stuck, what to retry." },
        { title: "The whole home", body: "Invite every learner under the same roof." },
      ],
      cta: "Start as a parent",
      href: "onboard",
      tone: "sky" as const,
    },
    {
      id: "teachers",
      title: "Teachers",
      image: "/african-tutor-teaching-student-at-home-with-books-.jpg",
      items: [
        { title: "Questions before answers", body: "SkulMate is built to teach, not to dump answers." },
        { title: "Your class, one place", body: "See where the group is stuck." },
        { title: "Classrooms welcome", body: "Talk to us for school access." },
      ],
      cta: "Get in touch",
      href: "contact",
      tone: "peach" as const,
    },
  ],
  science: {
    title: "Your SkulMate, who already gets you.",
    body: "He listens how you think, remembers where you stuck, and explains it your way. Focusing questions, unique pictures, a lesson that stays with you.",
    cta: "Meet SkulMate",
  },
  cheat: {
    title: "Not a cheatbot.",
    body: "A chatbot feeds the answer. SkulMate does not. He is the PrepSkul tutor designed so the learner reasons through it.",
    cta: "See how a session works",
  },
  quotesTitle: "What families say",
  quotesTitleAccent: "about PrepSkul",
  quotes: [
    {
      name: "Kim L.",
      role: "parent of Andy, 13",
      place: "Douala, Cameroon",
      body: "My son asked if we still needed the extra human hour. SkulMate had already walked the same algebra, then a live tutor finished the practical.",
    },
    {
      name: "Tina M.",
      role: "parent of Sam, 14",
      place: "Bamenda, Cameroon",
      body: "Sam got an A on the mock. He talked it through with Mate. The onsite tutor kept the cadence on Saturday.",
    },
    {
      name: "Fongoh Raissa",
      role: "Upper Sixth",
      place: "Buea, Cameroon",
      body: "I had struggled for months. The explanation was clear, and I could interrupt without hunting for a button.",
    },
  ],
  faqLead: "A few things families ask before they start.",
  faqMoreTitle: "Have a few more questions?",
  faqMoreBody: "Tell us the class, the city, and whether SkulMate, a person, or both is the right mix.",
  faqCta: "Talk to us",
  faq: [
    {
      q: "What is PrepSkul?",
      a: "PrepSkul is the tutoring product. Learners and parents both study here. You learn with SkulMate, our in-app tutor and mascot, and with human tutors you find or request. Classes can be online live or onsite.",
    },
    {
      q: "What is SkulMate?",
      a: "SkulMate, or Mate, is the PrepSkul tutor experience. He listens without a tap, draws the idea, and asks before he answers. He is a feature of PrepSkul, not a second brand.",
    },
    {
      q: "How is SkulMate different from ChatGPT?",
      a: "General chatbots answer prompts. SkulMate tutors: it tracks the learning goal, looks for the misconception behind a mistake, and uses questions and hints so the learner reasons through it.",
    },
    {
      q: "Does my child have to talk out loud?",
      a: "Voice is the natural way, and there is no tap-to-talk button. On a shared phone they can type. They can pause, interrupt, and mix both.",
    },
    {
      q: "Can parents see how tutoring is going?",
      a: "Parents who study get their own lessons. They can also read a session summary: skills worked, what is firm, what is still sticky. The parent seat is not a spy cam.",
    },
    {
      q: "What happens if a learner brings up unsafe material?",
      a: "SkulMate turns the talk back to the lesson and does not continue unsafe threads. Serious flags can end the session so a parent can be informed.",
    },
    {
      q: "Does PrepSkul sell voice or learner data?",
      a: "No. Voice is used to tutor in the moment. We do not sell recordings. Cloud speech runs only to teach, then we keep the learning trace, not a public clip.",
    },
    {
      q: "What subjects does PrepSkul cover?",
      a: "Maths, French, English, sciences, history-geography, literature, economics, philosophy, computer science, and whatever else the learner brings. Class range is SIL / Class 1 through University.",
    },
    {
      q: "Can PrepSkul help when a student is behind?",
      a: "Yes. SkulMate starts from what they can already do, not from the chapter number. A human tutor can join online or onsite for the parts that need a person in the room.",
    },
    {
      q: "How do I find a human tutor?",
      a: "Browse Tutors on this site to see approved people from the same database the app uses. Booking a session and sending a tutor request happen in the PrepSkul app, where you are signed in. Choose online (live WebRTC) or onsite.",
    },
    {
      q: "Do the site and the app share a backend?",
      a: "Yes. Both talk to the PrepSkul Next.js API and the same Supabase tables: tutor_profiles, tutor_requests, sessions, payments, SkulMate lessons. The site is public story plus a read-only directory. The app is the signed-in product.",
    },
  ],
  find: {
    title: "Meet PrepSkul tutors.",
    lead: "These cards come from the same approved tutor_profiles the app uses. Browse here. Book a session or request a match in the app, where you are signed in.",
    recommended: "Approved tutors",
    request: "Request a match in the app",
    online: "Online live class",
    onsite: "Onsite",
    empty: "The public list loads from the PrepSkul database when it is connected. Open the app to browse, book, and request. We do not invent names on this page.",
    openApp: "Open the PrepSkul app",
    bookInApp: "Book in the app",
  },
  cta: {
    title: "Ready to learn with PrepSkul?",
    body: "Start with SkulMate in the app, or browse tutors here and book a live class or an onsite visit once you are signed in.",
    button: "Get started",
  },
  notebook: {
    title: "From the notebook",
    lead: "Short notes we keep updating: how Mate teaches, how to pick a class, what parents see.",
  },
}

const FR: typeof EN = {
  nav: {
    mate: "SkulMate",
    tutors: "Tuteurs",
    about: "À propos",
    faq: "FAQ",
    signIn: "Connexion",
    tryMate: "Commencer",
  },
  hero: {
    title: "Apprends avec un tuteur qui enseigne vraiment.",
    subtitle:
      "Parle avec SkulMate, le tuteur IA dans PrepSkul. Pour une personne, parcours les tuteurs, puis réserve ou fais une demande selon tes préférences. En direct en ligne, ou à table.",
    primary: "Commencer",
    secondary: "Voir les tuteurs",
    sessions: "séances données",
    rating: "note moyenne",
    minutes: "minutes d'enseignement",
    statLine: "11 280+ séances données · 4,8/5 note moyenne · 174 360 minutes d'enseignement",
    stats: [
      { value: "11 280+", label: "séances données", start: 11280, suffix: "+", liveMs: 28000, decimals: 0 },
      { value: "4,8/5", label: "note moyenne", start: 4.8, suffix: "/5", liveMs: 0, decimals: 1 },
      { value: "174 360", label: "minutes d'enseignement", start: 174360, suffix: "", liveMs: 9000, decimals: 0 },
    ],
  },
  toolsTitle: "Tous les outils d’un tuteur qui enseigne",
  toolsLead:
    "SkulMate tient la leçon. Un tuteur PrepSkul rejoint quand tu veux une personne dans la pièce. Un seul produit, deux façons d’apprendre.",
  tools: [
    {
      id: "talk",
      title: "Parler pour comprendre",
      body: "SkulMate écoute sans tapoter. Pose la question, coupe-le, ou tape si le téléphone est partagé.",
      tone: "sky",
      tile: "/onboard/art/tile-heart.png",
    },
    {
      id: "board",
      title: "Voir l’idée",
      body: "Le tableau, une image ou un check avance avec la leçon. Pas une fenêtre de chat figée.",
      tone: "cream",
      tile: "/onboard/art/tile-pencil.png",
    },
    {
      id: "practice",
      title: "Travailler le point qui bloque",
      body: "Des checks sur le raté exact: undo linéaire, photosynthèse, dissertation BEPC.",
      tone: "yellow",
      tile: "/onboard/art/tile-maths.png",
    },
    {
      id: "subjects",
      title: "Les matières, puis les compétences",
      body: "De la SIL à l’université. Maths, langues, sciences, hist-géo, philo, info, et ce que tu apportes.",
      tone: "mint",
      tile: "/onboard/art/tile-book.png",
    },
    {
      id: "track",
      title: "Une vue des progrès",
      body: "Compétences, erreurs, maîtrise. Les parents qui apprennent ont la même vue pour eux.",
      tone: "peach",
      tile: "/onboard/art/tile-medal.png",
    },
    {
      id: "memory",
      title: "On reprend où tu t’es arrêté",
      body: "SkulMate retient la dernière séance: ce qui est vu, où ça bloque, comment tu aimes les explications.",
      tone: "blue",
      tile: "/onboard/art/tile-globe.png",
    },
  ],
  split: {
    title: "Le site raconte. L’app fait le travail.",
    body: "PrepSkul.com et l’app PrepSkul parlent à la même API Next.js et aux mêmes tables Supabase. Les tuteurs vus ici sont ceux que tu réserves là-bas.",
    siteTitle: "Sur ce site",
    siteItems: [
      { title: "L’histoire", body: "Ce qu’est PrepSkul, comment SkulMate enseigne, les programmes, la FAQ." },
      { title: "Liste publique", body: "Des personnes approuvées depuis tutor_profiles. Lecture seule. Pas de fausses cartes." },
      { title: "La porte vers l’app", body: "Commencer, onboard, Play Store ou app.prepskul.com." },
    ],
    appTitle: "Dans l’app",
    appItems: [
      { title: "Mate toujours ouvert", body: "Parler, tableau, images, et la leçon qui se souvient de toi." },
      { title: "Réserver un tuteur", body: "Choisir quelqu’un du même annuaire et payer un cours live ou sur place." },
      { title: "Demander un match", body: "tutor_requests connecté: matière, mode, ville, budget. Matching admin, pas un formulaire du site." },
    ],
  },
  hybrid: {
    title: "Vois les tuteurs ici. Réserve-les dans l’app.",
    body: "Ce site montre les tuteurs approuvés de la même base que l’app. Réservation, paiement, cours live et demande de tuteur demandent un compte, donc ça vit dans l’app.",
    browse: "Voir les tuteurs",
    request: "Demander dans l’app",
    online: "En ligne, en direct",
    onsite: "À la maison ou à l’école",
  },
  audienceKicker: "Élèves, parents, et enseignants",
  audiences: [
    {
      id: "students",
      title: "Élèves",
      image: "/young-african-female-student-smiling.jpg",
      items: [
        { title: "Des plans collés au programme", body: "BEPC, Bac, GCE, WAEC, et la classe où tu es." },
        { title: "Parler en pensant", body: "Voix toujours ouverte. Tape si le téléphone est partagé." },
        { title: "Une personne au besoin", body: "Parcours les tuteurs sur le site. Réserve ou demande dans l’app." },
      ],
      cta: "Commencer",
      href: "onboard",
      tone: "mint",
    },
    {
      id: "parents",
      title: "Parents",
      image: "/african-mother-professional.jpg",
      items: [
        { title: "Toi aussi tu étudies ici", body: "Ton compte apprend. Il ne surveille pas." },
        { title: "Après la séance", body: "Ce qui est vu, ce qui accroche, ce qu’il faut rejouer." },
        { title: "Toute la maison", body: "Invite chaque apprenant sous le même toit." },
      ],
      cta: "Commencer en parent",
      href: "onboard",
      tone: "sky",
    },
    {
      id: "teachers",
      title: "Enseignants",
      image: "/african-tutor-teaching-student-at-home-with-books-.jpg",
      items: [
        { title: "Des questions avant les réponses", body: "SkulMate enseigne. Il ne dump pas la réponse." },
        { title: "La classe au même endroit", body: "Voir où le groupe bloque." },
        { title: "Les salles de classe", body: "Écris-nous pour un accès école." },
      ],
      cta: "Nous écrire",
      href: "contact",
      tone: "peach",
    },
  ],
  science: {
    title: "Ton SkulMate, qui te comprend déjà.",
    body: "Il écoute comment tu penses, retient où ça bloque, et explique à ta façon. Des questions, des images uniques, une leçon qui reste avec toi.",
    cta: "Rencontrer SkulMate",
  },
  cheat: {
    title: "Pas un cheatbot.",
    body: "Un chatbot donne la réponse. SkulMate non. C’est le tuteur PrepSkul conçu pour faire raisonner.",
    cta: "Voir une séance",
  },
  quotesTitle: "Ce que disent les familles",
  quotesTitleAccent: "sur PrepSkul",
  quotes: [
    {
      name: "Kim L.",
      role: "parent d’Andy, 13 ans",
      place: "Douala, Cameroun",
      body: "Mon fils a demandé si on gardait l’heure humaine. SkulMate avait déjà défait la même algèbre, puis un tuteur live a fini le TP.",
    },
    {
      name: "Tina M.",
      role: "parent de Sam, 14 ans",
      place: "Bamenda, Cameroun",
      body: "Sam a eu un A au mock. Il a parlé avec Mate. Le tuteur sur place a tenu le rythme le samedi.",
    },
    {
      name: "Fongoh Raissa",
      role: "Upper Sixth",
      place: "Buea, Cameroun",
      body: "Je bloquais depuis des mois. L’explication était claire, et je pouvais couper sans chercher un bouton.",
    },
  ],
  faqLead: "Quelques questions avant de commencer.",
  faqMoreTitle: "Encore une question ?",
  faqMoreBody: "Dis-nous la classe, la ville, et si SkulMate, une personne, ou les deux est le bon mélange.",
  faqCta: "Nous écrire",
  faq: [
    {
      q: "Qu’est-ce que PrepSkul ?",
      a: "PrepSkul est le produit de tutorat. Les élèves et les parents étudient ici. Tu apprends avec SkulMate, le tuteur et la mascotte dans l’app, et avec des tuteurs humains que tu trouves ou demandes. Cours en ligne en direct ou sur place.",
    },
    {
      q: "Qu’est-ce que SkulMate ?",
      a: "SkulMate, ou Mate, est l’expérience tuteur de PrepSkul. Il écoute sans tapoter, dessine l’idée, et pose une question avant de répondre. C’est une fonction de PrepSkul, pas une seconde marque.",
    },
    {
      q: "En quoi SkulMate est différent de ChatGPT ?",
      a: "Un chatbot répond à une consigne. SkulMate tutorise: il suit le but, cherche le malentendu derrière l’erreur, et fait raisonner par questions et indices.",
    },
    {
      q: "L’enfant doit-il parler à voix haute ?",
      a: "La voix est la voie naturelle, sans bouton pour démarrer. Sur un téléphone partagé, on tape. On peut couper, pauser, mélanger.",
    },
    {
      q: "Les parents voient-ils comment ça se passe ?",
      a: "Les parents qui étudient ont leurs propres leçons. Ils peuvent aussi lire un résumé: compétences, ce qui tient, ce qui accroche. Ce n’est pas une caméra.",
    },
    {
      q: "Et si le propos devient inapproprié ?",
      a: "SkulMate ramène à la leçon et n’enchaîne pas. Un signal grave peut clôturer la séance pour qu’un parent soit prévenu.",
    },
    {
      q: "Vous vendez la voix ou les données ?",
      a: "Non. La voix sert à tutoriser sur le moment. Pas de vente d’enregistrements.",
    },
    {
      q: "Quelles matières PrepSkul couvre-t-il ?",
      a: "Maths, français, anglais, sciences, hist-géo, littérature, éco, philo, info, et le reste. De la SIL / Class 1 à l’université.",
    },
    {
      q: "PrepSkul aide-t-il un élève en retard ?",
      a: "Oui. SkulMate part de ce qu’il sait déjà faire. Un tuteur humain peut rejoindre en ligne ou sur place.",
    },
    {
      q: "Comment trouver un tuteur humain ?",
      a: "Parcours Tuteurs sur ce site pour voir les personnes approuvées de la même base que l’app. Réserver une séance et envoyer une demande se font dans l’app PrepSkul, une fois connecté. En ligne (WebRTC) ou sur place.",
    },
    {
      q: "Le site et l’app partagent-ils le même backend ?",
      a: "Oui. Les deux parlent à l’API Next.js PrepSkul et aux mêmes tables Supabase: tutor_profiles, tutor_requests, séances, paiements, leçons SkulMate. Le site est l’histoire publique plus un annuaire en lecture. L’app est le produit connecté.",
    },
  ],
  find: {
    title: "Les tuteurs PrepSkul.",
    lead: "Ces cartes viennent des mêmes tutor_profiles approuvés que l’app. Parcours ici. Réserve une séance ou demande un match dans l’app, une fois connecté.",
    recommended: "Tuteurs approuvés",
    request: "Demander un match dans l’app",
    online: "Cours en ligne",
    onsite: "Sur place",
    empty: "La liste publique se charge depuis la base PrepSkul quand elle est connectée. Ouvre l’app pour parcourir, réserver et demander. On n’invente pas de noms ici.",
    openApp: "Ouvrir l’app PrepSkul",
    bookInApp: "Réserver dans l’app",
  },
  cta: {
    title: "Prêt à apprendre avec PrepSkul ?",
    body: "Commence avec SkulMate dans l’app, ou parcours les tuteurs ici et réserve un cours live ou une visite sur place une fois connecté.",
    button: "Commencer",
  },
  notebook: {
    title: "Du carnet",
    lead: "Des notes qu’on met à jour: comment Mate enseigne, comment choisir un cours, ce que voient les parents.",
  },
}

export function aliveCopy(locale: string) {
  return locale.startsWith("fr") ? FR : EN
}
