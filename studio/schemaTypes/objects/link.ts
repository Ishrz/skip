import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'href',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel']}),
    }),
    defineField({
      name: 'openInNewTab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
