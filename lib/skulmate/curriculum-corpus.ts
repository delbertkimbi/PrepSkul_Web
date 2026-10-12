/**
 * Built-in curriculum corpus for RAG when the learner has not uploaded anything.
 * Uploads are optional extra context. Teaching starts from what they study
 * and where they struggle.
 */

export type CorpusHit = {
  id: string
  artifactId: string
  content: string
  conceptId?: string | null
  similarity?: number
}

export type DisplayHint = 'board' | 'image' | 'diagram' | 'timeline' | 'play' | 'conversation'

export type CorpusUnit = {
  id: string
  subjectId: string
  conceptId: string
  title: string
  content: string
  displayHint: DisplayHint
  focusing: { en: string; fr: string }
  check: {
    question: { en: string; fr: string }
    options: { en: string[]; fr: string[] }
    correct: number
  }
  misconception: { en: string; fr: string }
  transfer: { en: string; fr: string }
  imagePrompt: string
}

export const CURRICULUM_CORPUS: CorpusUnit[] = [
  {
    id: 'maths-linear-undo',
    subjectId: 'maths',
    conceptId: 'algebra:linear-undo',
    title: 'Linear equations, inverse operations',
    content:
      'A linear equation like 2x+3=11 is a balance. Isolate x by undoing the constant first, then the coefficient. Do not divide while a term is still added to x. The equals sign lets you do the same operation to both sides.',
    displayHint: 'board',
    focusing: {
      en: 'What are you trying to isolate, before you touch the numbers?',
      fr: 'Qu’est-ce que tu veux isoler, avant de toucher aux nombres ?',
    },
    check: {
      question: {
        en: 'On 2x+3=11, what is the first legal move, and why?',
        fr: 'Sur 2x+3=11, quel premier geste est légal, et pourquoi ?',
      },
      options: {
        en: ['Undo the constant term', 'Divide by the coefficient of x', 'Flip both sides', 'Guess x'],
        fr: ['Enlever le terme constant', 'Diviser par le coefficient de x', 'Inverser les deux côtés', 'Deviner x'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They divide while a term is still added to x',
      fr: 'Ils divisent alors qu’un terme est encore ajouté à x',
    },
    transfer: {
      en: 'New problem, same idea. You have 5x+1=16. What is this asking you to do, without computing?',
      fr: 'Nouveau problème, même idée. Tu as 5x+1=16. Qu’est-ce que ça te demande de faire, sans calculer ?',
    },
    imagePrompt: 'Balance scale with algebra tiles 2x and +3 on the left, 11 on the right. Flat vector, navy and sky, no text.',
  },
  {
    id: 'maths-percent',
    subjectId: 'maths',
    conceptId: 'maths:percent',
    title: 'Percent of a quantity',
    content:
      'A percent is a hundredths comparison. 15% of 80 means 15 hundredths of 80. Find the whole, the part, or the rate. Do not treat percent as the leftover after subtracting.',
    displayHint: 'diagram',
    focusing: {
      en: 'In this percent problem, what is the whole, and what is the part you already know?',
      fr: 'Dans ce problème de pourcentage, quel est le tout, et quelle partie tu connais déjà ?',
    },
    check: {
      question: {
        en: '15% of 80 is asking you to find which of these?',
        fr: '15% de 80 te demande de trouver quoi ?',
      },
      options: {
        en: ['A part of 80', '80 minus 15', '15 plus 80', 'The leftover of 100'],
        fr: ['Une partie de 80', '80 moins 15', '15 plus 80', 'Le reste de 100'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They subtract the percent from the whole',
      fr: 'Ils soustraient le pourcentage du tout',
    },
    transfer: {
      en: 'A jumper costs 12,000 FCFA after a 20% discount. What would you find first, without computing the price?',
      fr: 'Un pull coûte 12 000 FCFA après 20% de réduction. Que chercherais-tu d’abord, sans calculer le prix ?',
    },
    imagePrompt: 'Hundred grid with 15 shaded cells next to a whole bar of 80. Flat vector, navy and sky, no text.',
  },
  {
    id: 'bio-photosynthesis',
    subjectId: 'biology',
    conceptId: 'biology:photosynthesis',
    title: 'Photosynthesis',
    content:
      'Photosynthesis happens in chloroplasts. Light energy splits water. Carbon dioxide and water become glucose and oxygen. Plants do not eat soil as food. Light is the energy source, not the food.',
    displayHint: 'diagram',
    focusing: {
      en: 'Where in the plant does this change of light into stored energy actually happen?',
      fr: 'Où dans la plante ce changement de lumière en énergie stockée se passe-t-il vraiment ?',
    },
    check: {
      question: {
        en: 'Light splits water. Where is that happening?',
        fr: 'La lumière casse l’eau. Où ça se passe ?',
      },
      options: {
        en: ['Chloroplasts', 'Mitochondria', 'The soil', 'The nucleus'],
        fr: ['Chloroplastes', 'Mitochondries', 'Le sol', 'Le noyau'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They think plants eat soil, or that mitochondria do photosynthesis',
      fr: 'Ils croient que la plante mange le sol, ou que les mitochondries font la photosynthèse',
    },
    transfer: {
      en: 'A plant sits in a dark cupboard for a week. What process is starved, and what would you still expect to keep running for a while?',
      fr: 'Une plante reste une semaine dans un placard noir. Quel processus est privé, et lequel peut encore tourner un moment ?',
    },
    imagePrompt: 'Leaf cross-section with one chloroplast highlighted, arrows for light in and oxygen out. Flat vector, navy and sky, no text.',
  },
  {
    id: 'bio-osmosis',
    subjectId: 'biology',
    conceptId: 'biology:osmosis',
    title: 'Osmosis',
    content:
      'Osmosis is water moving across a selectively permeable membrane toward the higher solute. The water moves, not the sugar, in the classic potato or onion experiment. Hypertonic solutions draw water out of cells.',
    displayHint: 'diagram',
    focusing: {
      en: 'What is moving in osmosis, and what is it moving toward?',
      fr: 'Qu’est-ce qui se déplace dans l’osmose, et vers quoi ?',
    },
    check: {
      question: {
        en: 'A potato in strong salt water shrivels because water moved where?',
        fr: 'Une pomme de terre dans l’eau très salée se ride parce que l’eau est allée où ?',
      },
      options: {
        en: ['Out of the potato, toward the salt', 'Salt rushed into the potato', 'The membrane disappeared', 'Heat dried the potato'],
        fr: ['Hors de la pomme de terre, vers le sel', 'Le sel est entré dans la pomme de terre', 'La membrane a disparu', 'La chaleur a séché la pomme de terre'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They think the solute rushes in, not that water leaves',
      fr: 'Ils croient que le soluté entre, pas que l’eau sort',
    },
    transfer: {
      en: 'Why do market women sprinkle water on greens, in terms of water moving, not in terms of looking fresh?',
      fr: 'Pourquoi asperge-t-on les légumes au marché, en termes de mouvement d’eau, pas d’apparence ?',
    },
    imagePrompt: 'Two beakers, potato in fresh water vs salt water, arrows for water direction. Flat vector, navy and sky, no text.',
  },
  {
    id: 'phys-newton',
    subjectId: 'physics',
    conceptId: 'physics:newton1',
    title: 'Forces and Newton 1',
    content:
      'A force is a push or pull. If the net force is zero, velocity stays the same, including remaining at rest. Balanced forces do not mean no forces. Friction is a force along the contact surface, opposite to the attempted slide.',
    displayHint: 'board',
    focusing: {
      en: 'On this object, which forces are acting, and which way does each one point?',
      fr: 'Sur cet objet, quelles forces agissent, et dans quel sens chacune pointe-t-elle ?',
    },
    check: {
      question: {
        en: 'A book rests on a table. What is true?',
        fr: 'Un livre repose sur une table. Qu’est-ce qui est vrai ?',
      },
      options: {
        en: ['Forces are balanced, net force is zero', 'No forces act', 'Only gravity acts', 'The table has no force'],
        fr: ['Les forces sont équilibrées, la résultante est nulle', 'Aucune force n’agit', 'Seule la gravité agit', 'La table n’exerce aucune force'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They think rest means no forces, or that motion needs a continuous push',
      fr: 'Ils croient que le repos veut dire aucune force, ou que le mouvement a besoin d’une poussée continue',
    },
    transfer: {
      en: 'A moto moves at steady speed on a straight road in Douala. What must be true of the net force?',
      fr: 'Une moto avance à vitesse constante sur une route droite à Douala. Que doit-on dire de la résultante ?',
    },
    imagePrompt: 'Free-body diagram of a book on a table, arrows for weight and normal force. Flat vector, navy and sky, no text.',
  },
  {
    id: 'chem-atoms',
    subjectId: 'chemistry',
    conceptId: 'chemistry:atom',
    title: 'Atoms and conservation',
    content:
      'Atoms rearrange in a chemical change. Mass is conserved. A subscript counts atoms in a formula. A coefficient counts whole particles. Burning is a reaction with oxygen, not disappearance.',
    displayHint: 'diagram',
    focusing: {
      en: 'In this change, which particles are the same on both sides, and what only rearranged?',
      fr: 'Dans ce changement, quelles particules restent les mêmes des deux côtés, et qu’est-ce qui s’est seulement réarrangé ?',
    },
    check: {
      question: {
        en: 'When wood burns, the missing mass went where?',
        fr: 'Quand le bois brûle, la masse disparue est allée où ?',
      },
      options: {
        en: ['Into gases that left', 'It was destroyed', 'It became heat only', 'It turned into nothing'],
        fr: ['Dans les gaz qui sont partis', 'Elle a été détruite', 'Elle est devenue seulement de la chaleur', 'Elle s’est transformée en rien'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They think matter is destroyed when they cannot see it',
      fr: 'Ils croient que la matière est détruite quand ils ne la voient plus',
    },
    transfer: {
      en: 'A candle in a closed jar goes out. What ran out, and what stayed in the jar as new particles?',
      fr: 'Une bougie dans un bocal fermé s’éteint. Qu’est-ce qui a manqué, et quelles nouvelles particules restent ?',
    },
    imagePrompt: 'Before and after particle boxes for burning, atoms conserved. Flat vector, navy and sky, no text.',
  },
  {
    id: 'geo-cameroon',
    subjectId: 'geography',
    conceptId: 'geography:cm-climate',
    title: 'Cameroon climates and relief',
    content:
      'Cameroon has equatorial south, tropical centre, and drier north toward the Sahel. Relief includes Mount Cameroon and the Adamawa plateau. Climate is not the same as weather. Rainfall patterns shape crops and settlement.',
    displayHint: 'timeline',
    focusing: {
      en: 'Which part of Cameroon are we talking about, and what would you expect the rainfall to do across a year?',
      fr: 'De quelle partie du Cameroun parle-t-on, et que ferait la pluie sur une année ?',
    },
    check: {
      question: {
        en: 'Why is the Far North drier than Douala?',
        fr: 'Pourquoi l’Extrême-Nord est-il plus sec que Douala ?',
      },
      options: {
        en: ['It sits toward Sahelian climate', 'It is closer to the ocean', 'Mount Cameroon blocks all rain', 'There is no sun'],
        fr: ['Il est vers un climat sahélien', 'Il est plus près de l’océan', 'Le mont Cameroun bloque toute la pluie', 'Il n’y a pas de soleil'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They treat the whole country as one climate',
      fr: 'Ils traitent tout le pays comme un seul climat',
    },
    transfer: {
      en: 'A cocoa farmer near Kumba and a cattle herder near Maroua. What climate difference would you name first?',
      fr: 'Un planteur de cacao près de Kumba et un éleveur près de Maroua. Quelle différence climatique nommerais-tu d’abord ?',
    },
    imagePrompt: 'Simple Cameroon map with wet south and drier north shading, Mount Cameroon mark. Flat vector, navy and sky, no text.',
  },
  {
    id: 'hist-independence',
    subjectId: 'histgeo',
    conceptId: 'history:cm-independence',
    title: 'Cameroon independence path',
    content:
      'French Cameroun became independent in 1960. British Southern Cameroons voted in 1961 to join. Unification is not the same day as independence. Dates are a sequence, not a single event.',
    displayHint: 'timeline',
    focusing: {
      en: 'Independence and reunification are two beats. Which one are you looking at, and what came just before it?',
      fr: 'Indépendance et réunification sont deux temps. Lequel regardes-tu, et qu’est-ce qui vient juste avant ?',
    },
    check: {
      question: {
        en: '1960 and 1961 in Cameroon history mark what?',
        fr: '1960 et 1961 au Cameroun marquent quoi ?',
      },
      options: {
        en: ['Independence, then Southern Cameroons joining', 'One single independence day', 'The start of German rule', 'The Berlin conference'],
        fr: ['L’indépendance, puis le rattachement du Southern Cameroons', 'Un seul jour d’indépendance', 'Le début de la colonisation allemande', 'La conférence de Berlin'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They collapse independence and reunification into one date',
      fr: 'Ils fusionnent indépendance et réunification en une date',
    },
    transfer: {
      en: 'If a question asks why Cameroon is bilingual, which historical step would you reach for first?',
      fr: 'Si une question demande pourquoi le Cameroun est bilingue, quelle étape historique prendrais-tu d’abord ?',
    },
    imagePrompt: 'Timeline with two distinct marks 1960 and 1961, two joining shapes. Flat vector, navy and sky, no text.',
  },
  {
    id: 'eng-paragraph',
    subjectId: 'english',
    conceptId: 'english:paragraph',
    title: 'Paragraph unity',
    content:
      'A paragraph has one controlling idea. Topic sentence, then evidence, then a close. Do not stack unrelated facts. Quotes and examples must serve the claim.',
    displayHint: 'play',
    focusing: {
      en: 'In one sentence, what is this paragraph trying to prove?',
      fr: 'En une phrase, que cherche à prouver ce paragraphe ?',
    },
    check: {
      question: {
        en: 'A strong body paragraph needs which spine?',
        fr: 'Un paragraphe de développement solide a quelle colonne ?',
      },
      options: {
        en: ['One claim, then evidence for that claim', 'As many facts as possible', 'A new topic every sentence', 'Only quotations'],
        fr: ['Une idée, puis des preuves pour cette idée', 'Le plus de faits possible', 'Un nouveau sujet à chaque phrase', 'Seulement des citations'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They dump facts instead of serving one claim',
      fr: 'Ils entassent des faits au lieu de servir une idée',
    },
    transfer: {
      en: 'Take a GCE literature point you care about. What would the topic sentence be, before any quote?',
      fr: 'Prends un point de littérature. Quelle serait la phrase-thèse, avant toute citation ?',
    },
    imagePrompt: 'Three stacked blocks: claim, evidence, close. Flat vector, navy and sky, no text.',
  },
  {
    id: 'fr-accord',
    subjectId: 'french',
    conceptId: 'french:accord',
    title: 'Accord du participe passé',
    content:
      'With être, the past participle agrees with the subject. With avoir, it agrees with a direct object that comes before the verb. Do not agree with the subject after avoir unless that object rule applies.',
    displayHint: 'play',
    focusing: {
      en: 'Is the helper être or avoir, and is there a direct object before the verb?',
      fr: 'L’auxiliaire est-il être ou avoir, et y a-t-il un COD avant le verbe ?',
    },
    check: {
      question: {
        en: 'Les lettres que j’ai écrites. Why écrites?',
        fr: 'Les lettres que j’ai écrites. Pourquoi écrites ?',
      },
      options: {
        en: ['Direct object lettres comes before avoir', 'It agrees with je', 'All past participles take e', 'Écrites is present tense'],
        fr: ['Le COD lettres est avant avoir', 'Il s’accorde avec je', 'Tous les participes prennent e', 'Écrites est au présent'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They always agree with the subject, including after avoir',
      fr: 'Ils accordent toujours avec le sujet, même avec avoir',
    },
    transfer: {
      en: 'Say this in your own words: Elle est partie vs Elle a écrit la lettre. Where does agreement happen, and where does it not?',
      fr: 'Dis-le dans tes mots: Elle est partie vs Elle a écrit la lettre. Où y a-t-il accord, et où non ?',
    },
    imagePrompt: 'Two columns être vs avoir with arrows to subject vs fronted object. Flat vector, navy and sky, no text.',
  },
  {
    id: 'econ-demand',
    subjectId: 'economics',
    conceptId: 'economics:demand',
    title: 'Demand and price',
    content:
      'Demand slopes down: a higher price, a lower quantity demanded, other things equal. A shift of the whole curve is not the same as a movement along it. Income, tastes, and prices of related goods shift demand.',
    displayHint: 'diagram',
    focusing: {
      en: 'Did the price of this good change, or did something else change that would move the whole demand curve?',
      fr: 'Est-ce le prix de ce bien qui a changé, ou autre chose qui déplacerait toute la courbe de demande ?',
    },
    check: {
      question: {
        en: 'The price of bread rises and people buy less bread. That is',
        fr: 'Le prix du pain monte et on en achète moins. C’est',
      },
      options: {
        en: ['A movement along the demand curve', 'A shift of demand to the right', 'Supply disappearing', 'Inflation of taste'],
        fr: ['Un mouvement le long de la courbe de demande', 'Un déplacement de la demande vers la droite', 'La disparition de l’offre', 'Une inflation des goûts'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They mix a movement along the curve with a shift of the curve',
      fr: 'Ils mélangent un mouvement le long de la courbe et un déplacement de la courbe',
    },
    transfer: {
      en: 'GCE week increases demand for photocopies. Is that a shift or a slide along the curve, and why?',
      fr: 'La semaine du GCE augmente la demande de photocopies. Est-ce un déplacement ou un glissement, et pourquoi ?',
    },
    imagePrompt: 'Simple demand curve with an along-curve arrow vs a parallel shift. Flat vector, navy and sky, no text.',
  },
  {
    id: 'cs-variables',
    subjectId: 'cs',
    conceptId: 'cs:variable',
    title: 'Variables and assignment',
    content:
      'A variable names a place that holds a value. Assignment replaces the old value. Printing is not the same as storing. A loop can change the same variable many times.',
    displayHint: 'play',
    focusing: {
      en: 'After this line runs, what is in the box, and what only appeared on the screen?',
      fr: 'Après cette ligne, qu’y a-t-il dans la boîte, et qu’est-ce qui est seulement apparu à l’écran ?',
    },
    check: {
      question: {
        en: 'x = 3 then x = x + 1. What is in x?',
        fr: 'x = 3 puis x = x + 1. Que contient x ?',
      },
      options: {
        en: ['4, the old 3 was replaced', '3 and 4 together', 'x + 1 as text', 'Nothing, print was needed'],
        fr: ['4, l’ancien 3 a été remplacé', '3 et 4 ensemble', 'x + 1 comme texte', 'Rien, il fallait print'],
      },
      correct: 0,
    },
    misconception: {
      en: 'They think assignment stacks values, or that print stores',
      fr: 'Ils croient que l’affectation empile, ou que print stocke',
    },
    transfer: {
      en: 'A moto counter adds 1 for each passenger. What would you store, and when would you print?',
      fr: 'Un compteur de moto ajoute 1 par passager. Que stockerais-tu, et quand afficherais-tu ?',
    },
    imagePrompt: 'A labeled box whose value is overwritten from 3 to 4. Flat vector, navy and sky, no text.',
  },
]

const SUBJECT_ALIASES: Record<string, string[]> = {
  maths: ['maths', 'math', 'mathematics', 'algebra', 'equation'],
  biology: ['biology', 'bio', 'svt', 'life'],
  physics: ['physics', 'phys', 'force', 'newton'],
  chemistry: ['chemistry', 'chem', 'pct'],
  geography: ['geography', 'geo'],
  histgeo: ['histgeo', 'history', 'histoire'],
  english: ['english', 'literature', 'essay'],
  french: ['french', 'français', 'francais'],
  economics: ['economics', 'econ'],
  cs: ['cs', 'computer', 'coding', 'python'],
}

export function normalizeSubjectId(raw?: string | null): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim()
  for (const [id, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if (aliases.some((a) => key === a || key.includes(a))) return id
  }
  return key
}

export function retrieveCurriculum(params: {
  query: string
  subjectId?: string | null
  limit?: number
}): CorpusHit[] {
  const limit = Math.min(params.limit ?? 4, 8)
  const subject = normalizeSubjectId(params.subjectId)
  const scored = CURRICULUM_CORPUS.map((unit) => {
    const subjectBoost = subject && unit.subjectId === subject ? 0.12 : 0
    const score =
      localLexical(params.query, `${unit.title} ${unit.content} ${unit.conceptId}`) + subjectBoost
    return { unit, score }
  })
    .filter((row) => row.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (!scored.length && subject) {
    const fallback = CURRICULUM_CORPUS.filter((u) => u.subjectId === subject).slice(0, limit)
    return fallback.map(unitToChunk)
  }
  return scored.map((row) => unitToChunk(row.unit, row.score))
}

export function unitByConcept(conceptId?: string | null): CorpusUnit | null {
  if (!conceptId) return null
  return CURRICULUM_CORPUS.find((u) => u.conceptId === conceptId || u.id === conceptId) || null
}

export function unitsForSubject(subjectId?: string | null): CorpusUnit[] {
  const subject = normalizeSubjectId(subjectId)
  if (!subject) return CURRICULUM_CORPUS.slice(0, 4)
  return CURRICULUM_CORPUS.filter((u) => u.subjectId === subject)
}

function unitToChunk(unit: CorpusUnit, similarity = 0.7): CorpusHit {
  return {
    id: `curriculum:${unit.id}`,
    artifactId: 'curriculum',
    content: `${unit.title}. ${unit.content}`,
    conceptId: unit.conceptId,
    similarity,
  }
}

export function corpusToChunks(units: CorpusUnit[]): CorpusHit[] {
  return units.map((u) => unitToChunk(u))
}

function localLexical(query: string, content: string): number {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3 && !STOP.has(t))
  if (!terms.length) return 0
  const hay = ` ${content.toLowerCase()} `
  const hits = terms.filter((t) => hay.includes(` ${t} `) || hay.includes(`${t}`)).length
  return hits / terms.length
}

const STOP = new Set([
  'this',
  'that',
  'with',
  'from',
  'have',
  'what',
  'when',
  'where',
  'which',
  'help',
  'need',
  'does',
  'draw',
  'picture',
  'image',
  'cannot',
  'dont',
])
