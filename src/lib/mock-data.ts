
import type { Lecture, Lesson, Quiz, Question, LessonContentBlock } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export const mockLecturesData: Lecture[] = [
  { id: uuidv4(), title: 'Introduction to Chemistry', description: 'Fundamentals of chemistry, atoms, molecules, and the periodic table.', order: 1, lessonsCount: 2, imageUrl: 'https://picsum.photos/seed/chemistry/400/200' },
  { id: uuidv4(), title: 'Atomic Structure and Bonding', description: 'Exploring the inside of an atom and how atoms bond to form compounds.', order: 2, lessonsCount: 1, imageUrl: 'https://picsum.photos/seed/atom/400/200' },
  { id: uuidv4(), title: 'Chemical Reactions', description: 'Understanding types of chemical reactions, stoichiometry, and balancing equations.', order: 3, lessonsCount: 0, imageUrl: 'https://picsum.photos/seed/reactions/400/200' },
];

const createContentBlocks = (text: string, imageUrl?: string, videoUrl?: string, formula?: string): LessonContentBlock[] => {
  const blocks: LessonContentBlock[] = [];
  if (text) blocks.push({ id: uuidv4(), type: 'text', value: text });
  if (imageUrl) blocks.push({ id: uuidv4(), type: 'image', value: imageUrl, altText: 'Lesson image' });
  if (videoUrl) blocks.push({ id: uuidv4(), type: 'video', value: videoUrl });
  if (formula) blocks.push({ id: uuidv4(), type: 'formula', value: formula });
  return blocks;
};

export const mockLessonsData: Lesson[] = [
  {
    id: uuidv4(),
    lectureId: mockLecturesData[0].id,
    title: 'What is Matter?',
    order: 1,
    content: createContentBlocks(
      'Matter is anything that has mass and occupies space. It exists in various states, including solid, liquid, and gas. Understanding matter is fundamental to the study of chemistry.',
      'https://picsum.photos/seed/matter/300/150'
    ),
    estimatedTimeMinutes: 10
  },
  {
    id: uuidv4(),
    lectureId: mockLecturesData[0].id,
    title: 'The Periodic Table',
    order: 2,
    content: createContentBlocks(
      'The periodic table is a tabular arrangement of chemical elements, ordered by their atomic number, electron configuration, and recurring chemical properties. It is a cornerstone of chemistry, providing a systematic way to organize and understand the elements and their relationships.',
      undefined, 'https://www.youtube.com/embed/0RRVV4Diomg'
    ),
    estimatedTimeMinutes: 15
  },
  {
    id: uuidv4(),
    lectureId: mockLecturesData[1].id,
    title: 'Inside the Atom',
    order: 1,
    content: createContentBlocks(
      'Atoms are composed of a nucleus containing protons and neutrons, surrounded by electrons. Protons carry a positive charge, neutrons are neutral, and electrons carry a negative charge. The number of protons defines an element.',
      undefined, undefined, 'H₂O'
    ),
    estimatedTimeMinutes: 12
  },
];

export const mockQuizzesData: Quiz[] = [
  {
    id: uuidv4(),
    lessonId: mockLessonsData[0].id,
    title: 'Matter Basics Quiz',
    description: 'Test your understanding of the fundamental concepts of matter.',
    questions: [
      {
        id: uuidv4(),
        text: 'Is light considered matter?',
        type: 'true_false',
        options: [],
        correctAnswer: 'false',
        explanation: 'Light is a form of energy and does not have mass or volume.'
      },
      {
        id: uuidv4(),
        text: 'Which of these is a primary state of matter?',
        type: 'multiple_choice',
        options: [
          {id: uuidv4(), text: 'Solid'},
          {id: uuidv4(), text: 'Plasma'},
          {id: uuidv4(), text: 'Bose-Einstein Condensate'},
          {id: uuidv4(), text: 'Light'}
        ],
        correctAnswer: '', // Placeholder: Will be set by the post-initialization logic below
        explanation: 'Solid, liquid, and gas are the three primary states of matter taught at an introductory level. Plasma is often considered the fourth.'
      }
    ]
  },
  {
    id: uuidv4(),
    lectureId: mockLecturesData[0].id,
    title: 'Introduction to Chemistry Review',
    description: 'A quiz covering all topics from the "Introduction to Chemistry" lecture.',
    questions: []
  }
];

// Helper to re-assign correct answer ID for the mock quiz after options are generated
if (mockQuizzesData.length > 0 && mockQuizzesData[0].questions.length > 1 && mockQuizzesData[0].questions[1].options) {
  const solidOption = mockQuizzesData[0].questions[1].options.find(opt => opt.text === 'Solid');
  if (solidOption) {
    mockQuizzesData[0].questions[1].correctAnswer = solidOption.id;
  }
}
