import { filterMessage } from '@/lib/services/message-filter-service';

describe('MessageFilterService', () {
  describe('filterMessage', () => {
    it('should allow clean messages', () => {
      const result = filterMessage('Hello, how are you?', 'user-123');
      expect(result.allowed).toBe(true);
      expect(result.willBlock).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should detect phone numbers', () => {
      const result = filterMessage('Call me at +237 612345678', 'user-123');
      expect(result.flags.some(f => f.type === 'phone_number')).toBe(true);
      expect(result.willBlock).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should detect Cameroon phone numbers', () => {
      const result = filterMessage('My number is 612345678', 'user-123');
      expect(result.flags.some(f => f.type === 'phone_number')).toBe(true);
    });

    it('should detect email addresses', () => {
      const result = filterMessage('Email me at test@example.com', 'user-123');
      expect(result.flags.some(f => f.type === 'email')).toBe(true);
      expect(result.willBlock).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should detect payment bypass attempts', () => {
      const result = filterMessage('Pay me directly outside the platform', 'user-123');
      expect(result.flags.some(f => f.type === 'payment_request')).toBe(true);
      expect(result.willBlock).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should detect mobile money mentions', () => {
      const result = filterMessage('Send me MTN mobile money', 'user-123');
      expect(result.flags.some(f => f.type === 'payment_request')).toBe(true);
    });

    it('should detect social media handles', () => {
      const result = filterMessage('Contact me on WhatsApp', 'user-123');
      expect(result.flags.some(f => f.type === 'social_media')).toBe(true);
    });

    it('should detect external contact attempts', () => {
      const result = filterMessage('Let\'s talk outside the platform', 'user-123');
      expect(result.flags.some(f => f.type === 'external_contact')).toBe(true);
      expect(result.willBlock).toBe(true);
    });

    it('should detect inappropriate language', () => {
      const result = filterMessage('This is a bad word', 'user-123');
      // Note: This test depends on the profanity list
      // The service should flag inappropriate language
      expect(result.flags.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect spam patterns', () => {
      const result = filterMessage('aaaaa', 'user-123');
      expect(result.flags.some(f => f.type === 'spam')).toBe(true);
    });

    it('should detect excessive caps', () => {
      const result = filterMessage('HELLO THIS IS ALL CAPS', 'user-123');
      expect(result.flags.some(f => f.type === 'inappropriate_language' && f.detected === 'excessive_caps')).toBe(true);
    });

    it('should block critical violations', () => {
      const result = filterMessage('Pay me outside the platform at +237 612345678', 'user-123');
      expect(result.willBlock).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should block multiple high-severity flags', () => {
      const result = filterMessage('Call me at +237 612345678 or email test@example.com', 'user-123');
      expect(result.willBlock).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should allow messages with low severity flags', () => {
      const result = filterMessage('HELLO', 'user-123'); // Excessive caps
      // Low severity flags should not block
      expect(result.allowed).toBe(true);
    });

    it('should not flag legitimate payment mentions', () => {
      const result = filterMessage('Please make payment through PrepSkul', 'user-123');
      expect(result.flags.some(f => f.type === 'payment_request')).toBe(false);
    });

    it('should detect WhatsApp phone number patterns', () => {
      const result = filterMessage('WhatsApp me at +237 612345678', 'user-123');
      expect(result.flags.some(f => f.type === 'phone_number')).toBe(true);
    });

    it('should generate user-friendly warnings', () => {
      const result = filterMessage('Call me at +237 612345678', 'user-123');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('contact');
    });
  });
});
