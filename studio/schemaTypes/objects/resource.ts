import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

const RESOURCE_TYPES = [
  {title: 'Article', value: 'article'},
  {title: 'Video', value: 'video'},
  {title: 'Tool', value: 'tool'},
  {title: 'Download', value: 'download'},
]

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: {list: RESOURCE_TYPES, layout: 'radio'},
      initialValue: 'article',
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
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url'},
  },
})
