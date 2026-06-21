/**
 * Request validation for POST /api/skulmate/generate
 */

export type GenerateIntakeInput = {
  fileUrl?: string
  text?: string
  youtubeUrl?: string
  topic?: string
}

export type GenerateIntakeValidation =
  | {
      ok: true
      isTopicOnlyMode: boolean
      trimmedTopic: string
      trimmedText: string
    }
  | {
      ok: false
      error: string
      status: 400
    }

export function validateGenerateIntake(
  input: GenerateIntakeInput
): GenerateIntakeValidation {
  const trimmedTopic = input.topic?.trim() || ''
  const trimmedText = input.text?.trim() || ''
  const hasFile = Boolean(input.fileUrl?.trim())
  const hasYoutube = Boolean(input.youtubeUrl?.trim())

  const isTopicOnlyMode = Boolean(
    trimmedTopic && !hasFile && !hasYoutube && !trimmedText
  )

  if (!hasFile && !trimmedText && !hasYoutube && !trimmedTopic) {
    return {
      ok: false,
      error: 'Either fileUrl, text, youtubeUrl, or topic is required',
      status: 400,
    }
  }

  if (trimmedText && trimmedText.length < 50 && !isTopicOnlyMode) {
    return {
      ok: false,
      error: 'Text must be at least 50 characters long',
      status: 400,
    }
  }

  return {
    ok: true,
    isTopicOnlyMode,
    trimmedTopic,
    trimmedText,
  }
}
