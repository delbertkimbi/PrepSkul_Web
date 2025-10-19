import { type Locale } from './i18n'

export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      about: "About",
      programs: "Programs",
      tutors: "Tutors",
      howItWorks: "How It Works",
      testimonials: "Testimonials",
      contact: "Contact",
      getStarted: "Get Started"
    },
    
    // Homepage
    home: {
      hero: {
        title: "Find Your Perfect",
        titleWords: ["Tutor", "Mentor", "Guide"],
        subtitle: "Connect with experienced, qualified tutors across Cameroon for personalized learning. Whether online or at home, one-on-one or in groups, we help you achieve academic excellence.",
        getStarted: "Get Started",
        viewSubjects: "View Subjects"
      },
      stats: {
        learnersGuided: "Learners Guided",
        expertTutors: "Expert Tutors", 
        subjectsCovered: "Subjects Covered",
        citiesCovered: "Cities covered"
      },
      learningOptions: {
        title: "Flexible Learning Options",
        subtitle: "Choose the learning style that works best for you. All options include personalized attention and progress tracking.",
        online: {
          title: "Online Sessions",
          description: "Connect with tutors from anywhere in Cameroon via video call. Perfect for busy schedules with flexible timing and no travel required."
        },
        home: {
          title: "Home Tutoring", 
          description: "Get personalized, one-on-one attention in the comfort of your home. Our tutors come to you with tailored lesson plans and materials."
        },
        group: {
          title: "Group Classes",
          description: "Learn together with peers in small groups. Collaborative learning at affordable rates with interactive sessions and peer support."
        }
      },
      programs: {
        title: "Comprehensive Learning Programs",
        subtitle: "From core academic subjects to practical life skills, we offer tutoring across all areas to help you succeed.",
        academic: {
          title: "Academic Excellence",
          description: "Master core subjects with expert guidance tailored to the Cameroonian curriculum and international standards.",
          subjects: {
            math: "Mathematics & Sciences: Algebra, Calculus, Physics, Chemistry, Biology",
            languages: "Languages & Humanities: English, French, Literature, History, Geography", 
            exams: "Exam Preparation: GCE O/A Levels, BEPC, Baccalauréat, Concours, SAT, TOEFL"
          }
        },
        skills: {
          title: "Skill Development",
          description: "Build practical skills for the modern world with hands-on learning and real-world applications.",
          subjects: {
            tech: "Technology & Coding: Web Development, Python, Mobile Apps, Digital Literacy",
            arts: "Creative Arts: Music, Drawing, Graphic Design, Photography",
            life: "Life Skills: Public Speaking, Leadership, Financial Literacy, Critical Thinking"
          }
        }
      },
      cta: {
        title: "Ready to Excel in Your Studies?",
        subtitle: "Join hundreds of students across Cameroon who are achieving their academic dreams with personalized tutoring from PrepSkul. Start your journey to success today.",
        button: "Start Learning"
      }
    },
    
    // Testimonials
    testimonials: {
      title: "What Our Learners Say",
      subtitle: "Success stories from our students and parents.",
      items: [
        {
          name: "Amina Njoya",
          role: "Student, Form 5",
          content: "PrepSkul changed my life! My math tutor helped me go from failing to getting an A. More than that, they believed in me when I didn't believe in myself.",
          rating: 5,
          image: "/young-african-female-student-smiling.jpg"
        },
        {
          name: "Marie Fotso",
          role: "Parent",
          content: "As a parent, I'm so grateful for PrepSkul. My son's confidence has grown tremendously, and her grades have improved across all his class 5 subjects. The tutors truly care.",
          rating: 5,
          image: "/african-mother-professional.jpg"
        },
        {
          name: "Emmanuel Tabi",
          role: "Student, Upper Sixth",
          content: "The exam preparation was incredible. My tutor gave me strategies that worked, and I passed my A-levels with flying colors. Now I'm heading to university!",
          rating: 5,
          image: "/young-african-male-student-confident.jpg"
        },
        {
          name: "Grace Mbah",
          role: "Coding Student",
          content: "I never thought I could learn to code, but my PrepSkul tutor made it fun and easy to understand. Now I'm building my own websites!",
          rating: 5,
          image: "/young-african-female-tech-student.jpg"
        }
      ]
    },

    
    
    // FAQ
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about PrepSkul.",
      items: [
        {
          question: "What is PrepSkul?",
          answer: "PrepSkul is a learning platform that connects learners across Cameroon and beyond with trusted home and online tutors. Whether it is school subjects or practical skills, we help every learner grow through personal guidance, flexible learning, and caring mentorship, all in one place. We are currently active across Cameroon and soon expanding across Africa."
        },
        {
          question: "How does PrepSkul work?",
          answer: "We match each learner with a tutor or trainer who best fits their goals, schedule, and location. You can choose to learn online or have one-on-one or group sessions at home. Our team ensures that every learning experience is tailored, simple, and effective."
        },
        {
          question: "What do you charge?",
          answer: "Our sessions range between 2,500 XAF and 5,000 XAF, depending on the subject, skill, and duration. Fees are transparent and discussed before lessons begin, and payments are done upfront to confirm your sessions."
        },
        {
          question: "Are your tutors qualified?",
          answer: "Yes. Every tutor and trainer at PrepSkul goes through a careful selection process and regular training through the PrepSkul Academy. This ensures high teaching standards, professionalism, and a genuine passion for helping learners grow."
        },
        {
          question: "What subjects or skills can I learn?",
          answer: "From core school subjects like Mathematics, English, and Sciences to practical skills like Computer Literacy, Coding, and Creative Arts, PrepSkul gives every learner the chance to grow academically and beyond the classroom."
        },
        {
          question: "What curriculum do you use?",
          answer: "We follow the official national and international curricula recognized by Cameroon's Ministry of Education. This ensures that every learner stays on track with their school or exam requirements."
        },
        {
          question: "Can I become a tutor on PrepSkul?",
          answer: "Yes. If you love teaching or sharing your skills, you can apply to join our growing network of tutors. We provide the training, support, and visibility you need to reach more learners and grow as an educator."
        },
        {
          question: "What if I need to reschedule a session?",
          answer: "We understand that schedules change. You can reschedule sessions with at least 24 hours notice at no charge. Just contact your tutor or our support team to arrange a new time."
        }
      ]
    },
    
    // Tutors
    tutors: {
      hero: {
        title: "Become a PrepSkul Tutor",
        subtitle: "Share your knowledge, inspire learners, and build a rewarding career. Join our community of passionate educators making a real difference across Cameroon and Africa.",
        applyNow: "Apply Now"
      },
      whyChooseUs: {
        title: "Why Teach with PrepSkul?",
        subtitle: "Join a platform that values your expertise and supports your growth."
      },
      benefits: {
        competitivePay: {
          title: "Competitive Pay",
          description: "Earn competitive rates for your expertise. Set your own rates and get paid on time, every time."
        },
        steadyStudents: {
          title: "Steady Students",
          description: "We match you with committed learners who are serious about their education and personal growth."
        },
        flexibleSchedule: {
          title: "Flexible Schedule",
          description: "Choose when and how much you want to teach. Perfect for full-time or part-time work."
        },
        trainingSupport: {
          title: "Training Support",
          description: "Access professional development resources and training to enhance your teaching skills."
        },
        careerGrowth: {
          title: "Career Growth",
          description: "Build your reputation, expand your network, and grow your tutoring career with PrepSkul."
        },
        makeImpact: {
          title: "Make an Impact",
          description: "Transform lives through education and mentorship. See the real difference you make every day."
        }
      },
      requirements: {
        title: "What We're Looking For",
        subtitle: "We seek passionate educators who are committed to student success and personal growth.",
        qualifiedEducators: {
          title: "Qualified Educators",
          description: "Degree or certification in your subject area."
        },
        passionForTeaching: {
          title: "Passion for Teaching",
          description: "Genuine desire to help students succeed."
        },
        strongCommunication: {
          title: "Strong Communication",
          description: "Ability to explain concepts clearly."
        },
        reliability: {
          title: "Reliability",
          description: "Commitment to scheduled sessions."
        }
      },
      application: {
        title: "Application Process",
        step1: "Submit your application with credentials",
        step2: "Complete a brief interview",
        step3: "Pass a background check",
        step4: "Complete onboarding training",
        step5: "Start teaching and making an impact!",
        applyButton: "Apply to Teach"
      },
      subjects: {
        title: "Subjects We Need Tutors For",
        subtitle: "We're always looking for qualified tutors in these high-demand areas.",
        mathematics: {
          title: "Mathematics",
          description: "All levels, from basic to advanced"
        },
        sciences: {
          title: "Sciences",
          description: "Physics, Chemistry, Biology"
        },
        languages: {
          title: "Languages",
          description: "English, French, and more"
        },
        coding: {
          title: "Coding",
          description: "Programming and web development"
        },
        arts: {
          title: "Arts",
          description: "Music, drawing, and creative skills"
        },
        business: {
          title: "Business",
          description: "Economics, accounting, finance"
        },
        testPrep: {
          title: "Test Prep",
          description: "GCE, BEPC, and university entrance"
        },
        lifeSkills: {
          title: "Life Skills",
          description: "Leadership, communication, more"
        }
      },
      cta: {
        title: "Ready to Make a Difference?",
        subtitle: "Join PrepSkul today and start inspiring the next generation of learners.",
        button: "Apply to Become a Tutor"
      }
    },
    footer: {
      description: "Guiding every learner to their full potential across Cameroon and Africa.",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      downloadApp: "Download App",
      comingSoon: "Coming Soon!",
      comingSoonDescription: "Our mobile app is launching soon",
      getReady: "Get ready to learn on the go with PrepSkul mobile app!",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      allRightsReserved: "All rights reserved."
    },
    programs: {
      hero: {
        title: "Our Programs",
        subtitle: "From academic excellence to skill mastery, we offer comprehensive programs designed to help every learner reach their full potential."
      },
      academic: {
        title: "Academic Tutoring",
        subtitle: "Master your subjects with personalized guidance from expert tutors",
        button: "Get Academic Support",
        subjects: {
          mathematics: {
            title: "Mathematics",
            description: "Algebra, Geometry, Calculus, Statistics. All levels from primary to university."
          },
          sciences: {
            title: "Sciences",
            description: "Physics, Chemistry, Biology. Hands-on learning with practical applications."
          },
          english: {
            title: "Social Sciences",
            description: "Economics, Geography, History, Literature, Psychology. Hands-on learning through analyzing society, culture, and history."
          },
          languages: {
            title: "Languages",
            description: "English, French, Spanish, and more. Conversational and academic language learning."
          }
        }
      },
      skills: {
        title: "Skill Development",
        subtitle: "Learn practical skills that prepare you for the future",
        button: "Start Skill Development",
        subjects: {
          coding: {
            title: "Coding & Tech",
            description: "Programming, web development, and digital literacy for the modern world."
          },
          art: {
            title: "Art & Design",
            description: "Explore creativity through drawing, painting, graphic design, and more."
          },
          music: {
            title: "Music",
            description: "Learn instruments, music theory, and develop your musical talents."
          },
          lifeSkills: {
            title: "Life Skills",
            description: "Build leadership, communication, and personal development skills."
          }
        }
      },
      examPrep: {
        title: "Exam Preparation",
        subtitle: "Get ready for your most important exams with focused preparation and proven strategies.",
        button: "Prepare for Your Exam",
        exams: {
          gce: {
            title: "GCE O/A Level",
            description: "Comprehensive exam preparation"
          },
          bepc: {
            title: "BEPC & Baccalauréat",
            description: "Targeted practice and review"
          },
          university: {
            title: "University Entrance",
            description: "Prepare for competitive admissions"
          }
        },
        successRate: {
          title: "Success Rate",
          percentage: "95%",
          description: "of our students pass their exams with improved grades after working with PrepSkul tutors"
        }
      },
      included: {
        title: "What's Included",
        subtitle: "Every program comes with comprehensive support",
        features: {
          tutors: {
            title: "Qualified Tutors",
            description: "Expert educators in their fields"
          },
          plans: {
            title: "Personalized Plans",
            description: "Tailored to your learning needs"
          },
          tracking: {
            title: "Progress Tracking",
            description: "Regular feedback and updates"
          },
          flexible: {
            title: "Flexible Learning",
            description: "Online, home, or group options"
          }
        }
      },
      cta: {
        title: "Ready to Start Your Program?",
        subtitle: "Choose the program that fits your goals and start learning today",
        getStarted: "Get Started",
        learnMore: "Learn How It Works"
      }
    },
    contact: {
      hero: {
        title: "Get in Touch",
        subtitle: "Whether you're a student looking to excel in your studies, a parent seeking the best educational support for your child, or a tutor wanting to join our team, we're here to help. Fill out the form below and we'll connect you with the right solution."
      },
      form: {
        title: "Tell Us About Yourself",
        fields: {
          name: {
            label: "Full Name",
            placeholder: "Enter your full name"
          },
          phone: {
            label: "Phone Number",
            placeholder: "+237 XXX XXX XXX"
          },
          role: {
            label: "I am a",
            placeholder: "Select your role",
            options: {
              student: "Student",
              parent: "Parent",
              tutor: "Tutor"
            }
          },
          program: {
            label: "Program of Interest",
            placeholder: "Select program",
            options: {
              academic: "Academic Tutoring",
              skills: "Skill Development",
              exam: "Exam Preparation"
            }
          },
          academicSubjects: {
            label: "Subjects",
            placeholder: "Select subjects you need help with",
            options: {
              mathematics: "Mathematics",
              english: "English",
              french: "French",
              physics: "Physics",
              chemistry: "Chemistry",
              biology: "Biology",
              history: "History",
              geography: "Geography",
              computer_science: "Computer Science",
              literature: "Literature",
              economics: "Economics",
              accounting: "Accounting",
              other: "Other"
            }
          },
          examTypes: {
            label: "Exam Type",
            placeholder: "Select exam type",
            options: {
              common_entrance: "Common Entrance",
              concours_6eme: "Concours 6ème",
              bepc: "BEPC",
              gce_ol: "GCE O-Level",
              probatoire: "Probatoire",
              baccalaureat: "Baccalauréat",
              gce_al: "GCE A-Level",
              sat: "SAT",
              ielts: "IELTS",
              toefl: "TOEFL",
              concours_ens: "Concours ENS",
              concours_polytechnique: "Concours Polytechnique",
              concours_medecine: "Concours Médecine",
              other: "Other"
            }
          },
          skills: {
            label: "Skills",
            placeholder: "Select skills you want to develop",
            options: {
              programming: "Programming",
              web_development: "Web Development",
              app_development: "Mobile App Development",
              data_science: "Data Science",
              music: "Music",
              art: "Art & Design",
              photography: "Photography",
              public_speaking: "Public Speaking",
              english_conversation: "English Conversation",
              french_conversation: "French Conversation",
              digital_marketing: "Digital Marketing",
              graphic_design: "Graphic Design",
              other: "Other"
            }
          },
          comment: {
            label: "Additional Comments",
            placeholder: "Tell us more about your needs (optional)"
          }
        },
        submit: {
          sending: "Sending...",
          send: "Submit & Continue to WhatsApp"
        },
        success: {
          message: "Thank you! Redirecting you to WhatsApp..."
        }
      },
      contactInfo: {
        title: "Other Ways to Reach Us",
        phone: {
          title: "Phone",
          description: "+237 6 74 20 85 73"
        },
        location: {
          title: "Location",
          description: "Buea, Cameroon"
        }
      }
    },
    mobile: {
      findTutor: {
        title: "Find Your Tutor",
        subtitle: "Connect with expert tutors across Cameroon"
      },
      learningOptions: {
        online: "Online",
        home: "Home",
        groups: "Groups"
      },
      tutor: {
        name: "Sir Carl",
        subjects: "Mathematics & Physics",
        rating: "4.9",
        sessions: "50+",
        sessionsLabel: "sessions",
        availability: "Online",
        availabilityLabel: "& Home",
        bookButton: "Book Session"
      },
      subjects: {
        title: "Popular Subjects",
        mathematics: "Mathematics",
        sciences: "Sciences",
        coding: "Coding",
        languages: "Languages"
      },
      whyPrepSkul: {
        title: "Why PrepSkul?",
        verifiedTutors: "Verified expert tutors",
        flexibleScheduling: "Flexible scheduling",
        affordableRates: "Affordable rates"
      }
    },

    // About page
    about: {
      hero: {
        title: "We Believe",
        titleAccent: "Guidance",
        titlePrimary: "Builds",
        titlePrimaryEnd: "Greatness",
        subtitle: "PrepSkul is more than a tutoring platform. We're a movement dedicated to unlocking the potential of every learner across Cameroon and Africa."
      },
      story: {
        title: "Our Story",
        paragraph1: "PrepSkul was born from a simple observation: every learner has unique potential waiting to be discovered. But too often, traditional education systems fail to provide the personalized guidance needed to unlock that potential.",
        paragraph2: "We created PrepSkul to bridge this gap. By connecting learners with qualified tutors and mentors who truly care, we're building a community where every student can thrive academically and personally.",
        paragraph3: "Our platform goes beyond just academic tutoring. We focus on mentorship, mindset building, and personal growth, helping learners not only perform better in school but also discover who they can become."
      },
      mission: {
        title: "Our Mission",
        description: "To be part of the world's revolution in learning by helping every learner discover their potential through mentorship, guidance, and skill development."
      },
      values: {
        title: "Our Core Values",
        subtitle: "These principles guide everything we do at PrepSkul",
        growth: {
          title: "Growth",
          description: "We believe in continuous improvement and helping every learner reach new heights through dedicated support and encouragement."
        },
        trust: {
          title: "Trust",
          description: "We build lasting relationships based on trust, transparency, and genuine care for each learner's success and well-being."
        },
        accountability: {
          title: "Accountability",
          description: "We hold ourselves and our tutors to the highest standards, ensuring quality education and measurable results."
        },
        accessibility: {
          title: "Accessibility",
          description: "Quality education should be available to everyone. We make learning affordable and accessible across Cameroon and Africa."
        },
        community: {
          title: "Community",
          description: "We're building a supportive learning community where students, tutors, and families grow together."
        },
        excellence: {
          title: "Excellence",
          description: "We strive for excellence in everything we do, from tutor selection to learning experiences and student outcomes."
        }
      },
      cta: {
        title: "Join Our Growing Community",
        subtitle: "Whether you're a learner seeking guidance or a tutor ready to make an impact, there's a place for you at PrepSkul",
        startLearning: "Start Learning",
        becomeTutor: "Become a Tutor"
      }
    }
  },
  
  fr: {
    // Navigation
    nav: {
      home: "Accueil",
      about: "À Propos",
      programs: "Programmes",
      tutors: "Tuteurs",
      howItWorks: "Comment Ça Marche",
      testimonials: "Témoignages",
      contact: "Contact",
      getStarted: "Commencer"
    },
    
    // Homepage
    home: {
      hero: {
        title: "Trouvez Votre",
        titleWords: ["Tuteur", "Mentor", "Guide"],
        subtitle: "Connectez-vous avec des tuteurs expérimentés et qualifiés à travers le Cameroun pour un apprentissage personnalisé. Que ce soit en ligne ou à domicile, en tête-à-tête ou en groupes, nous vous aidons à atteindre l'excellence académique.",
        getStarted: "Commencer",
        viewSubjects: "Voir les Matières"
      },
      stats: {
        learnersGuided: "Apprenants Guidés",
        expertTutors: "Tuteurs Experts",
        subjectsCovered: "Matières Couvertes", 
        citiesCovered: "Villes couvertes"
      },
      learningOptions: {
        title: "Options d'Apprentissage Flexibles",
        subtitle: "Choisissez le style d'apprentissage qui vous convient le mieux. Toutes les options incluent une attention personnalisée et un suivi des progrès.",
        online: {
          title: "Sessions en Ligne",
          description: "Connectez-vous avec des tuteurs de n'importe où au Cameroun via appel vidéo. Parfait pour les emplois du temps chargés avec des horaires flexibles et sans déplacement requis."
        },
        home: {
          title: "Cours à Domicile",
          description: "Obtenez une attention personnalisée et individuelle dans le confort de votre foyer. Nos tuteurs viennent chez vous avec des plans de cours et du matériel adaptés."
        },
        group: {
          title: "Cours en Groupe",
          description: "Apprenez ensemble avec vos pairs en petits groupes. Apprentissage collaboratif à des tarifs abordables avec des sessions interactives et un soutien entre pairs."
        }
      },
      programs: {
        title: "Programmes d'Apprentissage Complets",
        subtitle: "Des matières académiques de base aux compétences pratiques de la vie, nous offrons du tutorat dans tous les domaines pour vous aider à réussir.",
        academic: {
          title: "Excellence Académique",
          description: "Maîtrisez les matières de base avec l'orientation d'experts adaptée au curriculum camerounais et aux standards internationaux.",
          subjects: {
            math: "Mathématiques & Sciences : Algèbre, Calcul, Physique, Chimie, Biologie",
            languages: "Langues & Sciences Humaines : Anglais, Français, Littérature, Histoire, Géographie",
            exams: "Préparation aux Examens : GCE O/A Levels, BEPC, Baccalauréat, Concours, SAT, TOEFL"
          }
        },
        skills: {
          title: "Développement de Compétences",
          description: "Développez des compétences pratiques pour le monde moderne avec un apprentissage pratique et des applications du monde réel.",
          subjects: {
            tech: "Technologie & Programmation : Développement Web, Python, Applications Mobiles, Littératie Numérique",
            arts: "Arts Créatifs : Musique, Dessin, Design Graphique, Photographie",
            life: "Compétences de Vie : Prise de Parole en Public, Leadership, Littératie Financière, Pensée Critique"
          }
        }
      },
      cta: {
        title: "Prêt à Exceller dans Vos Études ?",
        subtitle: "Rejoignez des centaines d'étudiants à travers le Cameroun qui réalisent leurs rêves académiques avec le tutorat personnalisé de PrepSkul. Commencez votre parcours vers le succès dès aujourd'hui.",
        button: "Commencer à Apprendre"
      }
    },
    
    // Testimonials
    testimonials: {
      title: "Ce que Disent Nos Apprenants",
      subtitle: "Des histoires de réussite de nos étudiants et parents.",
      items: [
        {
          name: "Amina Njoya",
          role: "Étudiante, Forme 5",
          content: "PrepSkul a changé ma vie ! Mon tuteur de mathématiques m'a aidée à passer de l'échec à un A. Plus que cela, ils ont cru en moi quand je ne croyais pas en moi-même.",
          rating: 5,
          image: "/young-african-female-student-smiling.jpg"
        },
        {
          name: "Marie Fotso",
          role: "Parent",
          content: "En tant que parent, je suis si reconnaissante pour PrepSkul. La confiance de mon fils a énormément grandi, et ses notes se sont améliorées dans toutes ses matières de classe 5. Les tuteurs se soucient vraiment.",
          rating: 5,
          image: "/african-mother-professional.jpg"
        },
        {
          name: "Emmanuel Tabi",
          role: "Étudiant, Upper Sixth",
          content: "La préparation aux examens était incroyable. Mon tuteur m'a donné des stratégies qui ont fonctionné, et j'ai réussi mes A-levels avec brio. Maintenant je vais à l'université !",
          rating: 5,
          image: "/young-african-male-student-confident.jpg"
        },
        {
          name: "Grace Mbah",
          role: "Étudiante en Programmation",
          content: "Je n'aurais jamais pensé pouvoir apprendre à programmer, mais mon tuteur PrepSkul a rendu cela amusant et facile à comprendre. Maintenant je construis mes propres sites web !",
          rating: 5,
          image: "/young-african-female-tech-student.jpg"
        }
      ]
    },
    
    // FAQ
    faq: {
      title: "Questions Fréquemment Posées",
      subtitle: "Trouvez des réponses à vos questions courantes sur PrepSkul.",
      items: [
        {
          question: "Qu'est-ce que PrepSkul ?",
          answer: "PrepSkul est une plateforme d'apprentissage qui connecte les apprenants à travers le Cameroun et au-delà avec des tuteurs de confiance à domicile et en ligne. Que ce soit des matières scolaires ou des compétences pratiques, nous aidons chaque apprenant à grandir grâce à un accompagnement personnel, un apprentissage flexible et un mentorat bienveillant, le tout en un seul endroit. Nous sommes actuellement actifs à travers le Cameroun et nous nous étendons bientôt à travers l'Afrique."
        },
        {
          question: "Comment fonctionne PrepSkul ?",
          answer: "Nous mettons en relation chaque apprenant avec un tuteur ou formateur qui correspond le mieux à ses objectifs, son emploi du temps et sa localisation. Vous pouvez choisir d'apprendre en ligne ou avoir des sessions individuelles ou en groupe à domicile. Notre équipe s'assure que chaque expérience d'apprentissage est personnalisée, simple et efficace."
        },
        {
          question: "Que facturez-vous ?",
          answer: "Nos sessions varient entre 2 500 XAF et 5 000 XAF, selon la matière, la compétence et la durée. Les frais sont transparents et discutés avant le début des cours, et les paiements sont effectués à l'avance pour confirmer vos sessions."
        },
        {
          question: "Vos tuteurs sont-ils qualifiés ?",
          answer: "Oui. Chaque tuteur et formateur chez PrepSkul passe par un processus de sélection rigoureux et une formation régulière à travers l'Académie PrepSkul. Cela garantit des normes d'enseignement élevées, le professionnalisme et une passion sincère pour aider les apprenants à grandir."
        },
        {
          question: "Quelles matières ou compétences puis-je apprendre ?",
          answer: "Des matières scolaires de base comme les Mathématiques, l'Anglais et les Sciences aux compétences pratiques comme la Littératie Informatique, la Programmation et les Arts Créatifs, PrepSkul donne à chaque apprenant la chance de grandir académiquement et au-delà de la salle de classe."
        },
        {
          question: "Quel programme d'études utilisez-vous ?",
          answer: "Nous suivons les programmes officiels nationaux et internationaux reconnus par le Ministère de l'Éducation du Cameroun. Cela garantit que chaque apprenant reste sur la bonne voie avec ses exigences scolaires ou d'examen."
        },
        {
          question: "Puis-je devenir tuteur chez PrepSkul ?",
          answer: "Oui. Si vous aimez enseigner ou partager vos compétences, vous pouvez postuler pour rejoindre notre réseau croissant de tuteurs. Nous fournissons la formation, le soutien et la visibilité dont vous avez besoin pour atteindre plus d'apprenants et grandir en tant qu'éducateur."
        },
        {
          question: "Que se passe-t-il si je dois reporter une session ?",
          answer: "Nous comprenons que les emplois du temps changent. Vous pouvez reporter des sessions avec un préavis d'au moins 24 heures sans frais. Contactez simplement votre tuteur ou notre équipe de support pour organiser un nouveau moment."
        }
      ]
    },
    
    // Tutors
    tutors: {
      hero: {
        title: "Devenez Tuteur PrepSkul",
        subtitle: "Partagez vos connaissances, inspirez les apprenants et construisez une carrière enrichissante. Rejoignez notre communauté d'éducateurs passionnés qui font une vraie différence à travers le Cameroun et l'Afrique.",
        applyNow: "Postuler Maintenant"
      },
      whyChooseUs: {
        title: "Pourquoi Enseigner avec PrepSkul ?",
        subtitle: "Rejoignez une plateforme qui valorise votre expertise et soutient votre croissance."
      },
      benefits: {
        competitivePay: {
          title: "Rémunération Compétitive",
          description: "Gagnez des tarifs compétitifs pour votre expertise. Fixez vos propres tarifs et soyez payé à temps, à chaque fois."
        },
        steadyStudents: {
          title: "Étudiants Réguliers",
          description: "Nous vous mettons en relation avec des apprenants engagés qui sont sérieux dans leur éducation et leur développement personnel."
        },
        flexibleSchedule: {
          title: "Horaire Flexible",
          description: "Choisissez quand et combien vous voulez enseigner. Parfait pour un travail à temps plein ou à temps partiel."
        },
        trainingSupport: {
          title: "Support de Formation",
          description: "Accédez à des ressources de développement professionnel et à des formations pour améliorer vos compétences d'enseignement."
        },
        careerGrowth: {
          title: "Croissance de Carrière",
          description: "Construisez votre réputation, élargissez votre réseau et développez votre carrière de tuteur avec PrepSkul."
        },
        makeImpact: {
          title: "Faire une Différence",
          description: "Transformez des vies grâce à l'éducation et au mentorat. Voyez la vraie différence que vous faites chaque jour."
        }
      },
      requirements: {
        title: "Ce que Nous Recherchons",
        subtitle: "Nous recherchons des éducateurs passionnés qui s'engagent pour la réussite des étudiants et le développement personnel.",
        qualifiedEducators: {
          title: "Éducateurs Qualifiés",
          description: "Diplôme ou certification dans votre domaine d'étude."
        },
        passionForTeaching: {
          title: "Passion pour l'Enseignement",
          description: "Désir sincère d'aider les étudiants à réussir."
        },
        strongCommunication: {
          title: "Communication Forte",
          description: "Capacité à expliquer les concepts clairement."
        },
        reliability: {
          title: "Fiabilité",
          description: "Engagement envers les sessions programmées."
        }
      },
      application: {
        title: "Processus de Candidature",
        step1: "Soumettez votre candidature avec vos qualifications",
        step2: "Passez un bref entretien",
        step3: "Passez une vérification d'antécédents",
        step4: "Terminez la formation d'intégration",
        step5: "Commencez à enseigner et à faire une différence !",
        applyButton: "Postuler pour Enseigner"
      },
      subjects: {
        title: "Matières pour lesquelles Nous Cherchons des Tuteurs",
        subtitle: "Nous recherchons toujours des tuteurs qualifiés dans ces domaines très demandés.",
        mathematics: {
          title: "Mathématiques",
          description: "Tous niveaux, du basique à l'avancé"
        },
        sciences: {
          title: "Sciences",
          description: "Physique, Chimie, Biologie"
        },
        languages: {
          title: "Langues",
          description: "Anglais, Français et plus"
        },
        coding: {
          title: "Programmation",
          description: "Programmation et développement web"
        },
        arts: {
          title: "Arts",
          description: "Musique, dessin et compétences créatives"
        },
        business: {
          title: "Commerce",
          description: "Économie, comptabilité, finance"
        },
        testPrep: {
          title: "Préparation aux Examens",
          description: "GCE, BEPC et entrée à l'université"
        },
        lifeSkills: {
          title: "Compétences de Vie",
          description: "Leadership, communication, plus"
        }
      },
      cta: {
        title: "Prêt à Faire une Différence ?",
        subtitle: "Rejoignez PrepSkul aujourd'hui et commencez à inspirer la prochaine génération d'apprenants.",
        button: "Postuler pour Devenir Tuteur"
      }
    },
    footer: {
      description: "Guider chaque apprenant vers son plein potentiel à travers le Cameroun et l'Afrique.",
      quickLinks: "Liens Rapides",
      contactUs: "Nous Contacter",
      downloadApp: "Télécharger l'App",
      comingSoon: "Bientôt Disponible !",
      comingSoonDescription: "Notre application mobile sera bientôt disponible",
      getReady: "Préparez-vous à apprendre en déplacement avec l'application mobile PrepSkul !",
      days: "Jours",
      hours: "Heures",
      minutes: "Minutes",
      seconds: "Secondes",
      allRightsReserved: "Tous droits réservés."
    },
    programs: {
      hero: {
        title: "Nos Programmes",
        subtitle: "De l'excellence académique à la maîtrise des compétences, nous offrons des programmes complets conçus pour aider chaque apprenant à atteindre son plein potentiel."
      },
      academic: {
        title: "Cours Particuliers Académiques",
        subtitle: "Maîtrisez vos matières avec un accompagnement personnalisé d'experts tuteurs",
        button: "Obtenir un Soutien Académique",
        subjects: {
          mathematics: {
            title: "Mathématiques",
            description: "Algèbre, Géométrie, Calcul, Statistiques. Tous niveaux du primaire à l'université."
          },
          sciences: {
            title: "Sciences",
            description: "Physique, Chimie, Biologie. Apprentissage pratique avec applications concrètes."
          },
          english: {
            title: "Anglais",
            description: "Lecture, écriture, grammaire, littérature. Développez de solides compétences de communication."
          },
          languages: {
            title: "Langues",
            description: "Français, Espagnol et plus. Apprentissage conversationnel et académique des langues."
          }
        }
      },
      skills: {
        title: "Développement de Compétences",
        subtitle: "Apprenez des compétences pratiques qui vous préparent pour l'avenir",
        button: "Commencer le Développement de Compétences",
        subjects: {
          coding: {
            title: "Programmation & Tech",
            description: "Programmation, développement web et alphabétisation numérique pour le monde moderne."
          },
          art: {
            title: "Art & Design",
            description: "Explorez la créativité à travers le dessin, la peinture, le design graphique et plus."
          },
          music: {
            title: "Musique",
            description: "Apprenez les instruments, la théorie musicale et développez vos talents musicaux."
          },
          lifeSkills: {
            title: "Compétences de Vie",
            description: "Développez le leadership, la communication et les compétences de développement personnel."
          }
        }
      },
      examPrep: {
        title: "Préparation aux Examens",
        subtitle: "Préparez-vous à vos examens les plus importants avec une préparation ciblée et des stratégies éprouvées.",
        button: "Préparez-vous à Votre Examen",
        exams: {
          gce: {
            title: "GCE O/A Level",
            description: "Préparation complète aux examens"
          },
          bepc: {
            title: "BEPC & Baccalauréat",
            description: "Pratique ciblée et révision"
          },
          university: {
            title: "Entrée à l'Université",
            description: "Préparez-vous aux admissions compétitives"
          }
        },
        successRate: {
          title: "Taux de Réussite",
          percentage: "95%",
          description: "de nos étudiants réussissent leurs examens avec des notes améliorées après avoir travaillé avec les tuteurs PrepSkul"
        }
      },
      included: {
        title: "Ce qui est Inclus",
        subtitle: "Chaque programme vient avec un soutien complet",
        features: {
          tutors: {
            title: "Tuteurs Qualifiés",
            description: "Éducateurs experts dans leurs domaines"
          },
          plans: {
            title: "Plans Personnalisés",
            description: "Adaptés à vos besoins d'apprentissage"
          },
          tracking: {
            title: "Suivi des Progrès",
            description: "Retours réguliers et mises à jour"
          },
          flexible: {
            title: "Apprentissage Flexible",
            description: "Options en ligne, à domicile ou en groupe"
          }
        }
      },
      cta: {
        title: "Prêt à Commencer Votre Programme ?",
        subtitle: "Choisissez le programme qui correspond à vos objectifs et commencez à apprendre dès aujourd'hui",
        getStarted: "Commencer",
        learnMore: "Découvrir Comment Ça Marche"
      }
    },
    contact: {
      hero: {
        title: "Contactez-Nous",
        subtitle: "Que vous soyez un étudiant cherchant à exceller dans vos études, un parent recherchant le meilleur soutien éducatif pour votre enfant, ou un tuteur souhaitant rejoindre notre équipe, nous sommes là pour vous aider. Remplissez le formulaire ci-dessous et nous vous connecterons à la bonne solution."
      },
      form: {
        title: "Parlez-Nous de Vous",
        fields: {
          name: {
            label: "Nom Complet",
            placeholder: "Entrez votre nom complet"
          },
          phone: {
            label: "Numéro de Téléphone",
            placeholder: "+237 XXX XXX XXX"
          },
          role: {
            label: "Je suis",
            placeholder: "Sélectionnez votre rôle",
            options: {
              student: "Étudiant",
              parent: "Parent",
              tutor: "Tuteur"
            }
          },
          program: {
            label: "Programme d'Intérêt",
            placeholder: "Sélectionnez le programme",
            options: {
              academic: "Cours Particuliers Académiques",
              skills: "Développement de Compétences",
              exam: "Préparation aux Examens"
            }
          },
          academicSubjects: {
            label: "Matières",
            placeholder: "Sélectionnez les matières pour lesquelles vous avez besoin d'aide",
            options: {
              mathematics: "Mathématiques",
              english: "Anglais",
              french: "Français",
              physics: "Physique",
              chemistry: "Chimie",
              biology: "Biologie",
              history: "Histoire",
              geography: "Géographie",
              computer_science: "Informatique",
              literature: "Littérature",
              economics: "Économie",
              accounting: "Comptabilité",
              other: "Autre"
            }
          },
          examTypes: {
            label: "Type d'Examen",
            placeholder: "Sélectionnez le type d'examen",
            options: {
              common_entrance: "Common Entrance",
              concours_6eme: "Concours 6ème",
              bepc: "BEPC",
              gce_ol: "GCE O-Level",
              probatoire: "Probatoire",
              baccalaureat: "Baccalauréat",
              gce_al: "GCE A-Level",
              sat: "SAT",
              ielts: "IELTS",
              toefl: "TOEFL",
              concours_ens: "Concours ENS",
              concours_polytechnique: "Concours Polytechnique",
              concours_medecine: "Concours Médecine",
              other: "Autre"
            }
          },
          skills: {
            label: "Compétences",
            placeholder: "Sélectionnez les compétences que vous voulez développer",
            options: {
              programming: "Programmation",
              web_development: "Développement Web",
              app_development: "Applications Mobiles",
              data_science: "Science des Données",
              music: "Musique",
              art: "Art et Design",
              photography: "Photographie",
              public_speaking: "Prise de Parole",
              english_conversation: "Conversation Anglais",
              french_conversation: "Conversation Français",
              digital_marketing: "Marketing Numérique",
              graphic_design: "Design Graphique",
              other: "Autre"
            }
          },
          comment: {
            label: "Commentaires Supplémentaires",
            placeholder: "Dites-nous plus sur vos besoins (optionnel)"
          }
        },
        submit: {
          sending: "Envoi en cours...",
          send: "Soumettre et Continuer vers WhatsApp"
        },
        success: {
          message: "Merci ! Redirection vers WhatsApp..."
        }
      },
      contactInfo: {
        title: "Autres Moyens de Nous Contacter",
        phone: {
          title: "Téléphone",
          description: "+237 6 74 20 85 73"
        },
        location: {
          title: "Localisation",
          description: "Buea, Cameroun"
        }
      }
    },
    mobile: {
      findTutor: {
        title: "Trouvez Votre Tuteur",
        subtitle: "Connectez-vous avec des tuteurs experts à travers le Cameroun"
      },
      learningOptions: {
        online: "En Ligne",
        home: "À Domicile",
        groups: "Groupes"
      },
      tutor: {
        name: "Sir Carl",
        subjects: "Mathématiques & Physique",
        rating: "4,9",
        sessions: "50+",
        sessionsLabel: "séances",
        availability: "En Ligne",
        availabilityLabel: "& À Domicile",
        bookButton: "Réserver Séance"
      },
      subjects: {
        title: "Matières Populaires",
        mathematics: "Mathématiques",
        sciences: "Sciences",
        coding: "Programmation",
        languages: "Langues"
      },
      whyPrepSkul: {
        title: "Pourquoi PrepSkul ?",
        verifiedTutors: "Tuteurs experts vérifiés",
        flexibleScheduling: "Planification flexible",
        affordableRates: "Tarifs abordables"
      }
    },

    // About page
    about: {
      hero: {
        title: "Nous Croyons que",
        titleAccent: "l'Orientation",
        titlePrimary: "Construit la",
        titlePrimaryEnd: "Grandeur",
        subtitle: "PrepSkul est plus qu'une plateforme de tutorat. Nous sommes un mouvement dédié à libérer le potentiel de chaque apprenant à travers le Cameroun et l'Afrique."
      },
      story: {
        title: "Notre Histoire",
        paragraph1: "PrepSkul est né d'une simple observation : chaque apprenant a un potentiel unique qui attend d'être découvert. Mais trop souvent, les systèmes éducatifs traditionnels ne parviennent pas à fournir l'orientation personnalisée nécessaire pour libérer ce potentiel.",
        paragraph2: "Nous avons créé PrepSkul pour combler cette lacune. En connectant les apprenants avec des tuteurs et mentors qualifiés qui se soucient vraiment, nous construisons une communauté où chaque étudiant peut s'épanouir académiquement et personnellement.",
        paragraph3: "Notre plateforme va au-delà du simple tutorat académique. Nous nous concentrons sur le mentorat, le développement de l'état d'esprit et la croissance personnelle, aidant les apprenants non seulement à mieux performer à l'école mais aussi à découvrir qui ils peuvent devenir."
      },
      mission: {
        title: "Notre Mission",
        description: "Faire partie de la révolution mondiale de l'apprentissage en aidant chaque apprenant à découvrir son potentiel à travers le mentorat, l'orientation et le développement de compétences."
      },
      values: {
        title: "Nos Valeurs Fondamentales",
        subtitle: "Ces principes guident tout ce que nous faisons chez PrepSkul",
        growth: {
          title: "Croissance",
          description: "Nous croyons en l'amélioration continue et en aidant chaque apprenant à atteindre de nouveaux sommets grâce à un soutien et des encouragements dédiés."
        },
        trust: {
          title: "Confiance",
          description: "Nous construisons des relations durables basées sur la confiance, la transparence et l'attention sincère portée au succès et au bien-être de chaque apprenant."
        },
        accountability: {
          title: "Responsabilité",
          description: "Nous nous tenons, ainsi que nos tuteurs, aux normes les plus élevées, garantissant une éducation de qualité et des résultats mesurables."
        },
        accessibility: {
          title: "Accessibilité",
          description: "Une éducation de qualité devrait être accessible à tous. Nous rendons l'apprentissage abordable et accessible à travers le Cameroun et l'Afrique."
        },
        community: {
          title: "Communauté",
          description: "Nous construisons une communauté d'apprentissage solidaire où les étudiants, les tuteurs et les familles grandissent ensemble."
        },
        excellence: {
          title: "Excellence",
          description: "Nous visons l'excellence dans tout ce que nous faisons, de la sélection des tuteurs aux expériences d'apprentissage et aux résultats des étudiants."
        }
      },
      cta: {
        title: "Rejoignez Notre Communauté Grandissante",
        subtitle: "Que vous soyez un apprenant en quête d'orientation ou un tuteur prêt à avoir un impact, il y a une place pour vous chez PrepSkul",
        startLearning: "Commencer à Apprendre",
        becomeTutor: "Devenir Tuteur"
      }
    }
  }
} as const

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en
}
