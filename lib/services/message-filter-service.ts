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
 * Main filtering function - checks message against all rules
 */
export function filterMessage(
  content: string,
  senderId: string,
  conversationId?: string
): MessageFilterResult {
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
  
  return {
    allowed,
    flags,
    willBlock,
    warnings: allowed ? warnings : [], // Only show warnings if allowed
  };
}

/**
 * Detect phone numbers (Cameroon + international formats)
 */
function detectPhoneNumbers(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  
  // Cameroon phone number patterns
  const cameroonPatterns = [
    // +237 6XX XXX XXX or +237 6XX-XXX-XXX
    /(\+?237|00237)[\s-]?[6-9][\d\s-]{8,9}/g,
    // 6XX XXX XXX or 6XX-XXX-XXX (without country code)
    /\b[6-9][\d\s-]{8,9}\b/g,
  ];
  
  // International phone number patterns
  const internationalPatterns = [
    // +XXX XXXX XXXX format
    /\+\d{1,4}[\s-]?\d{1,4}[\s-]?\d{4,14}/g,
    // (XXX) XXX-XXXX or XXX-XXX-XXXX format
    /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g,
  ];
  
  // WhatsApp-specific patterns
  const whatsappPatterns = [
    /whatsapp\s+(?:me\s+)?(?:at|on)?\s*[:\-]?\s*(\+?237|00237)?[\s-]?[6-9][\d\s-]{8,9}/gi,
    /wa\s+(?:me\s+)?(?:at|on)?\s*[:\-]?\s*(\+?237|00237)?[\s-]?[6-9][\d\s-]{8,9}/gi,
  ];
  
  // Check all patterns
  const allPatterns = [...cameroonPatterns, ...internationalPatterns, ...whatsappPatterns];
  
  for (const pattern of allPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Filter out false positives (e.g., years like "2024", session IDs, etc.)
      const validMatches = matches.filter(match => {
        const cleaned = match.replace(/[\s\-\(\)]/g, '');
        // Exclude if it's just digits and too short or looks like a year/ID
        if (cleaned.length < 8) return false;
        if (/^\d{4}$/.test(cleaned)) return false; // Year
        return true;
      });
      
      if (validMatches.length > 0) {
        flags.push({
          type: 'phone_number',
          severity: 'high',
          detected: validMatches[0],
          reason: 'Phone number detected. Contact information sharing is not allowed. Please communicate through PrepSkul.',
        });
        break; // Only flag once
      }
    }
  }
  
  return flags;
}

/**
 * Detect email addresses
 */
function detectEmailAddresses(content: string): MessageFlag[] {
  const flags: MessageFlag[] = [];
  
  // Standard email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = content.match(emailPattern);
  
  if (matches && matches.length > 0) {
    // Filter out allowed domains (prepskul.com, etc.)
    const allowedDomains = ['prepskul.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const suspiciousEmails = matches.filter(email => {
      const domain = email.split('@')[1]?.toLowerCase();
      // Block if domain is not in allowed list or looks suspicious
      if (!domain) return true;
      if (allowedDomains.includes(domain)) return false;
      // Allow common email providers but flag others
      return true;
    });
    
    if (suspiciousEmails.length > 0) {
      flags.push({
        type: 'email',
        severity: 'high',
        detected: suspiciousEmails[0],
        reason: 'Email address detected. Contact information sharing is not allowed. Please communicate through PrepSkul.',
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

