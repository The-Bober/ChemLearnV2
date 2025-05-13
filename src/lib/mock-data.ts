
import type { Lecture, Lesson, Quiz, Question, LessonContentBlock, QuestionOption } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export const mockLecturesData: Lecture[] = [
  { id: 'lecture-1', title: 'Introduction to Chemistry', description: 'Fundamentals of chemistry, atoms, molecules, and the periodic table.', order: 1, lessonsCount: 3, imageUrl: 'https://picsum.photos/seed/chemistry/600/400' },
  { id: 'lecture-2', title: 'Atomic Structure and Bonding', description: 'Exploring the inside of an atom and how atoms bond to form compounds.', order: 2, lessonsCount: 2, imageUrl: 'https://picsum.photos/seed/atom/600/400' },
  { id: 'lecture-3', title: 'Chemical Reactions', description: 'Understanding types of chemical reactions, stoichiometry, and balancing equations.', order: 3, lessonsCount: 1, imageUrl: 'https://picsum.photos/seed/reactions/600/400' },
];

const createContentBlocks = (blocks: Array<{type: LessonContentBlock['type'], value: string, altText?: string}>): LessonContentBlock[] => {
  return blocks.map(block => ({
    id: uuidv4(),
    type: block.type,
    value: block.value,
    altText: block.altText,
  }));
};

export const mockLessonsData: Lesson[] = [
  {
    id: 'lesson-1-1',
    lectureId: mockLecturesData[0].id,
    title: 'What is Matter?',
    order: 1,
    content: createContentBlocks([
      { type: 'text', value: 'Matter is anything that has mass and occupies space. It exists in various states, including solid, liquid, and gas. Understanding matter is fundamental to the study of chemistry.'},
      { type: 'image', value: 'https://picsum.photos/seed/matter-solid/600/300', altText: 'Solid state of matter example'},
      { type: 'text', value: 'The three most common states of matter are solid, liquid, and gas. Each state has distinct properties related to particle arrangement and movement.'},
      { type: 'formula', value: 'H₂O(s) ⇌ H₂O(l) ⇌ H₂O(g)'},
    ]),
    estimatedTimeMinutes: 10
  },
  {
    id: 'lesson-1-2',
    lectureId: mockLecturesData[0].id,
    title: 'The Periodic Table',
    order: 2,
    content: createContentBlocks([
      { type: 'text', value: 'The periodic table is a tabular arrangement of chemical elements, ordered by their atomic number, electron configuration, and recurring chemical properties. It is a cornerstone of chemistry, providing a systematic way to organize and understand the elements and their relationships.'},
      { type: 'image', value: 'https://picsum.photos/seed/periodictable/600/350', altText: 'The Periodic Table of Elements'},
      { type: 'video', value: 'https://www.youtube.com/embed/0RRVV4Diomg' }, // Example video
      { type: 'text', value: 'Watch the video above for a quick introduction to the periodic table.'}
    ]),
    estimatedTimeMinutes: 15
  },
   {
    id: 'lesson-1-3',
    lectureId: mockLecturesData[0].id,
    title: 'Atoms and Molecules',
    order: 3,
    content: createContentBlocks([
      { type: 'text', value: 'Atoms are the basic units of matter. Molecules are formed when two or more atoms are held together by chemical bonds.'},
      { type: 'formula', value: 'O₂ (Oxygen Molecule)'},
      { type: 'formula', value: 'CO₂ (Carbon Dioxide Molecule)'},
      { type: 'image', value: 'https://picsum.photos/seed/molecule-structure/600/300', altText: 'Example of a molecule structure'},
    ]),
    estimatedTimeMinutes: 8
  },
  {
    id: 'lesson-2-1',
    lectureId: mockLecturesData[1].id,
    title: 'Inside the Atom',
    order: 1,
    content: createContentBlocks([
      { type: 'text', value: 'Atoms are composed of a nucleus containing protons and neutrons, surrounded by electrons. Protons carry a positive charge, neutrons are neutral, and electrons carry a negative charge. The number of protons defines an element.'},
      { type: 'image', value: 'https://picsum.photos/seed/atom-structure/600/300', altText: 'Diagram of an atom structure'},
      { type: 'formula', value: 'Proton (p+), Neutron (n⁰), Electron (e⁻)' }
    ]),
    estimatedTimeMinutes: 12
  },
  {
    id: 'lesson-2-2',
    lectureId: mockLecturesData[1].id,
    title: 'Chemical Bonds',
    order: 2,
    content: createContentBlocks([
        { type: 'text', value: 'Chemical bonds are attractive forces that hold atoms together in molecules and compounds. The main types of chemical bonds are ionic bonds, covalent bonds, and metallic bonds.'},
        { type: 'text', value: 'Ionic bonds involve the transfer of electrons, covalent bonds involve sharing of electrons.'},
        { type: 'image', value: 'https://picsum.photos/seed/chemical-bonds/600/300', altText: 'Illustration of chemical bonds'},
    ]),
    estimatedTimeMinutes: 18
  },
  {
    id: 'lesson-3-1',
    lectureId: mockLecturesData[2].id,
    title: 'Types of Chemical Reactions',
    order: 1,
    content: createContentBlocks([
        { type: 'text', value: 'Chemical reactions involve the rearrangement of atoms to form new substances. Common types include synthesis, decomposition, single displacement, and double displacement reactions.'},
        { type: 'formula', value: 'A + B → AB (Synthesis)'},
        { type: 'formula', value: 'AB → A + B (Decomposition)'},
    ]),
    estimatedTimeMinutes: 20
  }
];

// Update lessonsCount for lectures
mockLecturesData.forEach(lecture => {
  lecture.lessonsCount = mockLessonsData.filter(lesson => lesson.lectureId === lecture.id).length;
});

// Prepare options and correct answers for quizzes to avoid initialization errors
const matterQuizQ2Options: QuestionOption[] = [
  {id: uuidv4(), text: 'Solid'},
  {id: uuidv4(), text: 'Plasma'},
  {id: uuidv4(), text: 'Bose-Einstein Condensate'},
  {id: uuidv4(), text: 'Light'}
];
const matterQuizQ2CorrectAnswerId = matterQuizQ2Options.find(opt => opt.text === 'Solid')?.id || matterQuizQ2Options[0].id;

const introChemQuizQ1Options: QuestionOption[] = [
  {id: uuidv4(), text: 'H₂O'},
  {id: uuidv4(), text: 'CO₂'},
  {id: uuidv4(), text: 'O₂'},
  {id: uuidv4(), text: 'NaCl'}
];
const introChemQuizQ1CorrectAnswerId = introChemQuizQ1Options.find(o => o.text === 'H₂O')!.id;

const atomicStructureQuizQ1Options: QuestionOption[] = [
  {id: uuidv4(), text: 'Electron'},
  {id: uuidv4(), text: 'Proton'},
  {id: uuidv4(), text: 'Neutron'},
];
const atomicStructureQuizQ1CorrectAnswerId = atomicStructureQuizQ1Options.find(o => o.text === 'Proton')!.id;


export const mockQuizzesData: Quiz[] = [
  {
    id: 'quiz-1',
    lessonId: mockLessonsData[0].id, // What is Matter?
    title: 'Matter Basics Quiz',
    description: 'Test your understanding of the fundamental concepts of matter.',
    durationMinutes: 5,
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
        text: 'Which of these is a primary state of matter taught at an introductory level?',
        type: 'multiple_choice',
        options: matterQuizQ2Options,
        correctAnswer: matterQuizQ2CorrectAnswerId,
        explanation: 'Solid, liquid, and gas are the three primary states of matter taught at an introductory level. Plasma is often considered the fourth.'
      },
      {
        id: uuidv4(),
        text: 'Mass is a measure of the amount of matter in an object.',
        type: 'true_false',
        options: [],
        correctAnswer: 'true',
        explanation: 'This is the definition of mass.'
      }
    ]
  },
  {
    id: 'quiz-2',
    lectureId: mockLecturesData[0].id, // Introduction to Chemistry
    title: 'Intro to Chemistry Review',
    description: 'A quiz covering all topics from the "Introduction to Chemistry" lecture.',
    durationMinutes: 10,
    questions: [
      {
        id: uuidv4(),
        text: 'What is the chemical symbol for water?',
        type: 'multiple_choice',
        options: introChemQuizQ1Options,
        correctAnswer: introChemQuizQ1CorrectAnswerId,
        explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.'
      },
      {
        id: uuidv4(),
        text: 'The periodic table arranges elements by increasing atomic number.',
        type: 'true_false',
        options: [],
        correctAnswer: 'true',
        explanation: 'Atomic number (number of protons) is the primary basis for the order of elements in the periodic table.'
      }
    ]
  },
  {
    id: 'quiz-3',
    lessonId: mockLessonsData[3].id, // Inside the Atom
    title: 'Atomic Structure Quiz',
    description: 'Test your knowledge about the components of an atom.',
    durationMinutes: 7,
    questions: [
      {
        id: uuidv4(),
        text: 'Which particle is found in the nucleus and has a positive charge?',
        type: 'multiple_choice',
        options: atomicStructureQuizQ1Options,
        correctAnswer: atomicStructureQuizQ1CorrectAnswerId,
        explanation: 'Protons are positively charged particles found in the nucleus.'
      },
      {
        id: uuidv4(),
        text: 'Electrons are heavier than protons.',
        type: 'true_false',
        options: [],
        correctAnswer: 'false',
        explanation: 'Electrons are much lighter than protons and neutrons.'
      }
    ]
  }
];
