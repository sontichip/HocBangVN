// Schema mẫu cho 1 lesson visual novel + mini game
// Sửa/đổi cho các lesson tiếp theo rất dễ dàng

export const presentSimpleLesson = {
  id: "present-simple",
  title: "Present Simple (Hiện Tại Đơn)",
  icon: "⏰",
  description: "Trạng thái, thói quen hàng ngày",
  level: "Beginner",
  color: "#FF6B6B",
  theory: {
    summary: "Thì hiện tại đơn dùng để diễn tả một hành động lặp đi lặp lại hoặc một sự thật hiển nhiên.",
    structure: "S + V(s/es) + O",
    examples: [
      "I go to school every day.",
      "She likes apples."
    ]
  },
  visualNovel: [
    {
      id: 1,
      speaker: "Anna",
      text: "Hi! My name is Anna. I go to school every day in this wonderland town. What about you?",
      choices: [
        { text: "I go to school, too!", next: 2 },
        { text: "I goes to school.", next: 3 }
      ]
    },
    {
      id: 2,
      speaker: "Anna",
      text: "Great! We both go to school. The cat below is waiting for our next lesson. Do you like English lessons?",
      choices: [
        { text: "Yes, I do.", next: 4 },
        { text: "No, I doesn't.", next: 5 }
      ]
    },
    {
      id: 3,
      speaker: "Anna",
      text: "Oops! Remember: 'I go', not 'I goes'.",
      choices: [
        { text: "I go to school.", next: 2 }
      ]
    },
    {
      id: 4,
      speaker: "Anna",
      text: "Awesome! Let's play a mini game to practice Present Simple.",
      choices: []
    },
    {
      id: 5,
      speaker: "Anna",
      text: "Remember: 'I don't', not 'I doesn't'.",
      choices: [
        { text: "No, I don't.", next: 4 }
      ]
    }
  ],
  miniGames: [
    {
      type: "multipleChoice",
      question: "Which sentence is correct in Present Simple?",
      options: [
        "She like apples.",
        "She likes apples.",
        "She is like apples.",
        "She liked apples now."
      ],
      answerIndex: 1
    },
    {
      type: "fillBlanks",
      question: "She ___ (like) apples every morning.",
      answer: "likes"
    },
    {
      type: "sentenceBuilder",
      words: ["I", "go", "to", "school", "every", "day"],
      answer: "I go to school every day"
    },
    {
      type: "wordMatch",
      pairs: [
        { left: "I", right: "go" },
        { left: "She", right: "likes" }
      ]
    },
    {
      type: "multipleChoice",
      question: "Which word is correct? 'He ___ football every Sunday.'",
      options: ["play", "plays", "playing", "played"],
      answerIndex: 1
    },
    {
      type: "fillBlanks",
      question: "They ___ (watch) TV at night.",
      answer: "watch"
    }
  ],
  passScore: 2,
  reward: {
    xp: 10,
    stars: 3
  }
};
