import {defineField, defineType} from 'sanity'

export const videoChunk = defineType({
  name: 'videoChunk',
  title: 'Video transcript chunk',
  type: 'object',
  fields: [
    defineField({
      name: 'startSeconds',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'text', subtitle: 'startSeconds'},
  },
})
