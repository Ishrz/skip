import {defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons/Sparkles'

/**
 * Semantic keys only — the web app maps each key to its own icon component.
 */
const OUTCOME_ICONS = [
  {title: 'Play', value: 'play'},
  {title: 'Certificate', value: 'certificate'},
  {title: 'Clock', value: 'clock'},
  {title: 'Target', value: 'target'},
  {title: 'Chart', value: 'chart'},
  {title: 'Wrench', value: 'wrench'},
]

export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning outcome',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'icon',
      type: 'string',
      options: {list: OUTCOME_ICONS},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(160),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
