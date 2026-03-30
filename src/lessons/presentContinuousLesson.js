export const presentContinuousLesson = {
  id: 'present-continuous',
  title: 'Present Continuous (Hiện Tại Tiếp Diễn)',
  icon: '🌸',
  description: 'Hành động đang diễn ra ngay lúc này',
  level: 'Beginner',
  color: '#7ED6DF',
  theory: {
    summary: 'Thì hiện tại tiếp diễn dùng để diễn tả hành động đang xảy ra ở hiện tại hoặc xung quanh thời điểm nói.',
    structure: 'S + am/is/are + V-ing',
    examples: ['I am reading now.', 'She is playing the piano.']
  },
  visualNovel: [
    {
      id: 1,
      speaker: 'Mia',
      text: 'Look! I am drawing a magic flower right now.',
      choices: [
        { text: 'You are drawing a flower.', next: 2 },
        { text: 'You drawing a flower.', next: 3 }
      ]
    },
    {
      id: 2,
      speaker: 'Mia',
      text: 'Yes! I am drawing now. Can you help me choose the right sentence?',
      choices: []
    },
    {
      id: 3,
      speaker: 'Mia',
      text: 'Almost! Remember we need am/is/are + V-ing.',
      choices: [
        { text: 'You are drawing a flower.', next: 2 }
      ]
    }
  ],
  miniGames: [
    {
      type: 'multipleChoice',
      question: 'Which sentence is in Present Continuous?',
      options: [
        'She plays the guitar every day.',
        'She is playing the guitar now.',
        'She played the guitar yesterday.',
        'She will play the guitar tomorrow.'
      ],
      answerIndex: 1
    },
    {
      type: 'fillBlanks',
      question: 'They ___ (run) in the garden now.',
      answer: 'are running'
    },
    {
      type: 'sentenceBuilder',
      words: ['I', 'am', 'watching', 'a', 'movie', 'now'],
      answer: 'I am watching a movie now'
    }
  ],
  passScore: 2,
  reward: {
    xp: 12,
    stars: 3
  }
}
