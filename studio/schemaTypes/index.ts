import type {SchemaTypeDefinition} from 'sanity'

import {category} from './documents/category'
import {course} from './documents/course'
import {instructor} from './documents/instructor'
import {lesson} from './documents/lesson'
import {video} from './documents/video'
import {learningOutcome} from './objects/learning-outcome'
import {link} from './objects/link'
import {courseModule} from './objects/module'
import {resource} from './objects/resource'
import {richText} from './objects/rich-text'
import {videoChapter} from './objects/video-chapter'
import {videoChunk} from './objects/video-chunk'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    // Documents
    course,
    lesson,
    instructor,
    category,
    video,
    // Objects
    courseModule,
    learningOutcome,
    resource,
    richText,
    link,
    videoChapter,
    videoChunk,
  ],
}
