import type { GeminiInsightInput } from './geminiTypes'

const insightResponseSchema = {
  type: 'OBJECT',
  required: ['summary', 'genome', 'skillGap', 'careerFit', 'evolution', 'report'],
  properties: {
    summary: {
      type: 'STRING',
    },
    genome: {
      type: 'OBJECT',
      required: ['narrativeSummary', 'whyThisScore', 'strengths', 'growthEdges'],
      properties: {
        narrativeSummary: { type: 'STRING' },
        whyThisScore: { type: 'STRING' },
        strengths: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        growthEdges: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    },
    skillGap: {
      type: 'OBJECT',
      required: ['targetRole', 'explanation', 'priorities', 'recommendations'],
      properties: {
        targetRole: { type: 'STRING' },
        explanation: { type: 'STRING' },
        priorities: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        recommendations: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    },
    careerFit: {
      type: 'OBJECT',
      required: ['primaryFit', 'explanation', 'supportingSignals'],
      properties: {
        primaryFit: { type: 'STRING' },
        explanation: { type: 'STRING' },
        supportingSignals: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    },
    evolution: {
      type: 'OBJECT',
      required: ['narrative', 'growthSignal', 'nextMilestone', 'recommendations'],
      properties: {
        narrative: { type: 'STRING' },
        growthSignal: { type: 'STRING' },
        nextMilestone: { type: 'STRING' },
        recommendations: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    },
    report: {
      type: 'OBJECT',
      required: ['title', 'overview', 'highlights', 'watchouts', 'nextSteps'],
      properties: {
        title: { type: 'STRING' },
        overview: { type: 'STRING' },
        highlights: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        watchouts: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        nextSteps: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    },
  },
} as const

function buildGroundingRules() {
  return [
    'You are the DevGenome AI explanation layer.',
    'The structured input is the only source of truth.',
    'Do not change, override, or recalculate deterministic scores.',
    'Do not invent unsupported skills, projects, contest history, or source-code analysis.',
    'If evidence is limited, say so clearly and briefly.',
    'Keep the tone professional, grounded, and useful.',
    'Never imply that source code was stored or inspected.',
  ].join('\n')
}

export function buildGenomeInterpretationInstructions() {
  return [
    'Genome interpretation:',
    '- Explain what the genome score means in practical product terms.',
    '- Connect the explanation to visible strengths and weaker edges.',
    '- Keep the explanation grounded in the named skill categories, activity signals, and competitive-programming signals when present.',
  ].join('\n')
}

export function buildSkillGapExplanationInstructions() {
  return [
    'Skill-gap explanation:',
    '- Explain the preferred target role fit without changing the readiness score.',
    '- Prioritize the clearest role blockers first.',
    '- Recommendations should be concrete and metadata-aligned, not generic hype.',
  ].join('\n')
}

export function buildCareerFitExplanationInstructions() {
  return [
    'Career-fit explanation:',
    '- Summarize why the current profile fits the strongest role direction.',
    '- Mention secondary evidence only when it is visible in the structured input.',
    '- Do not claim certainty when role evidence is mixed or sparse.',
  ].join('\n')
}

export function buildEvolutionSummaryInstructions() {
  return [
    'Evolution summary:',
    '- Turn the existing timeline and activity signals into a short growth narrative.',
    '- Highlight momentum, recent expansion, or stagnation honestly.',
    '- Recommend one believable next milestone.',
  ].join('\n')
}

export function buildLearningRecommendationInstructions() {
  return [
    'Learning recommendations:',
    '- Keep recommendations personalized to the strongest visible gaps.',
    '- Prefer next moves that could realistically improve the stored deterministic profile later.',
    '- Developer report copy should read like a concise current-cycle progress report suitable for weekly or monthly surfaces.',
  ].join('\n')
}

export function buildGeminiSystemInstruction() {
  return buildGroundingRules()
}

export function buildGeminiInsightPrompt(input: GeminiInsightInput) {
  return [
    'Generate a grounded DevGenome insight report in JSON that matches the requested schema exactly.',
    buildGenomeInterpretationInstructions(),
    buildSkillGapExplanationInstructions(),
    buildCareerFitExplanationInstructions(),
    buildEvolutionSummaryInstructions(),
    buildLearningRecommendationInstructions(),
    'Structured product input:',
    JSON.stringify(input, null, 2),
  ].join('\n\n')
}

export function getGeminiInsightResponseSchema() {
  return insightResponseSchema
}
