/**
 * skulMate Game Generation API
 * Converts notes/documents into interactive games (quiz, flashcards, matching, fill-in-the-blank)
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractFile } from '@/lib/skulmate/extract'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PROCESSING_TIME = 60000 // 60 seconds

/**
 * Download file from Supabase Storage using the signed/public URL
 * This avoids needing service role key - we just fetch the file via HTTP
 */
async function downloadFileFromUrl(fileUrl: string): Promise<Buffer> {
  // #region agent log
  const logDebug = (location: string, message: string, data: any) => {
    fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
      }),
    }).catch(() => {});
  };
  
  logDebug('skulmate/generate:downloadFileFromUrl', 'Starting download', {
    fileUrlLength: fileUrl.length,
    fileUrlPrefix: fileUrl.substring(0, 100),
    isSignedUrl: fileUrl.includes('token='),
    isPublicUrl: fileUrl.includes('/public/'),
  });
  // #endregion
  
  console.log(`[skulMate Storage] Downloading file from URL: ${fileUrl.substring(0, 100)}...`)
  
  try {
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Before fetch', {
      url: fileUrl.substring(0, 150),
    });
    // #endregion
    
    const response = await fetch(fileUrl)
    
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Fetch response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });
    // #endregion
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response')
      // #region agent log
      logDebug('skulmate/generate:downloadFileFromUrl', 'Fetch failed', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
      });
      // #endregion
      throw new Error(`Failed to download file: HTTP ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Download succeeded', {
      bufferSize: arrayBuffer.byteLength,
    });
    // #endregion
    
    return Buffer.from(arrayBuffer)
  } catch (error) {
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Download error caught', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 300) : undefined,
    });
    // #endregion
    
    console.error(`[skulMate Storage] Download error:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to download file from URL: ${errorMessage}`)
  }
}

/**
 * Get skulMate OpenRouter API key
 * Falls back to OPENROUTER_API_KEY if SKULMATE_OPENROUTER_API_KEY is not set
 */
function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return key
}

interface GenerateRequest {
  fileUrl?: string
  text?: string
  userId?: string
  childId?: string // For parents creating games for children
  gameType?: 'quiz' | 'flashcards' | 'matching' | 'fill_blank' | 'auto' | 'match3' | 'bubble_pop' | 'word_search' | 'crossword' | 'diagram_label' | 'drag_drop' | 'puzzle_pieces' | 'simulation' | 'mystery' | 'escape_room' // auto = AI decides
}

interface GameItem {
  question?: string
  term?: string // For flashcards
  definition?: string // For flashcards
  options?: string[] // For quiz
  correctAnswer?: number | string // For quiz and fill_blank
  explanation?: string
  leftItem?: string // For matching
  rightItem?: string // For matching
  blankText?: string // For fill_blank
}

interface GameData {
  gameType: string
  title: string
  items: GameItem[]
  metadata: {
    source: string
    generatedAt: string
    difficulty: 'easy' | 'medium' | 'hard'
    totalItems: number
  }
}

/**
 * Generate game content using AI
 * Uses model fallback chain - tries cheaper models first
 */
async function generateGameContent(
  text: string,
  gameType: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  topic?: string,
  numQuestions?: number
): Promise<GameData> {
  const systemPrompt = `You are a creative educational game designer. Transform learning content into FUN, engaging, and interactive games that make learning addictive and enjoyable.

CRITICAL RULES - READ CAREFULLY:
1. You MUST use ONLY the content provided by the user - do NOT generate generic or made-up content
2. All questions, terms, definitions, and answers MUST be based on the ACTUAL text provided
3. If the content is about a specific topic, your game MUST reflect that exact topic
4. Do NOT create generic questions like "What is X?" if X is not mentioned in the content
5. Extract key concepts, facts, and information directly from the provided text
6. If the content mentions specific examples, use those examples - do NOT make up new ones
7. 🚨🚨🚨 CRITICAL: When the system recommends a game type, you MUST generate that exact type. DO NOT default to quiz. DO NOT generate quiz unless the recommended type is explicitly "quiz". If told to generate 'wordSearch', generate wordSearch with a word search grid. If told 'match3', generate match3 with a match-3 grid. If told 'bubblePop', generate bubble pop with bubbles. DO NOT ignore the recommendation and generate quiz questions instead.
8. QUIZ IS THE LAST RESORT: Only generate quiz if the recommended game type is "quiz". For all other recommendations (wordSearch, match3, bubblePop, crossword, etc.), generate that specific interactive game type.
9. INTERACTIVE GAMES ARE THE GOAL: Students want FUN, engaging games like Candy Crush, not boring quizzes. Make learning addictive and entertaining!

CONTENT ANALYSIS:
Before generating games, analyze the content type:
- **Diagrams** (biology, physics, anatomy): Focus on visual relationships, parts labeling, processes
- **Formulas** (math, physics, chemistry): Create formula-based questions, variable matching, application scenarios
- **Tables** (data, comparisons, classifications): Use matching, categorization, data interpretation
- **Graphs** (charts, trends, relationships): Focus on interpretation, pattern recognition, predictions
- **Text** (notes, definitions, concepts): Standard quiz/flashcard/matching games

Game Types (think beyond traditional quizzes):
- quiz: Interactive multiple choice challenges with 4 options each
- flashcards: Quick-fire term-definition memory games
- matching: Connect-the-dots style pairing games (PERFECT for formulas, tables, diagrams)
- fill_blank: Complete-the-sentence puzzle games (GREAT for formulas and definitions)
- match3: Match-3 puzzle game (like Candy Crush) - Match 3+ items to clear them (GREAT for vocabulary, concepts, visual learning)
- bubblePop: Bubble pop game - Pop bubbles containing terms/concepts (PERFECT for quick-fire learning, term recognition)
- wordSearch: Word search puzzle - Find hidden words in a grid (EXCELLENT for vocabulary, spelling, term recognition)
- crossword: Crossword puzzle - Fill in words based on clues (GREAT for definitions, concepts, relationships)
- diagramLabel: Diagram labeling game - Label parts of a diagram/image (PERFECT for anatomy, biology, technical diagrams)
- dragDrop: Drag and drop game - Drag items to correct drop zones (EXCELLENT for categorization, matching, sorting)
- puzzlePieces: Puzzle assembly game - Assemble puzzle pieces to form complete concepts (GREAT for visual-spatial learning, sequences)

CONTEXTUAL GAME SELECTION:
- Diagrams → diagramLabel (label parts) or dragDrop (categorize components) or matching (parts to labels)
- Formulas → fill_blank (complete formula) or matching (match variables to meanings) or dragDrop (sort formulas)
- Tables → matching (match rows/columns) or dragDrop (categorize data) or wordSearch (find terms)
- Graphs → quiz (interpret trends) or fill_blank (complete analysis) or crossword (define concepts)
- Text with many terms → wordSearch (find vocabulary) or crossword (define concepts) or flashcards (quick review)
- Visual/spatial content → puzzlePieces (assemble concepts) or diagramLabel (label parts)
- Quick-fire learning → bubblePop (pop terms) or match3 (match concepts) or flashcards (rapid review)

🚨 CRITICAL: Game titles must be VERY SHORT (10-15 characters max), directly related to the content topic, and GAMMY (game-like, fun, catchy)!
- Extract the MAIN topic/subject from the content
- Create a short, punchy, game-like title
- Use action words, game terms, or fun descriptors
- Examples: "Math Match", "Bio Blitz", "Word Hunt", "Formula Pop", "Diagram Dash", "History Quest", "Science Sprint", "Grammar Go", "Number Crush", "Cell Chase"
- BAD examples (too long/generic): "Understanding Mathematics", "Biology Study Game", "Learn History"
- GOOD examples: "Math Match", "Bio Blitz", "History Hero", "Formula Fun"
- The title should make players WANT to play - think arcade game names!

Think BIG: Create games that feel like entertainment, not homework. Make learning addictive and fun!`;

  // Analyze content type from text
  const hasFormulas = /[A-Za-z]\s*=\s*[^=]+|\\[a-zA-Z]+|∑|∫|√|π|α|β|γ|θ|Δ/.test(text);
  const hasTables = /\|.*\|.*\|/s.test(text) || /^\s*[A-Z][^|]*\|/m.test(text);
  const hasGraphs = /graph|chart|plot|axis|coordinate|trend|slope|intercept/i.test(text);
  const hasDiagrams = /diagram|figure|illustration|label|component|part|structure|process/i.test(text);
  
  const contentType = hasDiagrams ? 'diagram' :
                     hasFormulas ? 'formula' :
                     hasTables ? 'table' :
                     hasGraphs ? 'graph' : 'text';
  
  // Determine recommended game type for auto mode - prioritize interactive game types
  let recommendedGameType = 'quiz'; // Default fallback
  if (gameType === 'auto') {
    // Smart game type selection based on content - prioritize interactive game types
    if (contentType === 'diagram') {
      // Diagrams work great with interactive labeling or drag-drop
      const diagramOptions = ['diagramLabel', 'dragDrop', 'matching'];
      recommendedGameType = diagramOptions[Math.floor(Math.random() * diagramOptions.length)];
    } else if (contentType === 'formula') {
      recommendedGameType = 'fill_blank'; // Best for formulas
    } else if (contentType === 'table') {
      // Tables can use drag-drop or matching
      recommendedGameType = Math.random() > 0.5 ? 'dragDrop' : 'matching';
    } else if (contentType === 'graph') {
      recommendedGameType = 'quiz'; // Best for interpretation
    } else if (text.length < 500) {
      // Short content - use quick interactive games
      const shortOptions = ['flashcards', 'bubblePop', 'wordSearch'];
      recommendedGameType = shortOptions[Math.floor(Math.random() * shortOptions.length)];
    } else if (text.split('\n').length > 20) {
      // Structured content - use matching or drag-drop
      recommendedGameType = Math.random() > 0.5 ? 'matching' : 'dragDrop';
    } else {
      // For regular text, prioritize interactive game types (NO QUIZ in default options)
      const textOptions = ['flashcards', 'wordSearch', 'crossword', 'match3', 'bubblePop', 'matching', 'fill_blank'];
      recommendedGameType = textOptions[Math.floor(Math.random() * textOptions.length)];
    }
    
    // Check if content has many distinct terms/concepts (good for word search or crossword)
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().match(/\b[a-z]{4,}\b/gi) || []).size;
    if (uniqueWords > 15 && (recommendedGameType === 'quiz' || recommendedGameType === 'flashcards')) {
      // High vocabulary content - prefer word-based games
      const wordGameOptions = ['wordSearch', 'crossword', 'match3'];
      recommendedGameType = wordGameOptions[Math.floor(Math.random() * wordGameOptions.length)];
    }
    
    // Final check: If somehow quiz was selected for auto mode, replace with interactive alternative
    if (gameType === 'auto' && recommendedGameType === 'quiz') {
      const interactiveOptions = ['flashcards', 'wordSearch', 'match3', 'bubblePop', 'matching'];
      recommendedGameType = interactiveOptions[Math.floor(Math.random() * interactiveOptions.length)];
    }
  } else {
    recommendedGameType = gameType;
  }

  const userPrompt = `🚨🚨🚨 YOU MUST GENERATE A ${gameType === 'auto' ? recommendedGameType.toUpperCase() : gameType.toUpperCase()} GAME 🚨🚨🚨

${gameType === 'auto' ? `⚠️ CRITICAL INSTRUCTION: The system has determined that "${recommendedGameType}" is the BEST game type for this content.
DO NOT generate a quiz. DO NOT generate flashcards. DO NOT generate matching.
You MUST generate a "${recommendedGameType}" game.
If you generate any other game type (especially quiz), your response will be REJECTED and you will be asked to regenerate.
The gameType field in your JSON response MUST be exactly "${recommendedGameType}" (not "quiz", not "flashcards", not anything else).` : ''}

Convert the following ${contentType} content into a ${gameType === 'auto' ? `${recommendedGameType} game` : gameType} game.

CRITICAL RULES - MUST FOLLOW:
1. You MUST use ONLY the content below. Do NOT generate generic questions or content that is not in the provided text.
2. All questions, answers, and terms must be based on what the user actually provided.
3. ${gameType === 'auto' ? `🚨🚨🚨 ABSOLUTE REQUIREMENT: The gameType in your JSON response MUST be "${recommendedGameType}". 
   - If you write "quiz", your response will be REJECTED
   - If you write "flashcards", your response will be REJECTED  
   - If you write "matching", your response will be REJECTED
   - You MUST write "${recommendedGameType}" exactly as shown
   - The content type (${contentType}) requires ${recommendedGameType}, NOT quiz
   - Generate ${recommendedGameType} game items, NOT quiz questions` : ''}
4. 🚨 TITLE REQUIREMENT: The game title MUST be VERY SHORT (10-15 characters max), directly related to the main topic in the content, and GAMMY (fun, catchy, game-like). Extract the main subject/topic and create a punchy arcade-style name. Examples: "Math Match", "Bio Blitz", "Word Hunt", "Formula Pop". DO NOT use long descriptive titles like "Understanding Mathematics" or "Biology Study Game".
4. For quiz games: Each question must have 4 REAL, meaningful answer options derived from the actual content.
5. DO NOT use placeholder text like "Option 1", "Option 2", "Option A", "Option B", etc.
6. Each option must be a complete, meaningful statement or answer related to the question and the actual content.
7. The correct answer must be clearly identifiable from the content provided.
8. All options should be plausible but only one should be correct based on the content.

User's Actual Content:
${text}

CONTENT TYPE DETECTED: ${contentType.toUpperCase()}
${gameType === 'auto' ? `RECOMMENDED GAME TYPE: ${recommendedGameType.toUpperCase()} (best suited for ${contentType} content)` : ''}
${difficulty ? `\nDIFFICULTY LEVEL: ${difficulty.toUpperCase()}\n- ${difficulty === 'easy' ? 'Use straightforward questions/concepts with clear, direct answers. Keep language simple and avoid complex terminology.' : difficulty === 'medium' ? 'Use moderately challenging content requiring understanding and application. Include some nuanced questions.' : 'Use complex content requiring deep analysis, critical thinking, and advanced application. Challenge the player with sophisticated questions.'}` : ''}
${topic ? `\nTOPIC/SUBJECT FOCUS: ${topic}\n- CRITICAL: All game content MUST focus on this specific topic: ${topic}\n- Ensure all questions/terms/concepts relate directly to ${topic}\n- If the content doesn't relate to ${topic}, adapt it to focus on ${topic} while staying true to the source material` : ''}
${numQuestions ? `\nNUMBER OF ITEMS REQUIRED: ${numQuestions}\n- Generate exactly ${numQuestions} questions/items (or as close as possible given the content)\n- Do not generate fewer than ${Math.max(5, numQuestions - 2)} or more than ${numQuestions + 2} items` : ''}

${contentType === 'diagram' ? 'DIAGRAM ANALYSIS:\n- Identify all labeled parts, components, or structures\n- Note relationships between elements\n- Focus on visual-spatial learning\n- BEST GAME TYPES: diagramLabel (label parts), dragDrop (categorize components), matching (parts to labels)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'formula' ? 'FORMULA ANALYSIS:\n- Extract all formulas and equations\n- Identify variables and their meanings\n- Note formula applications and contexts\n- BEST GAME TYPES: fill_blank (complete formulas), matching (match variables to meanings), dragDrop (sort formulas)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'table' ? 'TABLE ANALYSIS:\n- Extract all data rows and columns\n- Identify relationships and patterns\n- Note categories and classifications\n- BEST GAME TYPES: matching (match related entries), dragDrop (categorize data), wordSearch (find terms)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'graph' ? 'GRAPH ANALYSIS:\n- Identify trends, patterns, and relationships\n- Note key data points and interpretations\n- Focus on analytical thinking\n- BEST GAME TYPES: quiz (interpret trends), fill_blank (complete analysis), crossword (define concepts)' : ''}
${contentType === 'text' && gameType === 'auto' ? 'TEXT ANALYSIS:\n- For short text (< 500 chars): Use flashcards, bubblePop, or wordSearch\n- For structured text (many lines): Use matching or dragDrop\n- For narrative/explanatory text: Use crossword, wordSearch, or match3 (NOT quiz)\n- For vocabulary-heavy content: Use wordSearch, crossword, or match3\n- DO NOT use quiz - prioritize interactive games like wordSearch, match3, bubblePop, crossword' : ''}

Requirements for ${gameType === 'auto' ? recommendedGameType : gameType} game:
${recommendedGameType === 'quiz' ? `- Generate ${numQuestions || '10-15'} multiple choice questions based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use straightforward questions with clear, direct answers. Keep language simple.' : difficulty === 'medium' ? 'Use moderately challenging questions requiring understanding.' : 'Use complex questions requiring deep analysis and critical thinking.'}\n` : ''}${topic ? `- Topic Focus: All questions MUST relate to ${topic}\n` : ''}\n- Each question must have 4 REAL, meaningful options derived from the actual content\n- DO NOT use placeholder text like "Option 1", "Option 2", etc.\n- Each option must be a plausible answer related to the question and content\n- The correct answer must be clearly identifiable from the content\n- Include correct answer (0-3 index) and brief explanation based on the content\n- For ${contentType}s: Focus on interpretation, identification, or application from the actual ${contentType}' : ''}
${recommendedGameType === 'flashcards' ? `- Generate ${numQuestions || '15-20'} term-definition pairs based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use basic terms with simple definitions.' : difficulty === 'medium' ? 'Use intermediate terms with detailed definitions.' : 'Use advanced terms with comprehensive definitions.'}\n` : ''}${topic ? `- Topic Focus: All terms MUST relate to ${topic}\n` : ''}\n- Terms should be key concepts extracted from the actual content\n- Definitions should be clear and educational, based on the actual content\n- DO NOT make up terms or definitions that are not in the content\n- For ${contentType}s: Include visual/spatial concepts where relevant' : ''}
${recommendedGameType === 'matching' ? `- Generate ${numQuestions || '10-12'} matching pairs based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use obvious relationships.' : difficulty === 'medium' ? 'Use moderately challenging relationships.' : 'Use complex, nuanced relationships.'}\n` : ''}${topic ? `- Topic Focus: All pairs MUST relate to ${topic}\n` : ''}\n- Pairs should be related concepts from the actual content\n- Make it educational and challenging\n- DO NOT create generic pairs - use actual relationships from the content\n- For ${contentType}s: Match parts to labels, variables to meanings, or related data points from the actual ${contentType}' : ''}
${recommendedGameType === 'fill_blank' ? `- Generate ${numQuestions || '10-15'} fill-in-the-blank sentences based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Remove obvious key terms.' : difficulty === 'medium' ? 'Remove moderately important terms.' : 'Remove complex, nuanced terms requiring deep understanding.'}\n` : ''}${topic ? `- Topic Focus: All sentences MUST relate to ${topic}\n` : ''}\n- Remove key terms/concepts from the actual content\n- Provide correct answers that are in the content\n- DO NOT create generic blanks - use actual terms from the content\n- For ${contentType}s: Focus on completing formulas, labels, or key terms from the actual ${contentType}' : ''}
${recommendedGameType === 'match3' ? `- Generate ${numQuestions || '20-30'} items/concepts from the actual content
${topic ? `- Topic Focus: All items MUST relate to ${topic}\n` : ''}\n- Create a grid-based match-3 game where players match 3+ identical items\n- Items should be key terms, concepts, or visual elements from the content\n- Include gridData as a 2D array (8x8 or 10x10) with item identifiers\n- DO NOT create generic items - use actual concepts from the content' : ''}
${recommendedGameType === 'bubblePop' ? `- Generate ${numQuestions || '15-25'} bubbles with terms/concepts from the actual content
${topic ? `- Topic Focus: All bubbles MUST relate to ${topic}\n` : ''}\n- Each bubble should contain a key term or concept from the content\n- Include target words that players need to pop\n- Create bubbles array with text, position, and target information\n- DO NOT create generic terms - use actual vocabulary from the content' : ''}
${recommendedGameType === 'wordSearch' ? `- Extract ${numQuestions || '10-15'} key words/terms from the actual content
${topic ? `- Topic Focus: All words MUST relate to ${topic}\n` : ''}\n- Create a word search grid (12x12 or 15x15) with words hidden\n- Words should be key concepts, terms, or vocabulary from the content\n- Include words array with the terms to find\n- Include gridData as a 2D array showing the word search grid\n- DO NOT create generic words - use actual terms from the content' : ''}
${recommendedGameType === 'crossword' ? `- Generate ${numQuestions || '10-15'} crossword clues based ONLY on the actual content
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use straightforward clues.' : difficulty === 'medium' ? 'Use moderately challenging clues.' : 'Use complex, nuanced clues.'}\n` : ''}${topic ? `- Topic Focus: All clues MUST relate to ${topic}\n` : ''}\n- Each clue should reference a term or concept from the content\n- Include answers that are actual words/terms from the content\n- Create clues array with clue text and answer\n- Include gridData as a 2D array showing the crossword grid layout\n- DO NOT create generic clues - use actual concepts from the content' : ''}
${recommendedGameType === 'diagramLabel' ? `- Identify ${numQuestions || '8-12'} key parts/components from the diagram in the content
${topic ? `- Topic Focus: All labels MUST relate to ${topic}\n` : ''}\n- Create labels for each part based on the actual diagram\n- Include diagramLabels array with label text and position coordinates\n- If imageUrl is available, use it for the diagram\n- DO NOT create generic labels - use actual parts from the diagram' : ''}
${recommendedGameType === 'dragDrop' ? `- Generate ${numQuestions || '8-12'} items to drag and 3-5 drop zones based on the content
${topic ? `- Topic Focus: All items MUST relate to ${topic}\n` : ''}\n- Items should be key concepts, terms, or elements from the content\n- Drop zones should represent categories, groups, or classifications from the content\n- Include dragItems array with item text and correct drop zone\n- Include dropZones array with zone names and positions\n- DO NOT create generic items - use actual concepts from the content' : ''}
${recommendedGameType === 'puzzlePieces' ? `- Break down the content into ${numQuestions || '6-12'} puzzle pieces
${topic ? `- Topic Focus: All pieces MUST relate to ${topic}\n` : ''}\n- Each piece should represent a key concept, step, or element from the content\n- Create puzzlePieces array with piece data and correct positions\n- Pieces should form a complete picture/concept when assembled\n- DO NOT create generic pieces - use actual concepts from the content' : ''}
${recommendedGameType === 'simulation' ? `- Generate a decision-based simulation game based ONLY on the content provided
${topic ? `- Topic Focus: All scenarios MUST relate to ${topic}\n` : ''}\n- Create a role for the learner (e.g., "Public Health Officer", "Business Manager", "Historical Leader")
- Generate ${numQuestions || '3-5'} scenarios where the learner must make decisions
- Each scenario should have:
  * situation: Description of the scenario from the content
  * actions: 3-4 possible actions (each action should use concepts from the notes)
  * consequences: What happens for each action (based on understanding/misunderstanding)
- Wrong understanding → consequences, not instant failure
- Include debrief explanations: "This failed because [deep reason from content]"
- DO NOT create generic scenarios - use actual content and concepts' : ''}
${recommendedGameType === 'mystery' ? `- Generate a mystery/detective game based ONLY on the content provided
${topic ? `- Topic Focus: The mystery MUST relate to ${topic}\n` : ''}\n- Create a case/mystery (e.g., "The Failed Experiment", "The Unreliable Narrator")
- Generate ${numQuestions || '5-8'} clues that reference the notes:
  * noteReference: Which part of the notes this clue comes from
  * reveals: What this clue reveals (must be from the actual content)
- Wrong interpretation = false lead (not instant failure)
- Final solution requires synthesis of all clues
- Include solution: The answer that synthesizes all clues
- DO NOT create generic mysteries - use actual problems/issues from the content' : ''}
${recommendedGameType === 'escape_room' ? `- Generate an escape room game based ONLY on the content provided
${topic ? `- Topic Focus: All rooms MUST relate to ${topic}\n` : ''}\n- Create ${numQuestions || '3-5'} rooms, each locked by a concept from the content
- Each room should have:
  * lockedBy: The concept that locks this room (e.g., "Ohm's Law", "Photosynthesis")
  * puzzle: A puzzle that requires applying this concept
    - type: "logic" | "calculation" | "matching" | "sequence"
    - prompt: The puzzle description using actual content
    - solution: The answer based on the content
- Keys = applying knowledge correctly
- Hints come from the notes
- DO NOT create generic puzzles - use actual concepts and relationships from the content' : ''}

${gameType === 'auto' && recommendedGameType !== 'quiz' ? `⚠️ FINAL REMINDER: gameType MUST be "${recommendedGameType}". NOT "quiz". NOT "flashcards". NOT "matching". EXACTLY "${recommendedGameType}".` : ''}

Return ONLY valid JSON in this format:
{
  "gameType": "${recommendedGameType}", // 🚨🚨🚨 MUST be EXACTLY "${recommendedGameType}" - DO NOT write "quiz" here unless "${recommendedGameType}" is "quiz"
  "title": "VERY SHORT game title (10-15 chars max) - extract main topic, make it gammy and fun! Examples: 'Math Match', 'Bio Blitz', 'Word Hunt'",
  "items": [
    ${recommendedGameType === 'quiz' ? '{"question": "Question based on actual content", "options": ["Real option 1 from content", "Real option 2 from content", "Real option 3 from content", "Real option 4 from content"], "correctAnswer": 0, "explanation": "Explanation based on content"}' : ''}
    ${recommendedGameType === 'flashcards' ? '{"term": "Term from actual content", "definition": "Definition from actual content"}' : ''}
    ${recommendedGameType === 'matching' ? '{"leftItem": "Item from actual content", "rightItem": "Matching item from actual content"}' : ''}
    ${recommendedGameType === 'fill_blank' ? '{"blankText": "Sentence with blank from actual content", "correctAnswer": "Answer from actual content"}' : ''}
    ${recommendedGameType === 'match3' ? '{"gridData": [["item1", "item2", ...], ...], "items": ["item1", "item2", ...]}' : ''}
    ${recommendedGameType === 'bubblePop' ? '{"bubbles": [{"text": "Term from content", "x": 100, "y": 200, "isTarget": true}, ...], "words": ["Term1", "Term2", ...]}' : ''}
    ${recommendedGameType === 'wordSearch' ? '{"gridData": [["A", "B", ...], ...], "words": ["Term1", "Term2", ...]}' : ''}
    ${recommendedGameType === 'crossword' ? '{"gridData": [["A", "B", ...], ...], "clues": [{"clue": "Clue from content", "answer": "Answer from content", "x": 0, "y": 0}, ...]}' : ''}
    ${recommendedGameType === 'diagramLabel' ? '{"imageUrl": "url if available", "diagramLabels": [{"label": "Part name from content", "x": 100, "y": 200}, ...]}' : ''}
    ${recommendedGameType === 'dragDrop' ? '{"dragItems": [{"text": "Item from content", "correctZone": "zone1"}, ...], "dropZones": [{"name": "Zone from content", "x": 100, "y": 200}, ...]}' : ''}
    ${recommendedGameType === 'puzzlePieces' ? '{"puzzlePieces": [{"id": "piece1", "text": "Concept from content", "correctX": 100, "correctY": 200, "imageUrl": "url if available"}, ...]}' : ''}
    ${recommendedGameType === 'simulation' ? '{"role": "Role from content", "scenarios": [{"situation": "Scenario from content", "actions": ["Action 1", "Action 2", ...], "consequences": {"Action 1": "Consequence based on content", ...}}, ...]}' : ''}
    ${recommendedGameType === 'mystery' ? '{"case": "Case name from content", "clues": [{"noteReference": "Reference to notes", "reveals": "What this reveals"}, ...], "solution": "Solution synthesizing all clues"}' : ''}
    ${recommendedGameType === 'escape_room' ? '{"rooms": [{"lockedBy": "Concept from content", "puzzle": {"type": "logic", "prompt": "Puzzle from content", "solution": "Solution from content"}}, ...]}' : ''}
  ],
  "metadata": {
    "difficulty": "${difficulty}",
    "totalItems": ${numQuestions || 'number of items generated'},
    ${topic ? `"topic": "${topic}",` : ''}
    "source": "document|image|text"
  }
}`;

  // Try multiple models - prioritize free/cheap models first
  const gameModels = [
    'qwen/qwen-2-7b-instruct',      // Free/cheap
    'qwen/qwen-2-14b-instruct',     // Slightly more expensive
    'meta-llama/llama-3.2-3b-instruct', // Free tier
    'mistralai/mistral-7b-instruct', // Cheap
    'google/gemini-flash-1.5',       // Google model
    'openai/gpt-4o-mini',            // OpenAI (fallback)
  ]

  const skulMateApiKey = getSkulMateApiKey()
  let response
  let lastError: Error | null = null

  for (const model of gameModels) {
    try {
      console.log(`[skulMate] Trying model: ${model}`)
      response = await callOpenRouterWithKey(skulMateApiKey, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }, // Request JSON format
      })
      console.log(`[skulMate] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[skulMate] Model ${model} failed:`, lastError.message)
      
      // If it's a credits error, stop trying (all will fail)
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        throw new Error('OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits')
      }
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to generate game. All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from AI')
  }

  const content = response.choices[0].message?.content || ''
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  let gameData: GameData
  try {
    gameData = JSON.parse(jsonContent)
  } catch (parseError) {
    console.error('[skulMate] JSON parse error:', parseError)
    console.error('[skulMate] Raw content:', jsonContent.substring(0, 500))
    throw new Error(`Failed to parse game data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`)
  }
  
  // Validate game data
  if (!gameData.gameType || !gameData.items || gameData.items.length === 0) {
    throw new Error('Invalid game data structure')
  }

  // Check if items have quiz structure when they shouldn't
  const hasQuizItems = gameData.items && gameData.items.length > 0 && 
    gameData.items.some((item: any) => item.question && Array.isArray(item.options))

  // Log and validate game type
  console.log(`[skulMate] Generated game type: ${gameData.gameType} (requested: ${gameType}, recommended: ${gameType === 'auto' ? recommendedGameType : 'N/A'}), hasQuizItems: ${hasQuizItems}`)
  
  // If auto mode was requested, validate and retry if quiz was incorrectly generated
  if (gameType === 'auto' && (gameData.gameType === 'quiz' || hasQuizItems) && recommendedGameType !== 'quiz') {
    console.error(`[skulMate] ❌ CRITICAL ERROR: AI generated quiz (type: ${gameData.gameType}, hasQuizItems: ${hasQuizItems}) when it should have generated ${recommendedGameType}. This violates the prompt.`)
    console.error(`[skulMate] 🔄 Retrying generation with stronger prompt...`)
    
    // Get concrete example for retry
    let concreteExample = ''
    if (recommendedGameType === 'word_search') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "word_search",\n  "title": "Word Hunt",\n  "items": [{\n    "gridData": [["M","A","T","H"], ["P","H","Y","S"]],\n    "words": ["MATH", "PHYSICS"]\n  }]\n}\nDO NOT use quiz structure with "question" and "options".`
    } else if (recommendedGameType === 'match3') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "match3",\n  "title": "Match Crush",\n  "items": [{\n    "gridData": [["t1","t2","t1"], ["t2","t1","t3"]],\n    "items": ["t1", "t2", "t3"]\n  }]\n}\nDO NOT use quiz structure.`
    } else if (recommendedGameType === 'bubble_pop') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "bubble_pop",\n  "title": "Bubble Pop",\n  "items": [{\n    "bubbles": [{"text": "Term1", "x": 100, "y": 200, "isTarget": true}],\n    "words": ["Term1"]\n  }]\n}\nDO NOT use quiz structure.`
    } else if (recommendedGameType === 'crossword') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "crossword",\n  "title": "Cross Puzzle",\n  "items": [{\n    "gridData": [["A","B"], ["C","D"]],\n    "clues": [{"clue": "Clue from content", "answer": "ANSWER", "x": 0, "y": 0}]\n  }]\n}\nDO NOT use quiz structure.`
    }
    
    // Retry with an even stronger prompt
    const retryPrompt = `${userPrompt}

🚨🚨🚨 RETRY REQUEST - PREVIOUS ATTEMPT FAILED 🚨🚨🚨
The previous response incorrectly generated a "quiz" game type with quiz items (question/options structure).
You MUST generate a "${recommendedGameType}" game type with ${recommendedGameType} items.
DO NOT generate quiz items like {"question": "...", "options": [...]}.
Generate ${recommendedGameType} items with the correct structure for ${recommendedGameType} games.
${concreteExample}
If you generate quiz again, your response will be rejected.`

    try {
      // Retry with first model
      const retryResponse = await callOpenRouterWithKey(skulMateApiKey, {
        model: gameModels[0],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: retryPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      if (retryResponse.choices && retryResponse.choices.length > 0) {
        const retryContent = retryResponse.choices[0].message?.content || ''
        let retryJsonContent = retryContent.trim()
        if (retryJsonContent.startsWith('```')) {
          retryJsonContent = retryJsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        }
        if (retryJsonContent.startsWith('```')) {
          retryJsonContent = retryJsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
        }

        const retryGameData: GameData = JSON.parse(retryJsonContent)
        
        if (retryGameData.gameType === recommendedGameType) {
          console.log(`[skulMate] ✅ Retry successful! Generated ${retryGameData.gameType} as expected.`)
          gameData = retryGameData
        } else if (retryGameData.gameType === 'quiz') {
          console.error(`[skulMate] ❌ Retry also generated quiz. Forcing type to ${recommendedGameType}.`)
          retryGameData.gameType = recommendedGameType
          gameData = retryGameData
        } else {
          console.warn(`[skulMate] ⚠️ Retry generated ${retryGameData.gameType} instead of ${recommendedGameType}. Using retry result.`)
          gameData = retryGameData
        }
      }
    } catch (retryError) {
      console.error(`[skulMate] Retry failed:`, retryError)
      // Don't fall through - throw the error so the caller knows it failed
      throw retryError
    }
  }
  
  // Validate items structure matches gameType - reject if quiz items detected
  if (gameType === 'auto' && recommendedGameType !== 'quiz') {
    const finalHasQuizItems = gameData.items && gameData.items.some((item: any) => item.question && Array.isArray(item.options))
    if (finalHasQuizItems) {
      console.error(`[skulMate] ❌ CRITICAL: Items have quiz structure (question/options) but gameType should be ${recommendedGameType}. Rejecting.`)
      throw new Error(`Generated items have quiz structure but gameType should be ${recommendedGameType}. The AI did not follow the prompt correctly.`)
    }
  }
  
  // If auto mode was requested, ensure game type matches recommendation
  if (gameType === 'auto' && gameData.gameType !== recommendedGameType) {
    console.warn(`[skulMate] ⚠️ Game type mismatch: Generated "${gameData.gameType}" but recommended "${recommendedGameType}". FORCING to recommended type.`)
    gameData.gameType = recommendedGameType
  }
  
  // Final safety check: If somehow quiz slipped through, replace it
  if (gameType === 'auto' && gameData.gameType === 'quiz' && recommendedGameType !== 'quiz') {
    console.error(`[skulMate] ❌ Final safety check: Quiz detected when it shouldn't be. Replacing with ${recommendedGameType}`)
    gameData.gameType = recommendedGameType
  }
  
  // Ensure game type is valid
  const validGameTypes = ['quiz', 'flashcards', 'matching', 'fill_blank', 'match3', 'bubble_pop', 'word_search', 'crossword', 'diagram_label', 'drag_drop', 'puzzle_pieces', 'simulation', 'mystery', 'escape_room']
  if (!validGameTypes.includes(gameData.gameType)) {
    console.warn(`[skulMate] Invalid game type "${gameData.gameType}", defaulting to ${recommendedGameType}`)
    gameData.gameType = recommendedGameType
  }

          // Validate quiz options are not placeholders
          if (gameData.gameType === 'quiz') {
            for (const item of gameData.items) {
              if (item.options && Array.isArray(item.options)) {
                for (const option of item.options) {
                  // Check for placeholder patterns
                  const placeholderPatterns = [
                    /^option\s*\d+$/i,
                    /^option\s*[a-d]$/i,
                    /^choice\s*\d+$/i,
                    /^answer\s*\d+$/i,
                    /^option\s*[1-4]$/i,
                  ]
                  
                  if (placeholderPatterns.some(pattern => pattern.test(option.trim()))) {
                    console.warn(`[skulMate] Detected placeholder option: "${option}". Regenerating with explicit instructions...`)
                    // Regenerate with even more explicit instructions
                    throw new Error('Game contains placeholder options. Please regenerate with real options based on the actual content.')
                  }
                }
              }
            }
          }

  // Ensure title is very short (max 15 characters for AppBar display)
  if (gameData.title && gameData.title.length > 15) {
    gameData.title = gameData.title.substring(0, 12) + '...'
  }

  // Add metadata
  gameData.metadata = {
    ...gameData.metadata,
    source: 'document',
    generatedAt: new Date().toISOString(),
    totalItems: gameData.items.length,
    ...(topic && { topic }),
  }

  return gameData
}

/**
 * POST /api/skulmate/generate
 * Generate game from uploaded file or text input
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // #region agent log
  const logDebug = (location: string, message: string, data: any) => {
    fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
      }),
    }).catch(() => {});
  };
  
  logDebug('skulmate/generate/route.ts:POST', 'API route entry', {
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasSkulMateApiKey: !!process.env.SKULMATE_OPENROUTER_API_KEY,
  });
  // #endregion

  // Handle CORS for Flutter Web
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  console.log('[skulMate] POST request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Referer:', referer || 'none')
  console.log('[skulMate] User-Agent:', request.headers.get('user-agent') || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS: No origin header, allowing all origins')
  }

  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { 
      fileUrl, 
      text, 
      userId, 
      childId, 
      gameType = 'auto',
      difficulty = 'medium',
      topic,
      numQuestions
    } = body

    if (!fileUrl && !text) {
      return NextResponse.json(
        { error: 'Either fileUrl or text is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (text && text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get user session from main Supabase (not Ticha)
    let sessionUserId: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      sessionUserId = user?.id
    } catch (error) {
      console.log('[skulMate] No session found, continuing without user')
    }

    const finalUserId = userId || sessionUserId

    let extractedText = text || ''

    // If fileUrl provided, download and extract text
    if (fileUrl) {
      console.log('[skulMate] Step 1: Downloading file...')
      
      // Extract bucket and file path from Supabase Storage URL
      // Supports both signed URLs: /storage/v1/object/sign/{bucket}/{path}?token=...
      // and public URLs: /storage/v1/object/public/{bucket}/{path}
      let bucket: string
      let filePath: string

      // Try to match signed URL format
      const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+?)(?:\?|$)/)
      if (signedUrlMatch) {
        bucket = signedUrlMatch[1]
        filePath = signedUrlMatch[2]
      } else {
        // Try to match public URL format
        const publicUrlMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+?)(?:\?|$)/)
        if (publicUrlMatch) {
          bucket = publicUrlMatch[1]
          filePath = publicUrlMatch[2]
        } else {
          // Fallback: try old format /uploads/...
          const legacyMatch = fileUrl.match(/\/uploads\/(.+)$/)
          if (legacyMatch) {
            bucket = 'uploads'
            filePath = legacyMatch[1]
          } else {
            return NextResponse.json(
              { error: 'Invalid fileUrl format. Expected Supabase Storage URL.' },
              { status: 400, headers: corsHeaders }
            )
          }
        }
      }

      console.log(`[skulMate] Extracted bucket: ${bucket}, path: ${filePath}`)

      // Download file from Storage using the URL directly (no service role key needed)
      let fileBuffer: Buffer
      let mimeType: string

      try {
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'Before downloadFileFromUrl', {
          fileUrl: fileUrl.substring(0, 100),
          bucket,
          filePath,
        });
        // #endregion
        
        // Download file directly from the signed/public URL (uses main Supabase, not Ticha)
        // This avoids needing service role key - the URL already has access token
        fileBuffer = await downloadFileFromUrl(fileUrl)
        
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'downloadFileFromUrl succeeded', {
          bufferSize: fileBuffer.length,
        });
        // #endregion

        // Determine MIME type from file extension or URL
        const urlLower = fileUrl.toLowerCase()
        if (urlLower.includes('.pdf')) {
          mimeType = 'application/pdf'
        } else if (urlLower.includes('.png')) {
          mimeType = 'image/png'
        } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
          mimeType = 'image/jpeg'
        } else if (urlLower.includes('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } else {
          mimeType = 'application/octet-stream'
        }

        if (fileBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400, headers: corsHeaders }
          )
        }
      } catch (error) {
        console.error('[skulMate] Failed to download file:', error)
        return NextResponse.json(
          { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500, headers: corsHeaders }
        )
      }

      // Extract text from file
      console.log('[skulMate] Step 2: Extracting text...')
      try {
        // Extract using skulMate-specific extraction (uses ONLY main Supabase, not Ticha)
        const extractedContent = await extractFile(fileBuffer, mimeType)
        extractedText = extractedContent.text
        console.log(`[skulMate] Extracted ${extractedText.length} characters using ${extractedContent.method}`)
        
        // CRITICAL: Validate extracted text is meaningful
        if (!extractedText || extractedText.trim().length < 50) {
          console.error('[skulMate] Extracted text is too short or empty')
          return NextResponse.json(
            { error: 'Failed to extract meaningful text from your file. Please ensure the file contains readable text, diagrams, or images with text. If using images, make sure they are clear and contain visible text.' },
            { status: 400, headers: corsHeaders }
          )
        }
        
        // Log first 200 chars for debugging (to verify it's actual content, not generic)
        console.log(`[skulMate] Extracted text preview: ${extractedText.substring(0, 200)}...`)
      } catch (error) {
        console.error('[skulMate] Failed to extract text:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Provide helpful error messages based on error type
        if (errorMessage.includes('Invalid OpenRouter API key') || errorMessage.includes('401')) {
          return NextResponse.json(
            { error: 'Image processing is currently unavailable due to API configuration. Please try uploading a PDF or text file instead, or contact support.' },
            { status: 503, headers: corsHeaders }
          )
        }
        
        if (errorMessage.includes('credits') || errorMessage.includes('402')) {
          return NextResponse.json(
            { error: 'Image processing requires API credits. Please convert your image to PDF or text format, or contact support to enable image processing.' },
            { status: 402, headers: corsHeaders }
          )
        }
        
        return NextResponse.json(
          { error: `Failed to extract text from your file: ${errorMessage}. Please ensure the file is a valid PDF, image, or text file with readable content.` },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Generate game content
    console.log('[skulMate] Step 3: Generating game...')
    const gameData = await generateGameContent(
      extractedText, 
      gameType,
      difficulty,
      topic,
      numQuestions
    )

    // Save to database if userId provided
    let gameId: string | null = null
    if (finalUserId) {
      try {
        const supabase = await createServerSupabaseClient()
        
        // Insert game metadata
        const { data: game, error: gameError } = await supabase
          .from('skulmate_games')
          .insert({
            user_id: finalUserId,
            child_id: childId || null,
            title: gameData.title,
            game_type: gameData.gameType,
            document_url: fileUrl || null,
            source_type: fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'text',
          })
          .select()
          .maybeSingle()

        if (gameError) {
          console.error('[skulMate] Failed to save game:', gameError)
          console.error('[skulMate] Game error details:', JSON.stringify(gameError))
          // Continue without saving to DB - but log the error
        } else if (game && game.id) {
          gameId = game.id
          console.log(`[skulMate] Game saved with ID: ${gameId}`)

          // Insert game data
          const { error: dataError } = await supabase
            .from('skulmate_game_data')
            .insert({
              game_id: gameId,
              game_content: gameData.items,
              metadata: gameData.metadata,
            })

          if (dataError) {
            console.error('[skulMate] Failed to save game data:', dataError)
          } else {
            console.log(`[skulMate] Game data saved successfully for game ${gameId}`)
          }
        } else {
          console.warn('[skulMate] Game saved but no ID returned')
        }
      } catch (error) {
        console.error('[skulMate] Failed to save to database:', error)
        console.error('[skulMate] Error details:', error instanceof Error ? error.stack : String(error))
        // Continue without saving to DB
      }
    } else {
      console.warn('[skulMate] No userId provided - game will not be saved to database')
    }

    const processingTime = Date.now() - startTime
    console.log(`[skulMate] Game generated in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      game: {
        id: gameId,
        ...gameData,
      },
      processingTime,
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('[skulMate] Error:', error)
    
    // Check if it's a credits issue
    if (error.message?.includes('402') || error.message?.includes('credits') || error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        { error: 'OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits to generate games. Minimum $10 recommended for testing.' },
        { status: 402, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate game' },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS /api/skulmate/generate
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const requestedMethod = request.headers.get('access-control-request-method')
  const requestedHeaders = request.headers.get('access-control-request-headers')
  
  console.log('[skulMate] OPTIONS preflight request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Requested method:', requestedMethod || 'none')
  console.log('[skulMate] Requested headers:', requestedHeaders || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS preflight: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS preflight: No origin header, allowing all origins')
  }
  
  console.log('[skulMate] CORS headers:', corsHeaders)
  
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders 
  })
}
  text: string,
  gameType: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  topic?: string,
  numQuestions?: number
): Promise<GameData> {
  const systemPrompt = `You are a creative educational game designer. Transform learning content into FUN, engaging, and interactive games that make learning addictive and enjoyable.

CRITICAL RULES - READ CAREFULLY:
1. You MUST use ONLY the content provided by the user - do NOT generate generic or made-up content
2. All questions, terms, definitions, and answers MUST be based on the ACTUAL text provided
3. If the content is about a specific topic, your game MUST reflect that exact topic
4. Do NOT create generic questions like "What is X?" if X is not mentioned in the content
5. Extract key concepts, facts, and information directly from the provided text
6. If the content mentions specific examples, use those examples - do NOT make up new ones
7. 🚨🚨🚨 CRITICAL: When the system recommends a game type, you MUST generate that exact type. DO NOT default to quiz. DO NOT generate quiz unless the recommended type is explicitly "quiz". If told to generate 'wordSearch', generate wordSearch with a word search grid. If told 'match3', generate match3 with a match-3 grid. If told 'bubblePop', generate bubble pop with bubbles. DO NOT ignore the recommendation and generate quiz questions instead.
8. QUIZ IS THE LAST RESORT: Only generate quiz if the recommended game type is "quiz". For all other recommendations (wordSearch, match3, bubblePop, crossword, etc.), generate that specific interactive game type.
9. INTERACTIVE GAMES ARE THE GOAL: Students want FUN, engaging games like Candy Crush, not boring quizzes. Make learning addictive and entertaining!

CONTENT ANALYSIS:
Before generating games, analyze the content type:
- **Diagrams** (biology, physics, anatomy): Focus on visual relationships, parts labeling, processes
- **Formulas** (math, physics, chemistry): Create formula-based questions, variable matching, application scenarios
- **Tables** (data, comparisons, classifications): Use matching, categorization, data interpretation
- **Graphs** (charts, trends, relationships): Focus on interpretation, pattern recognition, predictions
- **Text** (notes, definitions, concepts): Standard quiz/flashcard/matching games

Game Types (think beyond traditional quizzes):
- quiz: Interactive multiple choice challenges with 4 options each
- flashcards: Quick-fire term-definition memory games
- matching: Connect-the-dots style pairing games (PERFECT for formulas, tables, diagrams)
- fill_blank: Complete-the-sentence puzzle games (GREAT for formulas and definitions)
- match3: Match-3 puzzle game (like Candy Crush) - Match 3+ items to clear them (GREAT for vocabulary, concepts, visual learning)
- bubblePop: Bubble pop game - Pop bubbles containing terms/concepts (PERFECT for quick-fire learning, term recognition)
- wordSearch: Word search puzzle - Find hidden words in a grid (EXCELLENT for vocabulary, spelling, term recognition)
- crossword: Crossword puzzle - Fill in words based on clues (GREAT for definitions, concepts, relationships)
- diagramLabel: Diagram labeling game - Label parts of a diagram/image (PERFECT for anatomy, biology, technical diagrams)
- dragDrop: Drag and drop game - Drag items to correct drop zones (EXCELLENT for categorization, matching, sorting)
- puzzlePieces: Puzzle assembly game - Assemble puzzle pieces to form complete concepts (GREAT for visual-spatial learning, sequences)

CONTEXTUAL GAME SELECTION:
- Diagrams → diagramLabel (label parts) or dragDrop (categorize components) or matching (parts to labels)
- Formulas → fill_blank (complete formula) or matching (match variables to meanings) or dragDrop (sort formulas)
- Tables → matching (match rows/columns) or dragDrop (categorize data) or wordSearch (find terms)
- Graphs → quiz (interpret trends) or fill_blank (complete analysis) or crossword (define concepts)
- Text with many terms → wordSearch (find vocabulary) or crossword (define concepts) or flashcards (quick review)
- Visual/spatial content → puzzlePieces (assemble concepts) or diagramLabel (label parts)
- Quick-fire learning → bubblePop (pop terms) or match3 (match concepts) or flashcards (rapid review)

🚨 CRITICAL: Game titles must be VERY SHORT (10-15 characters max), directly related to the content topic, and GAMMY (game-like, fun, catchy)!
- Extract the MAIN topic/subject from the content
- Create a short, punchy, game-like title
- Use action words, game terms, or fun descriptors
- Examples: "Math Match", "Bio Blitz", "Word Hunt", "Formula Pop", "Diagram Dash", "History Quest", "Science Sprint", "Grammar Go", "Number Crush", "Cell Chase"
- BAD examples (too long/generic): "Understanding Mathematics", "Biology Study Game", "Learn History"
- GOOD examples: "Math Match", "Bio Blitz", "History Hero", "Formula Fun"
- The title should make players WANT to play - think arcade game names!

Think BIG: Create games that feel like entertainment, not homework. Make learning addictive and fun!`;

  // Analyze content type from text
  const hasFormulas = /[A-Za-z]\s*=\s*[^=]+|\\[a-zA-Z]+|∑|∫|√|π|α|β|γ|θ|Δ/.test(text);
  const hasTables = /\|.*\|.*\|/s.test(text) || /^\s*[A-Z][^|]*\|/m.test(text);
  const hasGraphs = /graph|chart|plot|axis|coordinate|trend|slope|intercept/i.test(text);
  const hasDiagrams = /diagram|figure|illustration|label|component|part|structure|process/i.test(text);
  
  const contentType = hasDiagrams ? 'diagram' :
                     hasFormulas ? 'formula' :
                     hasTables ? 'table' :
                     hasGraphs ? 'graph' : 'text';
  
  // Determine recommended game type for auto mode - prioritize interactive game types
  let recommendedGameType = 'quiz'; // Default fallback
  if (gameType === 'auto') {
    // Smart game type selection based on content - prioritize interactive game types
    if (contentType === 'diagram') {
      // Diagrams work great with interactive labeling or drag-drop
      const diagramOptions = ['diagramLabel', 'dragDrop', 'matching'];
      recommendedGameType = diagramOptions[Math.floor(Math.random() * diagramOptions.length)];
    } else if (contentType === 'formula') {
      recommendedGameType = 'fill_blank'; // Best for formulas
    } else if (contentType === 'table') {
      // Tables can use drag-drop or matching
      recommendedGameType = Math.random() > 0.5 ? 'dragDrop' : 'matching';
    } else if (contentType === 'graph') {
      recommendedGameType = 'quiz'; // Best for interpretation
    } else if (text.length < 500) {
      // Short content - use quick interactive games
      const shortOptions = ['flashcards', 'bubblePop', 'wordSearch'];
      recommendedGameType = shortOptions[Math.floor(Math.random() * shortOptions.length)];
    } else if (text.split('\n').length > 20) {
      // Structured content - use matching or drag-drop
      recommendedGameType = Math.random() > 0.5 ? 'matching' : 'dragDrop';
    } else {
      // For regular text, prioritize interactive game types (NO QUIZ in default options)
      const textOptions = ['flashcards', 'wordSearch', 'crossword', 'match3', 'bubblePop', 'matching', 'fill_blank'];
      recommendedGameType = textOptions[Math.floor(Math.random() * textOptions.length)];
    }
    
    // Check if content has many distinct terms/concepts (good for word search or crossword)
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().match(/\b[a-z]{4,}\b/gi) || []).size;
    if (uniqueWords > 15 && (recommendedGameType === 'quiz' || recommendedGameType === 'flashcards')) {
      // High vocabulary content - prefer word-based games
      const wordGameOptions = ['wordSearch', 'crossword', 'match3'];
      recommendedGameType = wordGameOptions[Math.floor(Math.random() * wordGameOptions.length)];
    }
    
    // Final check: If somehow quiz was selected for auto mode, replace with interactive alternative
    if (gameType === 'auto' && recommendedGameType === 'quiz') {
      const interactiveOptions = ['flashcards', 'wordSearch', 'match3', 'bubblePop', 'matching'];
      recommendedGameType = interactiveOptions[Math.floor(Math.random() * interactiveOptions.length)];
    }
  } else {
    recommendedGameType = gameType;
  }

  const userPrompt = `🚨🚨🚨 YOU MUST GENERATE A ${gameType === 'auto' ? recommendedGameType.toUpperCase() : gameType.toUpperCase()} GAME 🚨🚨🚨

${gameType === 'auto' ? `⚠️ CRITICAL INSTRUCTION: The system has determined that "${recommendedGameType}" is the BEST game type for this content.
DO NOT generate a quiz. DO NOT generate flashcards. DO NOT generate matching.
You MUST generate a "${recommendedGameType}" game.
If you generate any other game type (especially quiz), your response will be REJECTED and you will be asked to regenerate.
The gameType field in your JSON response MUST be exactly "${recommendedGameType}" (not "quiz", not "flashcards", not anything else).` : ''}

Convert the following ${contentType} content into a ${gameType === 'auto' ? `${recommendedGameType} game` : gameType} game.

CRITICAL RULES - MUST FOLLOW:
1. You MUST use ONLY the content below. Do NOT generate generic questions or content that is not in the provided text.
2. All questions, answers, and terms must be based on what the user actually provided.
3. ${gameType === 'auto' ? `🚨🚨🚨 ABSOLUTE REQUIREMENT: The gameType in your JSON response MUST be "${recommendedGameType}". 
   - If you write "quiz", your response will be REJECTED
   - If you write "flashcards", your response will be REJECTED  
   - If you write "matching", your response will be REJECTED
   - You MUST write "${recommendedGameType}" exactly as shown
   - The content type (${contentType}) requires ${recommendedGameType}, NOT quiz
   - Generate ${recommendedGameType} game items, NOT quiz questions` : ''}
4. 🚨 TITLE REQUIREMENT: The game title MUST be VERY SHORT (10-15 characters max), directly related to the main topic in the content, and GAMMY (fun, catchy, game-like). Extract the main subject/topic and create a punchy arcade-style name. Examples: "Math Match", "Bio Blitz", "Word Hunt", "Formula Pop". DO NOT use long descriptive titles like "Understanding Mathematics" or "Biology Study Game".
4. For quiz games: Each question must have 4 REAL, meaningful answer options derived from the actual content.
5. DO NOT use placeholder text like "Option 1", "Option 2", "Option A", "Option B", etc.
6. Each option must be a complete, meaningful statement or answer related to the question and the actual content.
7. The correct answer must be clearly identifiable from the content provided.
8. All options should be plausible but only one should be correct based on the content.

User's Actual Content:
${text}

CONTENT TYPE DETECTED: ${contentType.toUpperCase()}
${gameType === 'auto' ? `RECOMMENDED GAME TYPE: ${recommendedGameType.toUpperCase()} (best suited for ${contentType} content)` : ''}
${difficulty ? `\nDIFFICULTY LEVEL: ${difficulty.toUpperCase()}\n- ${difficulty === 'easy' ? 'Use straightforward questions/concepts with clear, direct answers. Keep language simple and avoid complex terminology.' : difficulty === 'medium' ? 'Use moderately challenging content requiring understanding and application. Include some nuanced questions.' : 'Use complex content requiring deep analysis, critical thinking, and advanced application. Challenge the player with sophisticated questions.'}` : ''}
${topic ? `\nTOPIC/SUBJECT FOCUS: ${topic}\n- CRITICAL: All game content MUST focus on this specific topic: ${topic}\n- Ensure all questions/terms/concepts relate directly to ${topic}\n- If the content doesn't relate to ${topic}, adapt it to focus on ${topic} while staying true to the source material` : ''}
${numQuestions ? `\nNUMBER OF ITEMS REQUIRED: ${numQuestions}\n- Generate exactly ${numQuestions} questions/items (or as close as possible given the content)\n- Do not generate fewer than ${Math.max(5, numQuestions - 2)} or more than ${numQuestions + 2} items` : ''}

${contentType === 'diagram' ? 'DIAGRAM ANALYSIS:\n- Identify all labeled parts, components, or structures\n- Note relationships between elements\n- Focus on visual-spatial learning\n- BEST GAME TYPES: diagramLabel (label parts), dragDrop (categorize components), matching (parts to labels)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'formula' ? 'FORMULA ANALYSIS:\n- Extract all formulas and equations\n- Identify variables and their meanings\n- Note formula applications and contexts\n- BEST GAME TYPES: fill_blank (complete formulas), matching (match variables to meanings), dragDrop (sort formulas)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'table' ? 'TABLE ANALYSIS:\n- Extract all data rows and columns\n- Identify relationships and patterns\n- Note categories and classifications\n- BEST GAME TYPES: matching (match related entries), dragDrop (categorize data), wordSearch (find terms)\n- DO NOT use quiz unless specifically requested' : ''}
${contentType === 'graph' ? 'GRAPH ANALYSIS:\n- Identify trends, patterns, and relationships\n- Note key data points and interpretations\n- Focus on analytical thinking\n- BEST GAME TYPES: quiz (interpret trends), fill_blank (complete analysis), crossword (define concepts)' : ''}
${contentType === 'text' && gameType === 'auto' ? 'TEXT ANALYSIS:\n- For short text (< 500 chars): Use flashcards, bubblePop, or wordSearch\n- For structured text (many lines): Use matching or dragDrop\n- For narrative/explanatory text: Use crossword, wordSearch, or match3 (NOT quiz)\n- For vocabulary-heavy content: Use wordSearch, crossword, or match3\n- DO NOT use quiz - prioritize interactive games like wordSearch, match3, bubblePop, crossword' : ''}

Requirements for ${gameType === 'auto' ? recommendedGameType : gameType} game:
${recommendedGameType === 'quiz' ? `- Generate ${numQuestions || '10-15'} multiple choice questions based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use straightforward questions with clear, direct answers. Keep language simple.' : difficulty === 'medium' ? 'Use moderately challenging questions requiring understanding.' : 'Use complex questions requiring deep analysis and critical thinking.'}\n` : ''}${topic ? `- Topic Focus: All questions MUST relate to ${topic}\n` : ''}\n- Each question must have 4 REAL, meaningful options derived from the actual content\n- DO NOT use placeholder text like "Option 1", "Option 2", etc.\n- Each option must be a plausible answer related to the question and content\n- The correct answer must be clearly identifiable from the content\n- Include correct answer (0-3 index) and brief explanation based on the content\n- For ${contentType}s: Focus on interpretation, identification, or application from the actual ${contentType}' : ''}
${recommendedGameType === 'flashcards' ? `- Generate ${numQuestions || '15-20'} term-definition pairs based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use basic terms with simple definitions.' : difficulty === 'medium' ? 'Use intermediate terms with detailed definitions.' : 'Use advanced terms with comprehensive definitions.'}\n` : ''}${topic ? `- Topic Focus: All terms MUST relate to ${topic}\n` : ''}\n- Terms should be key concepts extracted from the actual content\n- Definitions should be clear and educational, based on the actual content\n- DO NOT make up terms or definitions that are not in the content\n- For ${contentType}s: Include visual/spatial concepts where relevant' : ''}
${recommendedGameType === 'matching' ? `- Generate ${numQuestions || '10-12'} matching pairs based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use obvious relationships.' : difficulty === 'medium' ? 'Use moderately challenging relationships.' : 'Use complex, nuanced relationships.'}\n` : ''}${topic ? `- Topic Focus: All pairs MUST relate to ${topic}\n` : ''}\n- Pairs should be related concepts from the actual content\n- Make it educational and challenging\n- DO NOT create generic pairs - use actual relationships from the content\n- For ${contentType}s: Match parts to labels, variables to meanings, or related data points from the actual ${contentType}' : ''}
${recommendedGameType === 'fill_blank' ? `- Generate ${numQuestions || '10-15'} fill-in-the-blank sentences based ONLY on the content provided
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Remove obvious key terms.' : difficulty === 'medium' ? 'Remove moderately important terms.' : 'Remove complex, nuanced terms requiring deep understanding.'}\n` : ''}${topic ? `- Topic Focus: All sentences MUST relate to ${topic}\n` : ''}\n- Remove key terms/concepts from the actual content\n- Provide correct answers that are in the content\n- DO NOT create generic blanks - use actual terms from the content\n- For ${contentType}s: Focus on completing formulas, labels, or key terms from the actual ${contentType}' : ''}
${recommendedGameType === 'match3' ? `- Generate ${numQuestions || '20-30'} items/concepts from the actual content
${topic ? `- Topic Focus: All items MUST relate to ${topic}\n` : ''}\n- Create a grid-based match-3 game where players match 3+ identical items\n- Items should be key terms, concepts, or visual elements from the content\n- Include gridData as a 2D array (8x8 or 10x10) with item identifiers\n- DO NOT create generic items - use actual concepts from the content' : ''}
${recommendedGameType === 'bubblePop' ? `- Generate ${numQuestions || '15-25'} bubbles with terms/concepts from the actual content
${topic ? `- Topic Focus: All bubbles MUST relate to ${topic}\n` : ''}\n- Each bubble should contain a key term or concept from the content\n- Include target words that players need to pop\n- Create bubbles array with text, position, and target information\n- DO NOT create generic terms - use actual vocabulary from the content' : ''}
${recommendedGameType === 'wordSearch' ? `- Extract ${numQuestions || '10-15'} key words/terms from the actual content
${topic ? `- Topic Focus: All words MUST relate to ${topic}\n` : ''}\n- Create a word search grid (12x12 or 15x15) with words hidden\n- Words should be key concepts, terms, or vocabulary from the content\n- Include words array with the terms to find\n- Include gridData as a 2D array showing the word search grid\n- DO NOT create generic words - use actual terms from the content' : ''}
${recommendedGameType === 'crossword' ? `- Generate ${numQuestions || '10-15'} crossword clues based ONLY on the actual content
${difficulty ? `- Difficulty: ${difficulty} - ${difficulty === 'easy' ? 'Use straightforward clues.' : difficulty === 'medium' ? 'Use moderately challenging clues.' : 'Use complex, nuanced clues.'}\n` : ''}${topic ? `- Topic Focus: All clues MUST relate to ${topic}\n` : ''}\n- Each clue should reference a term or concept from the content\n- Include answers that are actual words/terms from the content\n- Create clues array with clue text and answer\n- Include gridData as a 2D array showing the crossword grid layout\n- DO NOT create generic clues - use actual concepts from the content' : ''}
${recommendedGameType === 'diagramLabel' ? `- Identify ${numQuestions || '8-12'} key parts/components from the diagram in the content
${topic ? `- Topic Focus: All labels MUST relate to ${topic}\n` : ''}\n- Create labels for each part based on the actual diagram\n- Include diagramLabels array with label text and position coordinates\n- If imageUrl is available, use it for the diagram\n- DO NOT create generic labels - use actual parts from the diagram' : ''}
${recommendedGameType === 'dragDrop' ? `- Generate ${numQuestions || '8-12'} items to drag and 3-5 drop zones based on the content
${topic ? `- Topic Focus: All items MUST relate to ${topic}\n` : ''}\n- Items should be key concepts, terms, or elements from the content\n- Drop zones should represent categories, groups, or classifications from the content\n- Include dragItems array with item text and correct drop zone\n- Include dropZones array with zone names and positions\n- DO NOT create generic items - use actual concepts from the content' : ''}
${recommendedGameType === 'puzzlePieces' ? `- Break down the content into ${numQuestions || '6-12'} puzzle pieces
${topic ? `- Topic Focus: All pieces MUST relate to ${topic}\n` : ''}\n- Each piece should represent a key concept, step, or element from the content\n- Create puzzlePieces array with piece data and correct positions\n- Pieces should form a complete picture/concept when assembled\n- DO NOT create generic pieces - use actual concepts from the content' : ''}
${recommendedGameType === 'simulation' ? `- Generate a decision-based simulation game based ONLY on the content provided
${topic ? `- Topic Focus: All scenarios MUST relate to ${topic}\n` : ''}\n- Create a role for the learner (e.g., "Public Health Officer", "Business Manager", "Historical Leader")
- Generate ${numQuestions || '3-5'} scenarios where the learner must make decisions
- Each scenario should have:
  * situation: Description of the scenario from the content
  * actions: 3-4 possible actions (each action should use concepts from the notes)
  * consequences: What happens for each action (based on understanding/misunderstanding)
- Wrong understanding → consequences, not instant failure
- Include debrief explanations: "This failed because [deep reason from content]"
- DO NOT create generic scenarios - use actual content and concepts' : ''}
${recommendedGameType === 'mystery' ? `- Generate a mystery/detective game based ONLY on the content provided
${topic ? `- Topic Focus: The mystery MUST relate to ${topic}\n` : ''}\n- Create a case/mystery (e.g., "The Failed Experiment", "The Unreliable Narrator")
- Generate ${numQuestions || '5-8'} clues that reference the notes:
  * noteReference: Which part of the notes this clue comes from
  * reveals: What this clue reveals (must be from the actual content)
- Wrong interpretation = false lead (not instant failure)
- Final solution requires synthesis of all clues
- Include solution: The answer that synthesizes all clues
- DO NOT create generic mysteries - use actual problems/issues from the content' : ''}
${recommendedGameType === 'escape_room' ? `- Generate an escape room game based ONLY on the content provided
${topic ? `- Topic Focus: All rooms MUST relate to ${topic}\n` : ''}\n- Create ${numQuestions || '3-5'} rooms, each locked by a concept from the content
- Each room should have:
  * lockedBy: The concept that locks this room (e.g., "Ohm's Law", "Photosynthesis")
  * puzzle: A puzzle that requires applying this concept
    - type: "logic" | "calculation" | "matching" | "sequence"
    - prompt: The puzzle description using actual content
    - solution: The answer based on the content
- Keys = applying knowledge correctly
- Hints come from the notes
- DO NOT create generic puzzles - use actual concepts and relationships from the content' : ''}

${gameType === 'auto' && recommendedGameType !== 'quiz' ? `⚠️ FINAL REMINDER: gameType MUST be "${recommendedGameType}". NOT "quiz". NOT "flashcards". NOT "matching". EXACTLY "${recommendedGameType}".` : ''}

Return ONLY valid JSON in this format:
{
  "gameType": "${recommendedGameType}", // 🚨🚨🚨 MUST be EXACTLY "${recommendedGameType}" - DO NOT write "quiz" here unless "${recommendedGameType}" is "quiz"
  "title": "VERY SHORT game title (10-15 chars max) - extract main topic, make it gammy and fun! Examples: 'Math Match', 'Bio Blitz', 'Word Hunt'",
  "items": [
    ${recommendedGameType === 'quiz' ? '{"question": "Question based on actual content", "options": ["Real option 1 from content", "Real option 2 from content", "Real option 3 from content", "Real option 4 from content"], "correctAnswer": 0, "explanation": "Explanation based on content"}' : ''}
    ${recommendedGameType === 'flashcards' ? '{"term": "Term from actual content", "definition": "Definition from actual content"}' : ''}
    ${recommendedGameType === 'matching' ? '{"leftItem": "Item from actual content", "rightItem": "Matching item from actual content"}' : ''}
    ${recommendedGameType === 'fill_blank' ? '{"blankText": "Sentence with blank from actual content", "correctAnswer": "Answer from actual content"}' : ''}
    ${recommendedGameType === 'match3' ? '{"gridData": [["item1", "item2", ...], ...], "items": ["item1", "item2", ...]}' : ''}
    ${recommendedGameType === 'bubblePop' ? '{"bubbles": [{"text": "Term from content", "x": 100, "y": 200, "isTarget": true}, ...], "words": ["Term1", "Term2", ...]}' : ''}
    ${recommendedGameType === 'wordSearch' ? '{"gridData": [["A", "B", ...], ...], "words": ["Term1", "Term2", ...]}' : ''}
    ${recommendedGameType === 'crossword' ? '{"gridData": [["A", "B", ...], ...], "clues": [{"clue": "Clue from content", "answer": "Answer from content", "x": 0, "y": 0}, ...]}' : ''}
    ${recommendedGameType === 'diagramLabel' ? '{"imageUrl": "url if available", "diagramLabels": [{"label": "Part name from content", "x": 100, "y": 200}, ...]}' : ''}
    ${recommendedGameType === 'dragDrop' ? '{"dragItems": [{"text": "Item from content", "correctZone": "zone1"}, ...], "dropZones": [{"name": "Zone from content", "x": 100, "y": 200}, ...]}' : ''}
    ${recommendedGameType === 'puzzlePieces' ? '{"puzzlePieces": [{"id": "piece1", "text": "Concept from content", "correctX": 100, "correctY": 200, "imageUrl": "url if available"}, ...]}' : ''}
    ${recommendedGameType === 'simulation' ? '{"role": "Role from content", "scenarios": [{"situation": "Scenario from content", "actions": ["Action 1", "Action 2", ...], "consequences": {"Action 1": "Consequence based on content", ...}}, ...]}' : ''}
    ${recommendedGameType === 'mystery' ? '{"case": "Case name from content", "clues": [{"noteReference": "Reference to notes", "reveals": "What this reveals"}, ...], "solution": "Solution synthesizing all clues"}' : ''}
    ${recommendedGameType === 'escape_room' ? '{"rooms": [{"lockedBy": "Concept from content", "puzzle": {"type": "logic", "prompt": "Puzzle from content", "solution": "Solution from content"}}, ...]}' : ''}
  ],
  "metadata": {
    "difficulty": "${difficulty}",
    "totalItems": ${numQuestions || 'number of items generated'},
    ${topic ? `"topic": "${topic}",` : ''}
    "source": "document|image|text"
  }
}`;

  // Try multiple models - prioritize free/cheap models first
  const gameModels = [
    'qwen/qwen-2-7b-instruct',      // Free/cheap
    'qwen/qwen-2-14b-instruct',     // Slightly more expensive
    'meta-llama/llama-3.2-3b-instruct', // Free tier
    'mistralai/mistral-7b-instruct', // Cheap
    'google/gemini-flash-1.5',       // Google model
    'openai/gpt-4o-mini',            // OpenAI (fallback)
  ]

  const skulMateApiKey = getSkulMateApiKey()
  let response
  let lastError: Error | null = null

  for (const model of gameModels) {
    try {
      console.log(`[skulMate] Trying model: ${model}`)
      response = await callOpenRouterWithKey(skulMateApiKey, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }, // Request JSON format
      })
      console.log(`[skulMate] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[skulMate] Model ${model} failed:`, lastError.message)
      
      // If it's a credits error, stop trying (all will fail)
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        throw new Error('OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits')
      }
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to generate game. All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from AI')
  }

  const content = response.choices[0].message?.content || ''
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  let gameData: GameData
  try {
    gameData = JSON.parse(jsonContent)
  } catch (parseError) {
    console.error('[skulMate] JSON parse error:', parseError)
    console.error('[skulMate] Raw content:', jsonContent.substring(0, 500))
    throw new Error(`Failed to parse game data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`)
  }
  
  // Validate game data
  if (!gameData.gameType || !gameData.items || gameData.items.length === 0) {
    throw new Error('Invalid game data structure')
  }

  // Check if items have quiz structure when they shouldn't
  const hasQuizItems = gameData.items && gameData.items.length > 0 && 
    gameData.items.some((item: any) => item.question && Array.isArray(item.options))

  // Log and validate game type
  console.log(`[skulMate] Generated game type: ${gameData.gameType} (requested: ${gameType}, recommended: ${gameType === 'auto' ? recommendedGameType : 'N/A'}), hasQuizItems: ${hasQuizItems}`)
  
  // If auto mode was requested, validate and retry if quiz was incorrectly generated
  if (gameType === 'auto' && (gameData.gameType === 'quiz' || hasQuizItems) && recommendedGameType !== 'quiz') {
    console.error(`[skulMate] ❌ CRITICAL ERROR: AI generated quiz (type: ${gameData.gameType}, hasQuizItems: ${hasQuizItems}) when it should have generated ${recommendedGameType}. This violates the prompt.`)
    console.error(`[skulMate] 🔄 Retrying generation with stronger prompt...`)
    
    // Get concrete example for retry
    let concreteExample = ''
    if (recommendedGameType === 'word_search') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "word_search",\n  "title": "Word Hunt",\n  "items": [{\n    "gridData": [["M","A","T","H"], ["P","H","Y","S"]],\n    "words": ["MATH", "PHYSICS"]\n  }]\n}\nDO NOT use quiz structure with "question" and "options".`
    } else if (recommendedGameType === 'match3') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "match3",\n  "title": "Match Crush",\n  "items": [{\n    "gridData": [["t1","t2","t1"], ["t2","t1","t3"]],\n    "items": ["t1", "t2", "t3"]\n  }]\n}\nDO NOT use quiz structure.`
    } else if (recommendedGameType === 'bubble_pop') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "bubble_pop",\n  "title": "Bubble Pop",\n  "items": [{\n    "bubbles": [{"text": "Term1", "x": 100, "y": 200, "isTarget": true}],\n    "words": ["Term1"]\n  }]\n}\nDO NOT use quiz structure.`
    } else if (recommendedGameType === 'crossword') {
      concreteExample = `\n\nEXAMPLE - COPY THIS STRUCTURE:\n{\n  "gameType": "crossword",\n  "title": "Cross Puzzle",\n  "items": [{\n    "gridData": [["A","B"], ["C","D"]],\n    "clues": [{"clue": "Clue from content", "answer": "ANSWER", "x": 0, "y": 0}]\n  }]\n}\nDO NOT use quiz structure.`
    }
    
    // Retry with an even stronger prompt
    const retryPrompt = `${userPrompt}

🚨🚨🚨 RETRY REQUEST - PREVIOUS ATTEMPT FAILED 🚨🚨🚨
The previous response incorrectly generated a "quiz" game type with quiz items (question/options structure).
You MUST generate a "${recommendedGameType}" game type with ${recommendedGameType} items.
DO NOT generate quiz items like {"question": "...", "options": [...]}.
Generate ${recommendedGameType} items with the correct structure for ${recommendedGameType} games.
${concreteExample}
If you generate quiz again, your response will be rejected.`

    try {
      // Retry with first model
      const retryResponse = await callOpenRouterWithKey(skulMateApiKey, {
        model: gameModels[0],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: retryPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      if (retryResponse.choices && retryResponse.choices.length > 0) {
        const retryContent = retryResponse.choices[0].message?.content || ''
        let retryJsonContent = retryContent.trim()
        if (retryJsonContent.startsWith('```')) {
          retryJsonContent = retryJsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        }
        if (retryJsonContent.startsWith('```')) {
          retryJsonContent = retryJsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
        }

        const retryGameData: GameData = JSON.parse(retryJsonContent)
        
        if (retryGameData.gameType === recommendedGameType) {
          console.log(`[skulMate] ✅ Retry successful! Generated ${retryGameData.gameType} as expected.`)
          gameData = retryGameData
        } else if (retryGameData.gameType === 'quiz') {
          console.error(`[skulMate] ❌ Retry also generated quiz. Forcing type to ${recommendedGameType}.`)
          retryGameData.gameType = recommendedGameType
          gameData = retryGameData
        } else {
          console.warn(`[skulMate] ⚠️ Retry generated ${retryGameData.gameType} instead of ${recommendedGameType}. Using retry result.`)
          gameData = retryGameData
        }
      }
    } catch (retryError) {
      console.error(`[skulMate] Retry failed:`, retryError)
      // Don't fall through - throw the error so the caller knows it failed
      throw retryError
    }
  }
  
  // Validate items structure matches gameType - reject if quiz items detected
  if (gameType === 'auto' && recommendedGameType !== 'quiz') {
    const finalHasQuizItems = gameData.items && gameData.items.some((item: any) => item.question && Array.isArray(item.options))
    if (finalHasQuizItems) {
      console.error(`[skulMate] ❌ CRITICAL: Items have quiz structure (question/options) but gameType should be ${recommendedGameType}. Rejecting.`)
      throw new Error(`Generated items have quiz structure but gameType should be ${recommendedGameType}. The AI did not follow the prompt correctly.`)
    }
  }
  
  // If auto mode was requested, ensure game type matches recommendation
  if (gameType === 'auto' && gameData.gameType !== recommendedGameType) {
    console.warn(`[skulMate] ⚠️ Game type mismatch: Generated "${gameData.gameType}" but recommended "${recommendedGameType}". FORCING to recommended type.`)
    gameData.gameType = recommendedGameType
  }
  
  // Final safety check: If somehow quiz slipped through, replace it
  if (gameType === 'auto' && gameData.gameType === 'quiz' && recommendedGameType !== 'quiz') {
    console.error(`[skulMate] ❌ Final safety check: Quiz detected when it shouldn't be. Replacing with ${recommendedGameType}`)
    gameData.gameType = recommendedGameType
  }
  
  // Ensure game type is valid
  const validGameTypes = ['quiz', 'flashcards', 'matching', 'fill_blank', 'match3', 'bubble_pop', 'word_search', 'crossword', 'diagram_label', 'drag_drop', 'puzzle_pieces', 'simulation', 'mystery', 'escape_room']
  if (!validGameTypes.includes(gameData.gameType)) {
    console.warn(`[skulMate] Invalid game type "${gameData.gameType}", defaulting to ${recommendedGameType}`)
    gameData.gameType = recommendedGameType
  }

          // Validate quiz options are not placeholders
          if (gameData.gameType === 'quiz') {
            for (const item of gameData.items) {
              if (item.options && Array.isArray(item.options)) {
                for (const option of item.options) {
                  // Check for placeholder patterns
                  const placeholderPatterns = [
                    /^option\s*\d+$/i,
                    /^option\s*[a-d]$/i,
                    /^choice\s*\d+$/i,
                    /^answer\s*\d+$/i,
                    /^option\s*[1-4]$/i,
                  ]
                  
                  if (placeholderPatterns.some(pattern => pattern.test(option.trim()))) {
                    console.warn(`[skulMate] Detected placeholder option: "${option}". Regenerating with explicit instructions...`)
                    // Regenerate with even more explicit instructions
                    throw new Error('Game contains placeholder options. Please regenerate with real options based on the actual content.')
                  }
                }
              }
            }
          }

  // Ensure title is very short (max 15 characters for AppBar display)
  if (gameData.title && gameData.title.length > 15) {
    gameData.title = gameData.title.substring(0, 12) + '...'
  }

  // Add metadata
  gameData.metadata = {
    ...gameData.metadata,
    source: 'document',
    generatedAt: new Date().toISOString(),
    totalItems: gameData.items.length,
    ...(topic && { topic }),
  }

  return gameData
}

/**
 * POST /api/skulmate/generate
 * Generate game from uploaded file or text input
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // #region agent log
  const logDebug = (location: string, message: string, data: any) => {
    fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
      }),
    }).catch(() => {});
  };
  
  logDebug('skulmate/generate/route.ts:POST', 'API route entry', {
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasSkulMateApiKey: !!process.env.SKULMATE_OPENROUTER_API_KEY,
  });
  // #endregion

  // Handle CORS for Flutter Web
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  console.log('[skulMate] POST request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Referer:', referer || 'none')
  console.log('[skulMate] User-Agent:', request.headers.get('user-agent') || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS: No origin header, allowing all origins')
  }

  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { 
      fileUrl, 
      text, 
      userId, 
      childId, 
      gameType = 'auto',
      difficulty = 'medium',
      topic,
      numQuestions
    } = body

    if (!fileUrl && !text) {
      return NextResponse.json(
        { error: 'Either fileUrl or text is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (text && text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get user session from main Supabase (not Ticha)
    let sessionUserId: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      sessionUserId = user?.id
    } catch (error) {
      console.log('[skulMate] No session found, continuing without user')
    }

    const finalUserId = userId || sessionUserId

    let extractedText = text || ''

    // If fileUrl provided, download and extract text
    if (fileUrl) {
      console.log('[skulMate] Step 1: Downloading file...')
      
      // Extract bucket and file path from Supabase Storage URL
      // Supports both signed URLs: /storage/v1/object/sign/{bucket}/{path}?token=...
      // and public URLs: /storage/v1/object/public/{bucket}/{path}
      let bucket: string
      let filePath: string

      // Try to match signed URL format
      const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+?)(?:\?|$)/)
      if (signedUrlMatch) {
        bucket = signedUrlMatch[1]
        filePath = signedUrlMatch[2]
      } else {
        // Try to match public URL format
        const publicUrlMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+?)(?:\?|$)/)
        if (publicUrlMatch) {
          bucket = publicUrlMatch[1]
          filePath = publicUrlMatch[2]
        } else {
          // Fallback: try old format /uploads/...
          const legacyMatch = fileUrl.match(/\/uploads\/(.+)$/)
          if (legacyMatch) {
            bucket = 'uploads'
            filePath = legacyMatch[1]
          } else {
            return NextResponse.json(
              { error: 'Invalid fileUrl format. Expected Supabase Storage URL.' },
              { status: 400, headers: corsHeaders }
            )
          }
        }
      }

      console.log(`[skulMate] Extracted bucket: ${bucket}, path: ${filePath}`)

      // Download file from Storage using the URL directly (no service role key needed)
      let fileBuffer: Buffer
      let mimeType: string

      try {
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'Before downloadFileFromUrl', {
          fileUrl: fileUrl.substring(0, 100),
          bucket,
          filePath,
        });
        // #endregion
        
        // Download file directly from the signed/public URL (uses main Supabase, not Ticha)
        // This avoids needing service role key - the URL already has access token
        fileBuffer = await downloadFileFromUrl(fileUrl)
        
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'downloadFileFromUrl succeeded', {
          bufferSize: fileBuffer.length,
        });
        // #endregion

        // Determine MIME type from file extension or URL
        const urlLower = fileUrl.toLowerCase()
        if (urlLower.includes('.pdf')) {
          mimeType = 'application/pdf'
        } else if (urlLower.includes('.png')) {
          mimeType = 'image/png'
        } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
          mimeType = 'image/jpeg'
        } else if (urlLower.includes('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } else {
          mimeType = 'application/octet-stream'
        }

        if (fileBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400, headers: corsHeaders }
          )
        }
      } catch (error) {
        console.error('[skulMate] Failed to download file:', error)
        return NextResponse.json(
          { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500, headers: corsHeaders }
        )
      }

      // Extract text from file
      console.log('[skulMate] Step 2: Extracting text...')
      try {
        // Extract using skulMate-specific extraction (uses ONLY main Supabase, not Ticha)
        const extractedContent = await extractFile(fileBuffer, mimeType)
        extractedText = extractedContent.text
        console.log(`[skulMate] Extracted ${extractedText.length} characters using ${extractedContent.method}`)
        
        // CRITICAL: Validate extracted text is meaningful
        if (!extractedText || extractedText.trim().length < 50) {
          console.error('[skulMate] Extracted text is too short or empty')
          return NextResponse.json(
            { error: 'Failed to extract meaningful text from your file. Please ensure the file contains readable text, diagrams, or images with text. If using images, make sure they are clear and contain visible text.' },
            { status: 400, headers: corsHeaders }
          )
        }
        
        // Log first 200 chars for debugging (to verify it's actual content, not generic)
        console.log(`[skulMate] Extracted text preview: ${extractedText.substring(0, 200)}...`)
      } catch (error) {
        console.error('[skulMate] Failed to extract text:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Provide helpful error messages based on error type
        if (errorMessage.includes('Invalid OpenRouter API key') || errorMessage.includes('401')) {
          return NextResponse.json(
            { error: 'Image processing is currently unavailable due to API configuration. Please try uploading a PDF or text file instead, or contact support.' },
            { status: 503, headers: corsHeaders }
          )
        }
        
        if (errorMessage.includes('credits') || errorMessage.includes('402')) {
          return NextResponse.json(
            { error: 'Image processing requires API credits. Please convert your image to PDF or text format, or contact support to enable image processing.' },
            { status: 402, headers: corsHeaders }
          )
        }
        
        return NextResponse.json(
          { error: `Failed to extract text from your file: ${errorMessage}. Please ensure the file is a valid PDF, image, or text file with readable content.` },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Generate game content
    console.log('[skulMate] Step 3: Generating game...')
    const gameData = await generateGameContent(
      extractedText, 
      gameType,
      difficulty,
      topic,
      numQuestions
    )

    // Save to database if userId provided
    let gameId: string | null = null
    if (finalUserId) {
      try {
        const supabase = await createServerSupabaseClient()
        
        // Insert game metadata
        const { data: game, error: gameError } = await supabase
          .from('skulmate_games')
          .insert({
            user_id: finalUserId,
            child_id: childId || null,
            title: gameData.title,
            game_type: gameData.gameType,
            document_url: fileUrl || null,
            source_type: fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'text',
          })
          .select()
          .maybeSingle()

        if (gameError) {
          console.error('[skulMate] Failed to save game:', gameError)
          console.error('[skulMate] Game error details:', JSON.stringify(gameError))
          // Continue without saving to DB - but log the error
        } else if (game && game.id) {
          gameId = game.id
          console.log(`[skulMate] Game saved with ID: ${gameId}`)

          // Insert game data
          const { error: dataError } = await supabase
            .from('skulmate_game_data')
            .insert({
              game_id: gameId,
              game_content: gameData.items,
              metadata: gameData.metadata,
            })

          if (dataError) {
            console.error('[skulMate] Failed to save game data:', dataError)
          } else {
            console.log(`[skulMate] Game data saved successfully for game ${gameId}`)
          }
        } else {
          console.warn('[skulMate] Game saved but no ID returned')
        }
      } catch (error) {
        console.error('[skulMate] Failed to save to database:', error)
        console.error('[skulMate] Error details:', error instanceof Error ? error.stack : String(error))
        // Continue without saving to DB
      }
    } else {
      console.warn('[skulMate] No userId provided - game will not be saved to database')
    }

    const processingTime = Date.now() - startTime
    console.log(`[skulMate] Game generated in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      game: {
        id: gameId,
        ...gameData,
      },
      processingTime,
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('[skulMate] Error:', error)
    
    // Check if it's a credits issue
    if (error.message?.includes('402') || error.message?.includes('credits') || error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        { error: 'OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits to generate games. Minimum $10 recommended for testing.' },
        { status: 402, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate game' },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS /api/skulmate/generate
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const requestedMethod = request.headers.get('access-control-request-method')
  const requestedHeaders = request.headers.get('access-control-request-headers')
  
  console.log('[skulMate] OPTIONS preflight request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Requested method:', requestedMethod || 'none')
  console.log('[skulMate] Requested headers:', requestedHeaders || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS preflight: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS preflight: No origin header, allowing all origins')
  }
  
  console.log('[skulMate] CORS headers:', corsHeaders)
  
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders 
  })
}

