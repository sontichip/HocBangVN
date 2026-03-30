export const pastSimpleLesson = {
  id: 'past-simple',
  title: 'Past Simple (Quá Khứ Đơn)',
  icon: '🕰️',
  description: 'Sự việc đã xảy ra và kết thúc trong quá khứ',
  level: 'Beginner',
  color: '#A29BFE',
  theory: {
    summary: 'Thì quá khứ đơn dùng để diễn tả một hành động đã xảy ra và kết thúc trong quá khứ.',
    structure: 'S + V-ed / V2 + O',
    examples: ['I walked to school yesterday.', 'She went to the market.']
  },
  visualNovel: [
    {
      id: 1,
      speaker: 'Leo',
      text: 'Yesterday I found a shiny key in the forest.',
      choices: [
        { text: 'You found a key.', next: 2 },
        { text: 'You find a key.', next: 3 }
      ]
    },
    {
      id: 2,
      speaker: 'Leo',
      text: 'Right! It was a Past Simple story. Ready for a challenge?',
      choices: []
    },
    {
      id: 3,
      speaker: 'Leo',
      text: 'Remember: this happened yesterday, so we use the past form.',
      choices: [
        { text: 'You found a key.', next: 2 }
      ]
    }
  ],
  miniGames: [
    {
      type: 'multipleChoice',
      question: 'Which sentence is Past Simple?',
      options: [
        'I eat breakfast every day.',
        'I am eating breakfast now.',
        'I ate breakfast this morning.',
        'I will eat breakfast later.'
      ],
      answerIndex: 2
    },
    {
      type: 'fillBlanks',
      question: 'She ___ (go) to the castle yesterday.',
      answer: 'went'
    },
    {
      type: 'wordMatch',
      pairs: [
        { left: 'I', right: 'walked' },
        { left: 'She', right: 'played' }
      ]
    }
  ],
  passScore: 2,
  reward: {
    xp: 12,
    stars: 3
  }
}
