import {defineField, defineType} from 'sanity'

export const videoChapter = defineType({
  name: 'videoChapter',
  title: 'Video chapter',
  type: 'object',
  fields: [
    defineField({
      name: 'startSeconds',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'startSeconds'},
  },
})
