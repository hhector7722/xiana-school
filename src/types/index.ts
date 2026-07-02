export type YesNo = 'yes' | 'no' | null

export interface QuestionDef {
  id: string
  text: string
}

export interface BlockDef {
  id: string
  title: string
  subtitle: string
  questions: QuestionDef[]
  audioPrompt: string
}

export interface BlockResponse {
  answers: Record<string, YesNo>
  transcript: string | null
}

export interface OnboardingData {
  responses: Record<string, BlockResponse>
  completed: boolean
  finishedAt: string | null
}
