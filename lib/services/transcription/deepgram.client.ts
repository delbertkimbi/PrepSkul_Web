/**
 * Deepgram API Client
 * 
 * Handles transcription requests to Deepgram API
 * Free tier: $200 credit = ~418 sessions (61 min each)
 */

const DEEPGRAM_API_BASE = 'https://api.deepgram.com/v1';

export interface TranscriptSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens?: number[];
  temperature?: number;
  avg_logprob?: number;
  compression_ratio?: number;
  no_speech_prob?: number;
  confidence?: number;
}

export interface DeepgramResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: TranscriptSegment[];
}

interface DeepgramApiResponse {
  metadata: {
    transaction_key: string;
    request_id: string;
    sha256: string;
    created: string;
    duration: number;
    channels: number;
  };
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words: Array<{
          word: string;
          start: number;
          end: number;
          confidence: number;
          speaker?: number;
        }>;
      }>;
    }>;
    utterances?: Array<{
      start: number;
      end: number;
      transcript: string;
      confidence: number;
      words: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
        speaker?: number;
      }>;
    }>;
  };
}

export class DeepgramClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is required');
    }
  }

  /**
   * Transcribe audio file
   * 
   * @param audioFile - Audio file as Buffer or File
   * @param options - Transcription options
   * @returns Transcript with segments and timestamps
   */
  async transcribe(
    audioFile: Buffer | File,
    options: {
      language?: string;
      prompt?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      temperature?: number;
    } = {}
  ): Promise<DeepgramResponse> {
    const formData = new FormData();
    
    // Handle both Buffer and File types
    if (audioFile instanceof File) {
      formData.append('audio', audioFile);
    } else {
      // Convert Buffer to Blob
      const blob = new Blob([audioFile], { type: 'audio/mpeg' });
      formData.append('audio', blob, 'audio.mp3');
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('model', 'nova-2'); // Use Nova-2 model (good balance of cost/quality)
    params.append('punctuate', 'true');
    params.append('utterances', 'true'); // Get utterance-level segments
    params.append('smart_format', 'true'); // Context-aware formatting
    
    if (options.language) {
      params.append('language', options.language);
    } else {
      params.append('detect_language', 'true'); // Auto-detect if not specified
    }

    try {
      const response = await fetch(`${DEEPGRAM_API_BASE}/listen?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Deepgram API error: ${JSON.stringify(error)}`);
      }

      const data: DeepgramApiResponse = await response.json();
      
      // Convert Deepgram response to standard format
      return this.convertDeepgramResponse(data);
    } catch (error) {
      console.error('[DeepgramClient] Transcription failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio from URL
   * Deepgram supports direct URL transcription (no download needed)
   */
  async transcribeFromUrl(
    audioUrl: string,
    options: {
      language?: string;
      prompt?: string;
      temperature?: number;
    } = {}
  ): Promise<DeepgramResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('model', 'nova-2');
      params.append('punctuate', 'true');
      params.append('utterances', 'true');
      params.append('smart_format', 'true');
      
      if (options.language) {
        params.append('language', options.language);
      } else {
        params.append('detect_language', 'true');
      }

      // Deepgram requires URL in request body as JSON
      const requestBody = {
        url: audioUrl,
      };

      const response = await fetch(`${DEEPGRAM_API_BASE}/listen?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Deepgram API error: ${JSON.stringify(error)}`);
      }

      const data: DeepgramApiResponse = await response.json();
      
      // Convert Deepgram response to standard format
      return this.convertDeepgramResponse(data);
    } catch (error) {
      console.error('[DeepgramClient] Failed to transcribe from URL:', error);
      throw error;
    }
  }

  /**
   * Convert Deepgram API response to standard transcript format
   */
  private convertDeepgramResponse(data: DeepgramApiResponse): DeepgramResponse {
    const channel = data.results.channels[0];
    const alternative = channel.alternatives[0];
    
    // Use utterances if available (better segmentation), otherwise use words
    const segments: TranscriptSegment[] = [];
    
    if (data.results.utterances && data.results.utterances.length > 0) {
      // Use utterance-level segmentation
      data.results.utterances.forEach((utterance, index) => {
        segments.push({
          id: index,
          seek: utterance.start,
          start: utterance.start,
          end: utterance.end,
          text: utterance.transcript.trim(),
          confidence: utterance.confidence,
        });
      });
    } else {
      // Fallback: create segments from words (group words into ~3-5 second segments)
      const words = alternative.words;
      const segmentDuration = 3; // seconds
      let currentSegment: { start: number; end: number; words: string[] } | null = null;
      let segmentIndex = 0;

      words.forEach((word) => {
        if (!currentSegment || word.end - currentSegment.start >= segmentDuration) {
          // Start new segment
          if (currentSegment) {
            segments.push({
              id: segmentIndex++,
              seek: currentSegment.start,
              start: currentSegment.start,
              end: currentSegment.end,
              text: currentSegment.words.join(' ').trim(),
              confidence: undefined,
            });
          }
          currentSegment = {
            start: word.start,
            end: word.end,
            words: [word.word],
          };
        } else {
          // Add word to current segment
          currentSegment.words.push(word.word);
          currentSegment.end = word.end;
        }
      });

      // Add final segment
      if (currentSegment) {
        segments.push({
          id: segmentIndex,
          seek: currentSegment.start,
          start: currentSegment.start,
          end: currentSegment.end,
          text: currentSegment.words.join(' ').trim(),
          confidence: undefined,
        });
      }
    }

    return {
      task: 'transcribe',
      language: data.metadata.request_id, // Deepgram doesn't return language in same format
      duration: data.metadata.duration,
      text: alternative.transcript,
      segments: segments,
    };
  }
}
