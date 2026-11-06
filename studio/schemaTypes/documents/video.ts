import {VideoIcon} from '@sanity/icons/Video'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: VideoIcon,
  fields: [
    defineField({
      name: 'id',
      type: 'string',
      description: 'Provider video id. Internal lookup only.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      description: 'The same URL stored on the lessons that use this video.',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'durationSeconds',
      type: 'number',
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: 'chapters',
      type: 'array',
      of: [defineArrayMember({type: 'videoChapter'})],
    }),
    defineField({
      name: 'chunks',
      type: 'array',
      of: [defineArrayMember({type: 'videoChunk'})],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url', id: 'id'},
    prepare: ({title, subtitle, id}) => ({
      title: title ?? id ?? 'Untitled video',
      subtitle,
    }),
  },
})
