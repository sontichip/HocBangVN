export const lessons = [
  {
    id: "1-1",
    chapter: 1,
    type: "normal",
    title: "1-1: Thức Tỉnh (I, You, We, They)",
    category: "Grammar",
    icon: "🚶",
    description: "Học cách sử dụng thì hiện tại đơn với các đại từ số nhiều để thức tỉnh ma lực.",
    level: "Beginner",
    color: "#74b9ff",
    reward: { xp: 10, gold: 20 },
    theory: {
      summary: "Với I, You, We, They, động từ đi kèm giữ nguyên (thần chú gốc).",
      structure: "S + V(nguyên thể)",
      examples: ["I play tennis.", "They go to school."]
    },
    visualNovel: [
      { id: 1, speaker: "Hana (Mèo)", text: "Này ngài pháp sư, ngài tỉnh lại đi! Ngài bị trúng lời nguyền bóng tối nên đã quên hết các câu thần chú cơ bản rồi sao?", choices: [{ text: "Ta là ai? Đây là đâu?", next: 2 }, { text: "Tôi... không nhớ gì cả.", next: 2 }] },
      { id: 2, speaker: "Hana (Mèo)", text: "Tôi là linh thú hộ mệnh của ngài đây. Shadow Castle đang bị hắc hóa! Để tôi giúp ngài nhớ lại phép 'Hiện Tại Đơn'. Thử niệm chú 'play' kết hợp với chủ ngữ 'We' xem nào?", choices: [{ text: "We play", next: 3 }, { text: "We plays", next: 4 }] },
      { id: 3, speaker: "Hana (Mèo)", text: "Chính xác! Với các ngôi I, You, We, They, ma lực ở trạng thái nguyên thủy nên động từ giữ nguyên. Ngài bắt đầu nhớ ra rồi đó!", choices: [] },
      { id: 4, speaker: "Hana (Mèo)", text: "Không phải! Chỉ với He, She, It thì mới thêm 's'. Còn 'We' thì thần chú giữ nguyên hình dạng gốc nhé ngài. Cùng thử lại ở thực chiến nào!", choices: [] }
    ],
    miniGames: [
      {
        type: "multipleChoice",
        question: "Chọn dạng đúng của thần chú: They _____ to school every day.",
        options: ["goes", "go", "going", "to go"],
        answerIndex: 1
      },
      {
        type: "wordMatch",
        pairs: [
          { a: "I", b: "Tôi" },
          { a: "You", b: "Bạn" },
          { a: "We", b: "Chúng ta" },
          { a: "They", b: "Họ" }
        ]
      }
    ]
  },
  {
    id: "1-2",
    chapter: 1,
    type: "normal",
    title: "1-2: Bóng Ma Thường Ngày (He, She, It)",
    category: "Grammar",
    icon: "🏃",
    description: "Cường hóa thần chú bằng cách thêm 's' hoặc 'es' vào sau động từ.",
    level: "Beginner",
    color: "#55efc4",
    reward: { xp: 15, gold: 30 },
    theory: {
      summary: "Với chủ ngữ He, She, It (ngôi 3 số ít), động từ phải thêm s hoặc es.",
      structure: "S(He/She/It) + V(s/es)",
      examples: ["He runs.", "She watches TV."]
    },
    visualNovel: [
      { id: 1, speaker: "Hana (Mèo)", text: "Cẩn thận! Có một con bóng ma đang tiến đến. Thần chú nguyên thủy I/You/We/They không đủ sức sát thương với nó đâu!", choices: [{ text: "Vậy ta phải làm sao?", next: 2 }] },
      { id: 2, speaker: "Hana (Mèo)", text: "Khi niệm chú với He, She, It, đại diện cho cá thể độc lập, ngài phải cường hóa bằng cách nối đuôi 's' hoặc 'es' vào sau động từ. Ví dụ 'He goes'.", choices: [{ text: "Ta đã nắm được quy luật!", next: 3 }] },
      { id: 3, speaker: "Hana (Mèo)", text: "Vậy ngài hãy thử niệm chú phóng lửa 'watch' vào cô ả bóng ma kia xem: She _____ TV.", choices: [{ text: "watches", next: 4 }, { text: "watchs", next: 5 }] },
      { id: 4, speaker: "Hana (Mèo)", text: "Cú đánh tuyệt đẹp! Động từ tận cùng o, ch, sh, x, s, z cần thêm 'es' để hội đủ sát thương.", choices: [] },
      { id: 5, speaker: "Hana (Mèo)", text: "Trượt rồi! Động từ kết thúc chữ 'ch' phải được cường hóa bằng 'es' tạo thành 'watches' nhé. Giờ hãy chiến đấu thật sự nào!", choices: [] }
    ],
    miniGames: [
      {
        type: "multipleChoice",
        question: "Bắn cầu lửa: She _____ English every evening.",
        options: ["study", "studies", "studys", "studying"],
        answerIndex: 1
      },
      {
        type: "sentenceBuilder",
        question: "Phép tụ khí, sắp xếp câu:",
        correctOrder: ["He", "reads", "books", "at", "night"]
      }
    ]
  },
  {
    id: "1-3",
    chapter: 1,
    type: "normal",
    title: "1-3: Suối Nước Ma Tự",
    category: "Practice",
    icon: "⛺",
    description: "Luyện tập pha trộn các thần chú để kiểm soát mana.",
    level: "Beginner",
    color: "#81ecec",
    reward: { xp: 20, gold: 40 },
    theory: {
      summary: "Ôn tập I/You/We/They (V) và He/She/It (V-s/es).",
    },
    visualNovel: [
      { id: 1, speaker: "Hana (Mèo)", text: "Phía trước là căn phòng của tên Quỷ Vương Thời Gian vô cùng đáng sợ. Ngài cần ngồi thiền và luyện luân chuyển ma năng liên tục.", choices: [{ text: "Giúp ta ôn lại!", next: 2 }] },
      { id: 2, speaker: "Hana (Mèo)", text: "Hãy niệm chú thay đổi linh hoạt giữa I/You và He/She thật trơn tru. Bắt đầu đợt tập huấn nào!", choices: [] }
    ],
    miniGames: [
      {
        type: "wordMatch",
        pairs: [
          { a: "study", b: "học" },
          { a: "play", b: "chơi" },
          { a: "watch", b: "xem" },
          { a: "go", b: "đi" }
        ]
      },
      {
        type: "multipleChoice",
        question: "Phân luồng ma lực đa chiều: We _____ English, and she _____ Math.",
        options: ["study / studies", "studies / study", "study / study", "studies / studies"],
        answerIndex: 0
      }
    ]
  },
  {
    id: "1-boss",
    chapter: 1,
    type: "boss",
    title: "Chúa Tể Thời Gian (BOSS Chương 1)",
    category: "Boss",
    icon: "🐲",
    description: "Trận chiến sống còn với Chúa Tể Thời Gian. Vận dụng toàn bộ ma lực Hiện Tại Đơn!",
    level: "Hard",
    color: "#ff7675",
    reward: { xp: 50, gold: 100, item: "Crown" },
    theory: {
      summary: "Boss: Khó khăn lớn nhất của thì hiện tại đơn."
    },
    visualNovel: [
      { id: 1, speaker: "Chúa Tể Thời Gian", text: "Khà khà, một tên pháp sư mất trí nhớ mà cũng dám thách thức Ta? Ngay cả ma lực Hiện Tại Đơn cốt lõi của ngươi cũng đã vỡ nát!", choices: [{ text: "Ta sẽ cho ngươi thấy sức mạnh của ta!", next: 2 }] },
      { id: 2, speaker: "Hana (Mèo)", text: "Cẩn thận! Hắn gầm thét tạo ra một kết giới nhiễu loạn không gian. Nếu niệm chú sai một nhịp, ngài sẽ bị kẹt vào quá khứ mãi mãi!", choices: [{ text: "Ta không sợ, tiến lên!", next: 3 }] },
      { id: 3, speaker: "Chúa Tể Thời Gian", text: "Tiếp chiêu của ta đây, hỡi Pháp sư hết thời!", choices: [] }
    ],
    miniGames: [
      {
        type: "multipleChoice",
        question: "Đỡ đòn kép: My father _____ in a big company, and my brothers _____ in a bank.",
        options: ["works / works", "work / works", "works / work", "work / work"],
        answerIndex: 2
      },
      {
        type: "sentenceBuilder",
        question: "Phản đòn cực quang, sắp xếp ma trận từ:",
        correctOrder: ["The", "dragon", "flies", "in", "the", "sky"]
      },
      {
        type: "fillBlanks",
        question: "Cú đánh phong ấn cuối cùng! He always (catch) ________ the bus.",
        answer: "catches"
      }
    ]
  }
]
