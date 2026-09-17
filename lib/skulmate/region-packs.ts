/**
 * Region packs are data for the tutor model — not a static lesson script.
 * Cameroon is the home pack. Other countries adapt the same shape.
 */

export type Bilingual = { en: string; fr: string }

export type RegionOption = {
  id: string
  label: Bilingual
}

export type RegionLevel = RegionOption & {
  educationLevel: string
}

export type RegionSystem = {
  id: string
  label: Bilingual
  levels: RegionLevel[]
  exams: RegionOption[]
  subjects: RegionOption[]
}

export type RegionPack = {
  id: string
  countryCode: string
  label: Bilingual
  cities: RegionOption[]
  systems: RegionSystem[]
  interests: RegionOption[]
  /** Injected into the policy model. Calibrate examples; never block topics. */
  pedagogyNotes: string
}

export function t(label: Bilingual, locale = 'en'): string {
  return locale.toLowerCase().startsWith('fr') ? label.fr : label.en
}

const CM_FR_SUBJECTS: RegionOption[] = [
  { id: 'maths', label: { en: 'Mathematics', fr: 'Mathématiques' } },
  { id: 'french', label: { en: 'French', fr: 'Français' } },
  { id: 'english', label: { en: 'English', fr: 'Anglais' } },
  { id: 'pct', label: { en: 'Physics-Chemistry', fr: 'Physique-Chimie' } },
  { id: 'svt', label: { en: 'Life & Earth sciences', fr: 'SVT' } },
  { id: 'histgeo', label: { en: 'History-Geography', fr: 'Histoire-Géo' } },
  { id: 'philo', label: { en: 'Philosophy', fr: 'Philosophie' } },
  { id: 'cs', label: { en: 'Computer science', fr: 'Informatique' } },
  { id: 'other', label: { en: 'Something else', fr: 'Autre chose' } },
]

const CM_EN_SUBJECTS: RegionOption[] = [
  { id: 'maths', label: { en: 'Mathematics', fr: 'Mathématiques' } },
  { id: 'english', label: { en: 'English', fr: 'Anglais' } },
  { id: 'french', label: { en: 'French', fr: 'Français' } },
  { id: 'physics', label: { en: 'Physics', fr: 'Physique' } },
  { id: 'chemistry', label: { en: 'Chemistry', fr: 'Chimie' } },
  { id: 'biology', label: { en: 'Biology', fr: 'Biologie' } },
  { id: 'geography', label: { en: 'Geography', fr: 'Géographie' } },
  { id: 'literature', label: { en: 'Literature', fr: 'Littérature' } },
  { id: 'economics', label: { en: 'Economics', fr: 'Économie' } },
  { id: 'cs', label: { en: 'Computer science', fr: 'Informatique' } },
  { id: 'other', label: { en: 'Something else', fr: 'Autre chose' } },
]

const AFRICA_INTERESTS: RegionOption[] = [
  { id: 'football', label: { en: 'Football', fr: 'Football' } },
  { id: 'music', label: { en: 'Music', fr: 'Musique' } },
  { id: 'gospel', label: { en: 'Gospel / choir', fr: 'Gospel / chorale' } },
  { id: 'gaming', label: { en: 'Gaming', fr: 'Jeux vidéo' } },
  { id: 'coding', label: { en: 'Coding', fr: 'Code' } },
  { id: 'art', label: { en: 'Art', fr: 'Art' } },
  { id: 'cooking', label: { en: 'Cooking', fr: 'Cuisine' } },
  { id: 'business', label: { en: 'Business / hustle', fr: 'Business' } },
  { id: 'faith', label: { en: 'Faith', fr: 'Foi' } },
  { id: 'reading', label: { en: 'Reading', fr: 'Lecture' } },
  { id: 'dance', label: { en: 'Dance', fr: 'Danse' } },
  { id: 'other', label: { en: 'Add your own', fr: 'Autre' } },
]

const CAMEROON_FRANCOPHONE: RegionSystem = {
  id: 'cm-francophone',
  label: { en: 'Francophone (BEPC / Probatoire / Bac)', fr: 'Francophone (BEPC / Probatoire / Bac)' },
  levels: [
    { id: 'sil', label: { en: 'SIL', fr: 'SIL' }, educationLevel: 'Primary School' },
    { id: 'cp', label: { en: 'CP', fr: 'CP' }, educationLevel: 'Primary School' },
    { id: 'ce1', label: { en: 'CE1', fr: 'CE1' }, educationLevel: 'Primary School' },
    { id: 'ce2', label: { en: 'CE2', fr: 'CE2' }, educationLevel: 'Primary School' },
    { id: 'cm1', label: { en: 'CM1', fr: 'CM1' }, educationLevel: 'Primary School' },
    { id: 'cm2', label: { en: 'CM2', fr: 'CM2' }, educationLevel: 'Primary School' },
    { id: '6eme', label: { en: '6ème', fr: '6ème' }, educationLevel: 'Secondary School' },
    { id: '5eme', label: { en: '5ème', fr: '5ème' }, educationLevel: 'Secondary School' },
    { id: '4eme', label: { en: '4ème', fr: '4ème' }, educationLevel: 'Secondary School' },
    { id: '3eme', label: { en: '3ème', fr: '3ème' }, educationLevel: 'Secondary School' },
    { id: '2nde', label: { en: '2nde', fr: '2nde' }, educationLevel: 'High School' },
    { id: '1ere', label: { en: '1ère', fr: '1ère' }, educationLevel: 'High School' },
    { id: 'terminale', label: { en: 'Terminale', fr: 'Terminale' }, educationLevel: 'High School' },
    { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
  ],
  exams: [
    { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
    { id: 'bepc', label: { en: 'BEPC', fr: 'BEPC' } },
    { id: 'probatoire', label: { en: 'Probatoire', fr: 'Probatoire' } },
    { id: 'bac', label: { en: 'Baccalauréat', fr: 'Baccalauréat' } },
    { id: 'concours', label: { en: 'Concours', fr: 'Concours' } },
  ],
  subjects: CM_FR_SUBJECTS,
}

const CAMEROON_ANGLOPHONE: RegionSystem = {
  id: 'cm-anglophone',
  label: { en: 'Anglophone (GCE O / A Level)', fr: 'Anglophone (GCE O / A Level)' },
  levels: [
    { id: 'class1', label: { en: 'Class 1', fr: 'Class 1' }, educationLevel: 'Primary School' },
    { id: 'class2', label: { en: 'Class 2', fr: 'Class 2' }, educationLevel: 'Primary School' },
    { id: 'class3', label: { en: 'Class 3', fr: 'Class 3' }, educationLevel: 'Primary School' },
    { id: 'class4', label: { en: 'Class 4', fr: 'Class 4' }, educationLevel: 'Primary School' },
    { id: 'class5', label: { en: 'Class 5', fr: 'Class 5' }, educationLevel: 'Primary School' },
    { id: 'class6', label: { en: 'Class 6', fr: 'Class 6' }, educationLevel: 'Primary School' },
    { id: 'form1', label: { en: 'Form 1', fr: 'Form 1' }, educationLevel: 'Secondary School' },
    { id: 'form2', label: { en: 'Form 2', fr: 'Form 2' }, educationLevel: 'Secondary School' },
    { id: 'form3', label: { en: 'Form 3', fr: 'Form 3' }, educationLevel: 'Secondary School' },
    { id: 'form4', label: { en: 'Form 4', fr: 'Form 4' }, educationLevel: 'Secondary School' },
    { id: 'form5', label: { en: 'Form 5', fr: 'Form 5' }, educationLevel: 'Secondary School' },
    { id: 'l6', label: { en: 'Lower Sixth', fr: 'Lower Sixth' }, educationLevel: 'High School' },
    { id: 'u6', label: { en: 'Upper Sixth', fr: 'Upper Sixth' }, educationLevel: 'High School' },
    { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
  ],
  exams: [
    { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
    { id: 'ce', label: { en: 'Common Entrance', fr: 'Common Entrance' } },
    { id: 'gce-o', label: { en: 'GCE O-Level', fr: 'GCE O-Level' } },
    { id: 'gce-a', label: { en: 'GCE A-Level', fr: 'GCE A-Level' } },
    { id: 'concours', label: { en: 'Concours', fr: 'Concours' } },
  ],
  subjects: CM_EN_SUBJECTS,
}

export const REGION_PACKS: RegionPack[] = [
  {
    id: 'cm',
    countryCode: 'CM',
    label: { en: 'Cameroon', fr: 'Cameroun' },
    cities: [
      { id: 'yaounde', label: { en: 'Yaoundé', fr: 'Yaoundé' } },
      { id: 'douala', label: { en: 'Douala', fr: 'Douala' } },
      { id: 'bamenda', label: { en: 'Bamenda', fr: 'Bamenda' } },
      { id: 'bafoussam', label: { en: 'Bafoussam', fr: 'Bafoussam' } },
      { id: 'buea', label: { en: 'Buea', fr: 'Buea' } },
      { id: 'garoua', label: { en: 'Garoua', fr: 'Garoua' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [CAMEROON_FRANCOPHONE, CAMEROON_ANGLOPHONE],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Home region: Cameroon. Two official school worlds — Francophone (6ème–Terminale, BEPC, Probatoire, Bac) and Anglophone (Form 1–Upper Sixth, GCE O/A). Cities people name: Yaoundé, Douala, Bamenda, Bafoussam, Buea. French and English mix in the same family. High-stakes written exams matter; do not assume US grades, SAT, or AP. Use local examples (FCFA, motorbike-taxi, plantains, rainy season) only when they help. Both learner and parent signups are the student in this thread.',
  },
  {
    id: 'ng',
    countryCode: 'NG',
    label: { en: 'Nigeria', fr: 'Nigeria' },
    cities: [
      { id: 'lagos', label: { en: 'Lagos', fr: 'Lagos' } },
      { id: 'abuja', label: { en: 'Abuja', fr: 'Abuja' } },
      { id: 'ph', label: { en: 'Port Harcourt', fr: 'Port Harcourt' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [
      {
        id: 'ng-waec',
        label: { en: 'WAEC / NECO / JAMB', fr: 'WAEC / NECO / JAMB' },
        levels: [
          { id: 'jss1', label: { en: 'JSS 1', fr: 'JSS 1' }, educationLevel: 'Secondary School' },
          { id: 'jss2', label: { en: 'JSS 2', fr: 'JSS 2' }, educationLevel: 'Secondary School' },
          { id: 'jss3', label: { en: 'JSS 3', fr: 'JSS 3' }, educationLevel: 'Secondary School' },
          { id: 'ss1', label: { en: 'SS 1', fr: 'SS 1' }, educationLevel: 'High School' },
          { id: 'ss2', label: { en: 'SS 2', fr: 'SS 2' }, educationLevel: 'High School' },
          { id: 'ss3', label: { en: 'SS 3', fr: 'SS 3' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'bece', label: { en: 'BECE', fr: 'BECE' } },
          { id: 'waec', label: { en: 'WAEC', fr: 'WAEC' } },
          { id: 'neco', label: { en: 'NECO', fr: 'NECO' } },
          { id: 'jamb', label: { en: 'JAMB / UTME', fr: 'JAMB / UTME' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: Nigeria. Speak SS1–SS3, JSS, WAEC, NECO, JAMB — not SAT unless they ask. Naira, Lagos/Abuja life, and bilingual English/Pidgin are normal. The speaker is the student.',
  },
  {
    id: 'gh',
    countryCode: 'GH',
    label: { en: 'Ghana', fr: 'Ghana' },
    cities: [
      { id: 'accra', label: { en: 'Accra', fr: 'Accra' } },
      { id: 'kumasi', label: { en: 'Kumasi', fr: 'Kumasi' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [
      {
        id: 'gh-wassce',
        label: { en: 'BECE / WASSCE', fr: 'BECE / WASSCE' },
        levels: [
          { id: 'jhs1', label: { en: 'JHS 1', fr: 'JHS 1' }, educationLevel: 'Secondary School' },
          { id: 'jhs3', label: { en: 'JHS 3', fr: 'JHS 3' }, educationLevel: 'Secondary School' },
          { id: 'shs1', label: { en: 'SHS 1', fr: 'SHS 1' }, educationLevel: 'High School' },
          { id: 'shs2', label: { en: 'SHS 2', fr: 'SHS 2' }, educationLevel: 'High School' },
          { id: 'shs3', label: { en: 'SHS 3', fr: 'SHS 3' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'bece', label: { en: 'BECE', fr: 'BECE' } },
          { id: 'wassce', label: { en: 'WASSCE', fr: 'WASSCE' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: Ghana. JHS/SHS, BECE, WASSCE. Do not default to US grades. The speaker is the student.',
  },
  {
    id: 'ke',
    countryCode: 'KE',
    label: { en: 'Kenya', fr: 'Kenya' },
    cities: [
      { id: 'nairobi', label: { en: 'Nairobi', fr: 'Nairobi' } },
      { id: 'mombasa', label: { en: 'Mombasa', fr: 'Mombasa' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [
      {
        id: 'ke-cbc',
        label: { en: 'CBC / KCSE', fr: 'CBC / KCSE' },
        levels: [
          { id: 'g7', label: { en: 'Grade 7', fr: 'Grade 7' }, educationLevel: 'Secondary School' },
          { id: 'g9', label: { en: 'Grade 9', fr: 'Grade 9' }, educationLevel: 'Secondary School' },
          { id: 'g10', label: { en: 'Grade 10', fr: 'Grade 10' }, educationLevel: 'High School' },
          { id: 'g12', label: { en: 'Grade 12', fr: 'Grade 12' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'kpsea', label: { en: 'KPSEA', fr: 'KPSEA' } },
          { id: 'kcse', label: { en: 'KCSE', fr: 'KCSE' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: Kenya. CBC grades and KCSE. The speaker is the student.',
  },
  {
    id: 'ci',
    countryCode: 'CI',
    label: { en: 'Côte d’Ivoire', fr: 'Côte d’Ivoire' },
    cities: [
      { id: 'abidjan', label: { en: 'Abidjan', fr: 'Abidjan' } },
      { id: 'yamoussoukro', label: { en: 'Yamoussoukro', fr: 'Yamoussoukro' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [CAMEROON_FRANCOPHONE],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: Côte d’Ivoire. Francophone collège/lycée, BEPC and Bac. Prefer French unless they write in English. The speaker is the student.',
  },
  {
    id: 'za',
    countryCode: 'ZA',
    label: { en: 'South Africa', fr: 'Afrique du Sud' },
    cities: [
      { id: 'jhb', label: { en: 'Johannesburg', fr: 'Johannesburg' } },
      { id: 'cpt', label: { en: 'Cape Town', fr: 'Le Cap' } },
      { id: 'other', label: { en: 'Another city', fr: 'Une autre ville' } },
    ],
    systems: [
      {
        id: 'za-nsc',
        label: { en: 'CAPS / NSC (Matric)', fr: 'CAPS / NSC (Matric)' },
        levels: [
          { id: 'g8', label: { en: 'Grade 8', fr: 'Grade 8' }, educationLevel: 'Secondary School' },
          { id: 'g10', label: { en: 'Grade 10', fr: 'Grade 10' }, educationLevel: 'High School' },
          { id: 'g11', label: { en: 'Grade 11', fr: 'Grade 11' }, educationLevel: 'High School' },
          { id: 'g12', label: { en: 'Grade 12 (Matric)', fr: 'Grade 12 (Matric)' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'nsc', label: { en: 'NSC / Matric', fr: 'NSC / Matric' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: South Africa. CAPS, NSC/Matric. The speaker is the student.',
  },
  {
    id: 'fr',
    countryCode: 'FR',
    label: { en: 'France', fr: 'France' },
    cities: [],
    systems: [
      {
        id: 'fr-bac',
        label: { en: 'Collège / Lycée / Bac', fr: 'Collège / Lycée / Bac' },
        levels: CAMEROON_FRANCOPHONE.levels,
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'brevet', label: { en: 'Brevet', fr: 'Brevet' } },
          { id: 'bac', label: { en: 'Baccalauréat', fr: 'Baccalauréat' } },
        ],
        subjects: CM_FR_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: France. Collège, lycée, Brevet, Bac. Prefer French if they write in French. The speaker is the student.',
  },
  {
    id: 'gb',
    countryCode: 'GB',
    label: { en: 'United Kingdom', fr: 'Royaume-Uni' },
    cities: [],
    systems: [
      {
        id: 'gb-gcse',
        label: { en: 'GCSE / A-Level', fr: 'GCSE / A-Level' },
        levels: [
          { id: 'y7', label: { en: 'Year 7', fr: 'Year 7' }, educationLevel: 'Secondary School' },
          { id: 'y9', label: { en: 'Year 9', fr: 'Year 9' }, educationLevel: 'Secondary School' },
          { id: 'y10', label: { en: 'Year 10', fr: 'Year 10' }, educationLevel: 'Secondary School' },
          { id: 'y11', label: { en: 'Year 11', fr: 'Year 11' }, educationLevel: 'Secondary School' },
          { id: 'y12', label: { en: 'Year 12', fr: 'Year 12' }, educationLevel: 'High School' },
          { id: 'y13', label: { en: 'Year 13', fr: 'Year 13' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'gcse', label: { en: 'GCSE', fr: 'GCSE' } },
          { id: 'alevel', label: { en: 'A-Level', fr: 'A-Level' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: United Kingdom. Years 7–13, GCSE, A-Level. The speaker is the student.',
  },
  {
    id: 'us',
    countryCode: 'US',
    label: { en: 'United States', fr: 'États-Unis' },
    cities: [],
    systems: [
      {
        id: 'us-k12',
        label: { en: 'US grades / SAT / AP', fr: 'Classes US / SAT / AP' },
        levels: [
          { id: 'g6', label: { en: '6th grade', fr: '6e année' }, educationLevel: 'Secondary School' },
          { id: 'g8', label: { en: '8th grade', fr: '8e année' }, educationLevel: 'Secondary School' },
          { id: 'g9', label: { en: '9th grade', fr: '9e année' }, educationLevel: 'High School' },
          { id: 'g10', label: { en: '10th grade', fr: '10e année' }, educationLevel: 'High School' },
          { id: 'g11', label: { en: '11th grade', fr: '11e année' }, educationLevel: 'High School' },
          { id: 'g12', label: { en: '12th grade', fr: '12e année' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'College / university', fr: 'Université' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'sat', label: { en: 'SAT / ACT', fr: 'SAT / ACT' } },
          { id: 'ap', label: { en: 'AP', fr: 'AP' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region: United States. Use US grades only because they chose this pack. SAT/AP if they named them. The speaker is the student.',
  },
  {
    id: 'global',
    countryCode: 'ZZ',
    label: { en: 'Somewhere else', fr: 'Ailleurs' },
    cities: [],
    systems: [
      {
        id: 'global-open',
        label: { en: 'School / university / skills', fr: 'École / université / compétences' },
        levels: [
          { id: 'primary', label: { en: 'Primary', fr: 'Primaire' }, educationLevel: 'Primary School' },
          { id: 'secondary', label: { en: 'Secondary', fr: 'Secondaire' }, educationLevel: 'Secondary School' },
          { id: 'high', label: { en: 'High school', fr: 'Lycée' }, educationLevel: 'High School' },
          { id: 'uni', label: { en: 'University', fr: 'Université' }, educationLevel: 'University' },
          { id: 'skills', label: { en: 'Skills / work', fr: 'Compétences / travail' }, educationLevel: 'University' },
        ],
        exams: [
          { id: 'none', label: { en: 'No exam this year', fr: 'Pas d’examen cette année' } },
          { id: 'other', label: { en: 'A local / other exam', fr: 'Un examen local' } },
        ],
        subjects: CM_EN_SUBJECTS,
      },
    ],
    interests: AFRICA_INTERESTS,
    pedagogyNotes:
      'Region unknown. Ask what school world they are in before assuming Cameroon, UK, or US grades. The speaker is the student.',
  },
]

export const DEFAULT_REGION_ID = 'cm'

export function packById(id?: string | null): RegionPack {
  return REGION_PACKS.find((p) => p.id === id) || REGION_PACKS[0]
}

export function systemById(pack: RegionPack, systemId?: string | null): RegionSystem {
  return pack.systems.find((s) => s.id === systemId) || pack.systems[0]
}

/** First 2 sentences + the anti-US-grade / student-identity lines. */
export function compactPedagogyNotes(full: string): string {
  const sentences = full.split(/(?<=\.)\s+/).filter(Boolean)
  const picked: string[] = []
  for (const sentence of sentences) {
    const keep =
      picked.length < 2 ||
      /do not assume US grades|speaker is the student|Both learner and parent/i.test(
        sentence
      )
    if (keep && !picked.includes(sentence)) picked.push(sentence)
    if (picked.length >= 3) break
  }
  return picked.join(' ')
}

export function compileRegionContext(
  input: {
    countryId?: string | null
    cityId?: string | null
    systemId?: string | null
    levelId?: string | null
    examId?: string | null
    examWhen?: string | null
    subjectId?: string | null
    locale?: string | null
  },
  opts?: { compact?: boolean }
): string {
  const pack = packById(input.countryId)
  const system = systemById(pack, input.systemId)
  const locale = input.locale || 'en'
  const city = pack.cities.find((c) => c.id === input.cityId)
  const level = system.levels.find((l) => l.id === input.levelId)
  const exam = system.exams.find((e) => e.id === input.examId)
  const subject = system.subjects.find((s) => s.id === input.subjectId)
  const notes = opts?.compact
    ? compactPedagogyNotes(pack.pedagogyNotes)
    : pack.pedagogyNotes

  const lines = [
    `REGION PACK: ${t(pack.label, locale)} (${pack.countryCode})`,
    notes,
  ]
  if (city) lines.push(`City: ${t(city.label, locale)}.`)
  lines.push(`School system: ${t(system.label, locale)}.`)
  if (level) lines.push(`Level: ${t(level.label, locale)} (${level.educationLevel}).`)
  if (subject) lines.push(`Focus subject right now: ${t(subject.label, locale)}.`)
  if (exam && exam.id !== 'none') {
    lines.push(`Named exam: ${t(exam.label, locale)}.`)
    if (input.examWhen) lines.push(`Exam timing: ${input.examWhen}.`)
  }
  lines.push(
    'Calibrate examples and difficulty to this school world. Never refuse off-syllabus content. Do not mention the exam unless they brought it up this turn.'
  )
  return lines.join('\n')
}
