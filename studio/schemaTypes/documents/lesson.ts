import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'details',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      group: 'details',
      description:
        'YouTube, Vimeo or Bunny embed URL. Playback uses the provider player.',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      group: 'details',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      type: 'number',
      group: 'details',
      description: 'Length in seconds.',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'freePreview',
      type: 'boolean',
      group: 'details',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      type: 'number',
      group: 'details',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'notes',
      type: 'richText',
      group: 'content',
    }),
    defineField({
      name: 'keyPoints',
      title: 'In this lesson you will',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'proTip',
      type: 'text',
      rows: 2,
      group: 'content',
    }),
    defineField({
      name: 'resources',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'resource'})],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      freePreview: 'freePreview',
      media: 'thumbnail',
    },
    prepare: ({title, freePreview, media}) => ({
      title,
      subtitle: freePreview ? 'Free preview' : 'Members only',
      media,
    }),
  },
})
