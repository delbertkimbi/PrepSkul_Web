/**
 * Message Filter Service
 * 
 * Detects content violations in messages:
 * - Phone numbers
 * - Email addresses
 * - Payment bypass attempts
 * - Social media handles
 * - Inappropriate language
 * - Spam patterns
 */

export interface MessageFlag {
  type: 'phone_number' | 'email' | 'payment_request' | 'social_media' | 
        'external_contact' | 'inappropriate_language' | 'spam' | 'harassment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected: string; // What was detected
  reason: string; // Human-readable reason
}

export interface MessageFilterResult {
  allowed: boolean;
  flags: MessageFlag[];
  willBlock: boolean; // True if message will be blocked
  warnings: string[]; // User-friendly warnings
}

/**
 * Cache entry for filter results
 */
interface CacheEntry {
  result: MessageFilterResult;
  timestamp: number;
}

/**
 * Simple in-memory cache for filter results
 * Key: content hash, Value: filter result with timestamp
 * TTL: 5 minutes (300000ms)
 */
const filterCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Maximum cache entries

/**
 * Generate cache key from content
 */
function getCacheKey(content: string, senderId: string): string {
  // Simple hash function for cache key
  const hash = content.toLowerCase().trim().replace(/\s+/g, ' ');
  return `${senderId}:${hash.substring(0, 100)}`; // Limit key length
}

/**
 * Get cached result if available and not expired
 */
function getCachedResult(key: string): MessageFilterResult | null {
  const entry = filterCache.get(key);
  if (!entry) {
    return null;
  }
  
  // Check if expired
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    filterCache.delete(key);
    return null;
  }
  
  return entry.result;
}

/**
 * Cache filter result
 */
function cacheResult(key: string, result: MessageFilterResult): void {
  // Evict oldest entries if cache is full
  if (filterCache.size >= MAX_CACHE_SIZE) {
    const firstKey = filterCache.keys().next().value;
    if (firstKey) {
      filterCache.delete(firstKey);
    }
  }
  
  filterCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clear expired cache entries (should be called periodically)
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of filterCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      filterCache.delete(key);
    }
  }
}

/**
 * Main filtering function - checks message against all rules
 * Uses caching to improve performance for repeated content
 */
export function filterMessage(
  content: string,
  senderId: string,
  conversationId?: string
): MessageFilterResult {
  // Check cache first
  const cacheKey = getCacheKey(content, senderId);
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }
  
  const flags: MessageFlag[] = [];
  
  // Run all detection checks
  flags.push(...detectPhoneNumbers(content));
  flags.push(...detectEmailAddresses(content));
  flags.push(...detectPaymentRequests(content));
  flags.push(...detectSocialMedia(content));
  flags.push(...detectExternalContact(content));
  flags.push(...detectInappropriateLanguage(content));
  flags.push(...detectSpam(content, senderId));
  
  // Determine if message should be blocked
  const hasCriticalFlag = flags.some(f => f.severity === 'critical');
  const hasHighFlag = flags.some(f => f.severity === 'high');
  const highFlagCount = flags.filter(f => f.severity === 'high').length;
  
  // Block if critical or multiple high-severity flags
  const willBlock = hasCriticalFlag || highFlagCount >= 2;
  const allowed = !willBlock;
  
  // Generate user-friendly warnings
  const warnings = flags.map(flag => flag.reason);
  
  const result: MessageFilterResult = {
    allowed,
    flags,
    willBlock,
    warnings: allowed ? warnings : [], // Only show warnings if allowed
  };
  
  // Cache the result
  cacheResult(cacheKey, result);
  
  return result;
}

/**
 * Interface for phone number scoring results
 */
interface PhoneNumberScore {
  match: string;
  score: number; // 0-100
  factors: {
    hasCountryCode: boolean;
    hasContactContext: boolean;
    hasCalculationContext: boolean;
    messageLength: 'short' | 'medium' | 'long';
    position: 'start' | 'middle' | 'end';
    standalone: boolean;
    inSequence: boolean;
  };
}

/**
 * Detect phone numbers with context-aware scoring (Cameroon + international formats)
 */
function detectPhoneNumbers(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  
  // Step 1: Find potential phone number matches
  const potentialNumbers = findPotentialPhoneNumbers(content);
  if (potentialNumbers.length === 0) {
    return flags;
  }
  
  // Step 2: Analyze each potential number with context
  for (const potential of potentialNumbers) {
    // Fast exit: Check whitelist first (educational context)
    if (isPhoneNumberWhitelisted(content, potential.index)) {
      continue; // Skip - likely calculation/educational
    }
    
    // Step 3: Score the likelihood
    const score = scorePhoneNumberLikelihood(content, potential.match, potential.index);
    
    // Step 4: Decision based on score
    if (score.score >= 60) {
      // High confidence - block
      flags.push({
        type: 'phone_number',
        severity: 'high',
        detected: potential.match,
        reason: 'Phone number detected. Contact information sharing is not allowed. Please communicate through PrepSkul.',
      });
      break; // Only flag once
    } else if (score.score >= 40) {
      // Medium confidence - flag for review (low severity, allows through)
      flags.push({
        type: 'phone_number',
        severity: 'low',
        detected: potential.match,
        reason: 'Possible phone number detected (flagged for review).',
      });
    }
    // Score < 40: Ignore (likely false positive)
  }
  
  return flags;
}

/**
 * Find all potential phone number matches in content
 */
function findPotentialPhoneNumbers(content: string): Array<{match: string, index: number, cleaned: string}> {
  const results: Array<{match: string, index: number, cleaned: string}> = [];
  
  // Cameroon phone number patterns
  const cameroonPatterns = [
    /(\+?237|00237)[\s-]?[6-9][\d\s-]{8,9}/g,
    /\b[6-9][\d\s-]{8,9}\b/g,
  ];
  
  // International phone number patterns
  const internationalPatterns = [
    /\+\d{1,4}[\s-]?\d{1,4}[\s-]?\d{4,14}/g,
    /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g,
  ];
  
  // WhatsApp-specific patterns
  const whatsappPatterns = [
    /whatsapp\s+(?:me\s+)?(?:at|on)?\s*[:\-]?\s*(\+?237|00237)?[\s-]?[6-9][\d\s-]{8,9}/gi,
    /wa\s+(?:me\s+)?(?:at|on)?\s*[:\-]?\s*(\+?237|00237)?[\s-]?[6-9][\d\s-]{8,9}/gi,
  ];
  
  const allPatterns = [...cameroonPatterns, ...internationalPatterns, ...whatsappPatterns];
  
  for (const pattern of allPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const cleaned = match[0].replace(/[\s\-\(\)]/g, '');
      // Basic validation
      if (cleaned.length >= 8 && !/^\d{4}$/.test(cleaned)) {
        results.push({
          match: match[0],
          index: match.index!,
          cleaned: cleaned
        });
      }
    }
  }
  
  return results;
}

/**
 * Check if phone number is in whitelisted educational context
 */
function isPhoneNumberWhitelisted(content: string, numberIndex: number): boolean {
  const contextWindow = content.substring(
    Math.max(0, numberIndex - 100),
    Math.min(content.length, numberIndex + 100)
  ).toLowerCase();
  
  // Educational/calculation context patterns
  const whitelistPatterns = [
    // Calculation results
    /\b(the\s+)?(answer|result|solution|value|calculation|compute)\s+(is|equals?|:)\s*\d+/,
    /\b(problem|question|exercise|equation|formula|solve)\w*\s+\d+/,
    /\b(score|grade|mark|percentage|percent)\s+(of|is|:)?\s*\d+/,
    /\b(step|method|process)\s+\d+/,
    /\b(divided\s+by|multiplied\s+by|plus|minus|times)\s+\d+/,
    // Number sequences (lists)
    /\d+\s*[,\s]+\d+\s*[,\s]+\d+/,
    // Mathematical expressions
    /\d+\s*[+\-*/=]\s*\d+/,
    // Educational examples
    /\b(example|sample|practice|homework|assignment)\w*\s+\d+/,
  ];
  
  return whitelistPatterns.some(pattern => pattern.test(contextWindow));
}

/**
 * Score phone number likelihood based on context (0-100 scale)
 */
function scorePhoneNumberLikelihood(
  content: string,
  match: string,
  index: number
): PhoneNumberScore {
  let score = 0;
  const factors: PhoneNumberScore['factors'] = {
    hasCountryCode: false,
    hasContactContext: false,
    hasCalculationContext: false,
    messageLength: 'medium',
    position: 'middle',
    standalone: false,
    inSequence: false,
  };
  
  const contextBefore = content.substring(Math.max(0, index - 50), index).toLowerCase();
  const contextAfter = content.substring(
    index + match.length,
    Math.min(content.length, index + match.length + 50)
  ).toLowerCase();
  const fullContext = contextBefore + ' ' + contextAfter;
  
  // Factor 1: Country code (+30 points)
  if (/^(\+237|00237|\+\d{1,4})/.test(match)) {
    score += 30;
    factors.hasCountryCode = true;
  }
  
  // Factor 2: Contact sharing phrases (+40 points)
  const contactPhrases = [
    /\b(call|contact|reach|text|message|phone|mobile|whatsapp|telegram)\s+(me\s+)?(at|on|via|using)?\s*\d+/,
    /\b(my|your|his|her|their)\s+(phone|mobile|cell|contact|number)\s+(is|:)?\s*\d+/,
    /\b(share|give|send|provide)\s+(me\s+)?(your|my)?\s*(phone|number|contact)\w*\s*\d+/,
    /\b(here|this|that)\s+(is|'s)?\s*(my|your|the)?\s*(phone|number|contact)\w*:?\s*\d+/,
  ];
  if (contactPhrases.some(p => p.test(fullContext))) {
    score += 40;
    factors.hasContactContext = true;
  }
  
  // Factor 3: Calculation context (-50 points)
  const calcPhrases = [
    /\b(calculate|result|answer|solution|equals?|compute)\w*\s*\d+/,
    /\b(equation|formula|problem|solve|divided|multiplied|plus|minus)\w*\s*\d+/,
    /\b(score|grade|mark|percentage)\s+(of|is|:)?\s*\d+/,
  ];
  if (calcPhrases.some(p => p.test(fullContext))) {
    score -= 50;
    factors.hasCalculationContext = true;
  }
  
  // Factor 4: Message length
  if (content.length < 50) {
    score += 20; // Short = more likely contact
    factors.messageLength = 'short';
  } else if (content.length > 300) {
    score -= 20; // Long = less likely
    factors.messageLength = 'long';
  } else {
    factors.messageLength = 'medium';
  }
  
  // Factor 5: Position in message
  const position = index < content.length * 0.2 ? 'start' :
                   index > content.length * 0.8 ? 'end' : 'middle';
  factors.position = position;
  if (position === 'start' || position === 'end') {
    score += 10;
  } else {
    score -= 10; // Middle = less likely
  }
  
  // Factor 6: Standalone (number on its own line)
  const lines = content.split('\n');
  const numberLine = lines.find(line => line.includes(match));
  if (numberLine && numberLine.trim().length < 30 && /^\s*\d+\s*$/.test(numberLine.trim())) {
    score += 15;
    factors.standalone = true;
  }
  
  // Factor 7: Number in sequence (likely not phone)
  if (/\d+\s*[,\s]+\d+\s*[,\s]+\d+/.test(fullContext)) {
    score -= 30;
    factors.inSequence = true;
  }
  
  return {
    match,
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

/**
 * Detect email addresses with context awareness
 */
function detectEmailAddresses(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  
  // Standard email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches: RegExpMatchArray[] = [];
  let match;
  
  // Collect all matches with indices
  while ((match = emailPattern.exec(content)) !== null) {
    matches.push(match);
  }
  
  if (matches.length === 0) {
    return flags;
  }
  
  // Allowed domains (common email providers)
  const allowedDomains = [
    'prepskul.com',
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'protonmail.com',
    'mail.com',
    'aol.com',
  ];
  
  // Educational/example email patterns (whitelist)
  const educationalPatterns = [
    /\b(example|sample|test|demo|practice)\w*\s*@/i,
    /\b(email\s+address|email\s+format|email\s+example)/i,
    /\b(contact\s+us\s+at|reach\s+us\s+at|email\s+us\s+at)/i,
  ];
  
  for (const emailMatch of matches) {
    const email = emailMatch[0];
    const emailIndex = emailMatch.index!;
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Skip if domain is in allowed list
    if (domain && allowedDomains.includes(domain)) {
      continue;
    }
    
    // Check if email is in educational context
    const contextWindow = content.substring(
      Math.max(0, emailIndex - 50),
      Math.min(content.length, emailIndex + email.length + 50)
    );
    
    const isEducational = educationalPatterns.some(pattern => pattern.test(contextWindow));
    
    if (isEducational) {
      // Educational context - allow through
      continue;
    }
    
    // Check for contact sharing context (strong indicator)
    const contactContext = /\b(call|contact|reach|text|message|email|send)\s+(me\s+)?(at|on|via|using)?\s*@/i.test(contextWindow) ||
                          /\b(my|your|his|her|their)\s+(email|contact)\s+(is|:)?\s*@/i.test(contextWindow);
    
    if (contactContext) {
      // High confidence - block
      flags.push({
        type: 'email',
        severity: 'high',
        detected: email,
        reason: 'Email address detected. Contact information sharing is not allowed. Please communicate through PrepSkul.',
      });
      break; // Only flag once
    } else {
      // Medium confidence - flag for review
      flags.push({
        type: 'email',
        severity: 'medium',
        detected: email,
        reason: 'Possible email address detected (flagged for review).',
      });
    }
  }
  
  return flags;
}

/**
 * Detect payment bypass attempts
 */
function detectPaymentRequests(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  const lowerContent = content.toLowerCase();
  
  // Payment bypass keywords
  const paymentBypassPatterns = [
    /pay\s+(?:me\s+)?(?:directly|outside|offline|cash|in\s+person)/gi,
    /(?:bypass|skip|avoid)\s+payment/gi,
    /(?:pay|send)\s+(?:money|cash|funds)\s+(?:directly|outside|to\s+me)/gi,
    /(?:mobile\s+)?money\s+(?:number|account)/gi,
    /(?:mtn|orange)\s+momo/gi,
    /(?:fapshi|paypal|stripe)\s+(?:account|email|number)/gi,
    /pay\s+(?:me\s+)?(?:via|through)\s+(?:whatsapp|telegram|direct)/gi,
    /(?:send|transfer)\s+(?:money|payment)\s+(?:to|at)/gi,
  ];
  
  // Legitimate payment mentions (allowed context)
  const allowedContexts = [
    'payment through prepskul',
    'prepskul payment',
    'payment system',
    'payment feature',
    'payment via prepskul',
    'prepskul platform',
  ];
  
  const hasAllowedContext = allowedContexts.some(ctx => 
    lowerContent.includes(ctx)
  );
  
  if (!hasAllowedContext) {
    for (const pattern of paymentBypassPatterns) {
      const match = content.match(pattern);
      if (match) {
        flags.push({
          type: 'payment_request',
          severity: 'critical',
          detected: match[0],
          reason: 'Attempt to bypass PrepSkul payment system or request off-platform payment detected. All payments must be made through PrepSkul.',
        });
        break; // Only flag once
      }
    }
  }
  
  return flags;
}

/**
 * Detect social media handles and contact sharing
 */
function detectSocialMedia(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  const lowerContent = content.toLowerCase();
  
  // Social media platform patterns
  const socialMediaPatterns = [
    {
      pattern: /(?:whatsapp|wa)\s+(?:me|us|contact)\s+(?:at|on)?\s*[:\-]?\s*(\+?237|00237)?[\s-]?[6-9][\d\s-]{8,9}/gi,
      platform: 'WhatsApp',
      severity: 'high' as const,
    },
    {
      pattern: /(?:instagram|ig)\s+(?:handle|account|@)?\s*[@]?[a-zA-Z0-9._]+/gi,
      platform: 'Instagram',
      severity: 'medium' as const,
    },
    {
      pattern: /(?:facebook|fb)\s+(?:profile|page|account|me)/gi,
      platform: 'Facebook',
      severity: 'medium' as const,
    },
    {
      pattern: /(?:twitter|x)\s+(?:handle|@)?\s*[@]?[a-zA-Z0-9_]+/gi,
      platform: 'Twitter/X',
      severity: 'medium' as const,
    },
    {
      pattern: /(?:snapchat|sc)\s+(?:username|handle|add)/gi,
      platform: 'Snapchat',
      severity: 'medium' as const,
    },
    {
      pattern: /(?:telegram|tg)\s+(?:me|contact|@)?\s*[@]?[a-zA-Z0-9_]+/gi,
      platform: 'Telegram',
      severity: 'high' as const,
    },
    {
      pattern: /(?:tiktok|tt)\s+(?:@)?[a-zA-Z0-9._]+/gi,
      platform: 'TikTok',
      severity: 'medium' as const,
    },
  ];
  
  for (const { pattern, platform, severity } of socialMediaPatterns) {
    if (pattern.test(content)) {
      flags.push({
        type: 'social_media',
        severity,
        detected: platform,
        reason: `${platform} contact information detected. External contact sharing is not allowed. Please communicate through PrepSkul.`,
      });
    }
  }
  
  return flags;
}

/**
 * Detect external contact attempts (general)
 */
function detectExternalContact(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  const lowerContent = content.toLowerCase();
  
  const externalContactPatterns = [
    /contact\s+(?:me\s+)?(?:outside|off\s+platform|directly)/gi,
    /reach\s+(?:me\s+)?(?:outside|off\s+platform|directly)/gi,
    /(?:let'?s|we)\s+(?:talk|chat|communicate)\s+(?:outside|off\s+platform|directly)/gi,
    /(?:move|switch)\s+(?:to|conversation\s+to)\s+(?:whatsapp|telegram|email)/gi,
  ];
  
  for (const pattern of externalContactPatterns) {
    if (pattern.test(content)) {
      flags.push({
        type: 'external_contact',
        severity: 'high',
        detected: 'external_contact_attempt',
        reason: 'Attempt to move communication outside PrepSkul detected. Please keep all communication within the platform.',
      });
      break;
    }
  }
  
  return flags;
}

/**
 * Detect inappropriate language
 */
function detectInappropriateLanguage(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  const lowerContent = content.toLowerCase();
  
  // Profanity list (expandable - keep server-side only)
  const profanityWords = [
    'fuck', 'fucking', 'fucked',
    'shit', 'shitting',
    'damn', 'damned',
    'hell',
    'bitch', 'bitches',
    'ass', 'asses',
    'bastard',
    'crap',
    // Add more as needed
  ];
  
  // Check for profanity
  const hasProfanity = profanityWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerContent);
  });
  
  if (hasProfanity) {
    flags.push({
      type: 'inappropriate_language',
      severity: 'high',
      detected: 'profanity',
      reason: 'Inappropriate language detected. Please maintain professional communication.',
    });
  }
  
  // Check for excessive caps (shouting)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 10) {
    flags.push({
      type: 'inappropriate_language',
      severity: 'low',
      detected: 'excessive_caps',
      reason: 'Excessive use of capital letters detected. Please use normal capitalization.',
    });
  }
  
  // Check for harassment patterns
  const harassmentPatterns = [
    /(?:you'?re|you)\s+(?:stupid|idiot|dumb|fool)/gi,
    /(?:shut\s+up|shut\s+your\s+mouth)/gi,
    /(?:go\s+to\s+hell|go\s+die)/gi,
  ];
  
  for (const pattern of harassmentPatterns) {
    if (pattern.test(content)) {
      flags.push({
        type: 'harassment',
        severity: 'high',
        detected: 'harassment',
        reason: 'Harassing language detected. Please maintain respectful communication.',
      });
      break;
    }
  }
  
  return flags;
}

/**
 * Detect spam patterns
 */
function detectSpam(content: string, senderId: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  
  // Common short legitimate words/phrases (whitelist)
  const legitimateShortWords = [
    'hi', 'hey', 'ok', 'okay', 'yes', 'no', 'yeah', 'yep', 'nope',
    'ok', 'sure', 'thanks', 'thank you', 'ty', 'np', 'yw',
    'bye', 'ciao', 'ttyl', 'brb', 'lol', 'haha', 'hahaha',
    '👍', '👋', '😊', '😀', '😁', '🙂', '👍', '👌', '✌️',
  ];
  
  const trimmedContent = content.trim().toLowerCase();
  
  // Only flag as too short if it's empty, single character, or not a legitimate short word
  if (trimmedContent.length === 0) {
    // Empty messages are handled by validation, not spam detection
    return flags;
  }
  
  if (trimmedContent.length === 1 && !legitimateShortWords.includes(trimmedContent)) {
    flags.push({
      type: 'spam',
      severity: 'low',
      detected: 'too_short',
      reason: 'Message is too short.',
    });
  }
  
  // Don't flag legitimate short words/phrases
  if (trimmedContent.length < 3 && legitimateShortWords.includes(trimmedContent)) {
    // Allow legitimate short words
    return flags;
  }
  
  // Check for repeated characters (e.g., "aaaaaa")
  const repeatedCharPattern = /(.)\1{4,}/g;
  if (repeatedCharPattern.test(content)) {
    flags.push({
      type: 'spam',
      severity: 'medium',
      detected: 'repeated_characters',
      reason: 'Repeated characters detected. This may be spam.',
    });
  }
  
  // Check for URL spam (multiple URLs)
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern) || [];
  if (urls.length > 2) {
    flags.push({
      type: 'spam',
      severity: 'medium',
      detected: 'multiple_urls',
      reason: 'Multiple URLs detected. This may be spam.',
    });
  }
  
  // Check for excessive punctuation
  const punctuationRatio = (content.match(/[!?.]{2,}/g) || []).length / content.length;
  if (punctuationRatio > 0.1 && content.length > 20) {
    flags.push({
      type: 'spam',
      severity: 'low',
      detected: 'excessive_punctuation',
      reason: 'Excessive punctuation detected.',
    });
  }
  
  return flags;
}

