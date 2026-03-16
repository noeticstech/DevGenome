import { buildGeminiSystemInstruction } from '../ai/geminiPromptBuilder'
import type { DeveloperReportType } from '../../types/api/reports'
import type { DeveloperReportInput } from './reportTypes'

const developerReportResponseSchema = {
  type: 'OBJECT',
  required: [
    'title',
    'subtitle',
    'summary',
    'strengths',
    'weakPoints',
    'changesOverTime',
    'nextSteps',
    'metrics',
    'sections',
  ],
  properties: {
    title: { type: 'STRING' },
    subtitle: { type: 'STRING' },
    summary: { type: 'STRING' },
    strengths: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    weakPoints: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    changesOverTime: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    nextSteps: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    metrics: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['key', 'label', 'value', 'context'],
        properties: {
          key: { type: 'STRING' },
          label: { type: 'STRING' },
          value: { type: 'STRING' },
          context: { type: 'STRING' },
        },
      },
    },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['key', 'title', 'items'],
        properties: {
          key: { type: 'STRING' },
          title: { type: 'STRING' },
          items: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
      },
    },
  },
} as const

function buildReportFormattingRules() {
  return [
    'Return JSON matching the requested schema exactly.',
    'Keep the report grounded in the structured data only.',
    'Do not change deterministic scores, ratings, or labels.',
    'Do not imply that source code was stored or inspected.',
    'Use polished product language, but stay specific and evidence-based.',
    'Strengths and weak points should be concise and non-repetitive.',
    'Changes over time must describe only the change windows provided in the structured input.',
    'Next steps should be practical and personalized.',
  ].join('\n')
}

function buildTypeSpecificInstructions(reportType: DeveloperReportType) {
  if (reportType === 'genome_summary') {
    return [
      'Genome summary report:',
      '- Explain what the current DevGenome profile says about the developer today.',
      '- Tie the narrative to archetype, strongest categories, weakest categories, and score meaning.',
      '- Keep the report identity-focused rather than task-list-focused.',
    ].join('\n')
  }

  if (reportType === 'monthly_growth') {
    return [
      'Monthly growth report:',
      '- Treat the report as a monthly-style product summary grounded in recent stored windows.',
      '- Explain what changed in activity, stack breadth, and practice momentum.',
      '- If exact monthly precision is not present, say "recent window" or similar instead of inventing exact month-over-month claims.',
    ].join('\n')
  }

  if (reportType === 'skill_gap_action') {
    return [
      'Skill gap action report:',
      '- Focus on the preferred target role and the biggest blockers.',
      '- Convert gaps into an action plan with sequenced next steps.',
      '- Recommended actions should connect directly to stored evidence and realistic project directions.',
    ].join('\n')
  }

  return [
    'Interview readiness report:',
    '- Focus on problem-solving, algorithms, system-thinking, and interview-style readiness.',
    '- Use LeetCode and Codeforces when present, but do not ignore GitHub implementation depth.',
    '- Be explicit when interview-readiness confidence is limited by sparse direct-practice data.',
  ].join('\n')
}

export function buildDeveloperReportSystemInstruction() {
  return buildGeminiSystemInstruction()
}

export function buildDeveloperReportPrompt(input: DeveloperReportInput) {
  return [
    'Generate a polished DevGenome developer report in JSON that matches the schema exactly.',
    buildReportFormattingRules(),
    buildTypeSpecificInstructions(input.reportType),
    `Template label: ${input.template.label}`,
    `Template goal: ${input.template.goal}`,
    `Template focus areas: ${input.template.focusAreas.join(', ')}`,
    'Structured report input:',
    JSON.stringify(input, null, 2),
  ].join('\n\n')
}

export function getDeveloperReportResponseSchema() {
  return developerReportResponseSchema
}
