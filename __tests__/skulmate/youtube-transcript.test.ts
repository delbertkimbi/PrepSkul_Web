import {
  parseYoutubeVideoId,
  YoutubeTranscriptError,
} from '@/lib/skulmate/youtube-transcript'

describe('youtube-transcript', () => {
  describe('parseYoutubeVideoId', () => {
    it('parses watch URLs', () => {
      expect(
        parseYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('parses youtu.be URLs', () => {
      expect(parseYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ'
      )
    })

    it('parses shorts URLs', () => {
      expect(
        parseYoutubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('returns null for invalid URLs', () => {
      expect(parseYoutubeVideoId('not-a-url')).toBeNull()
      expect(parseYoutubeVideoId('')).toBeNull()
    })
  })

  describe('YoutubeTranscriptError', () => {
    it('carries errorCode', () => {
      const err = new YoutubeTranscriptError('no captions', 'YOUTUBE_NO_CAPTIONS')
      expect(err.errorCode).toBe('YOUTUBE_NO_CAPTIONS')
      expect(err.message).toContain('no captions')
    })
  })
})
