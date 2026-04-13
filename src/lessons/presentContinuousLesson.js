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
      speaker: 'System Message',
      text: 'Hiện tại tôi đang để lời thoại của hệ thống để hướng dẫn bạn cách chọn thì phù hợp cho câu chuyện sắp tới với Hana.',
      choices: []
    },
    {
      id: 2,
      speaker: 'Hana',
      text: 'Look! I am drawing a magic flower right now.',
      choices: []
    }
  ],
  miniGames: [
    {
      type: 'multipleChoice',
      question: 'Find the correct Present Continuous form:',
      options: [
        'She forms a group every day.',
        'She is forming a group now.',
        'She formed a group yesterday.'
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
