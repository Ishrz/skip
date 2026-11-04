import {FolderIcon} from '@sanity/icons/Folder'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A module is embedded inside a course, never a document of its own.
 * Exported as `courseModule` because `module` collides with the Node global.
 */
export const courseModule = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'lessons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'lesson'}],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'title', lessons: 'lessons'},
    prepare: ({title, lessons}) => ({
      title,
      subtitle: `${Array.isArray(lessons) ? lessons.length : 0} lesson(s)`,
    }),
  },
})
