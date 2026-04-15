const fs = require('fs');

const categories = [
  'Grammar (Ngữ pháp)', 
  'Vocabulary (Từ vựng)', 
  'Topics (Chủ đề)'
];

const topics = [
  { c: 0, title: 'Present Simple', desc: 'Thì hiện tại đơn cơ bản' },
  { c: 0, title: 'Present Continuous', desc: 'Hành động đang diễn ra' },
  { c: 0, title: 'Past Simple', desc: 'Kể chuyện quá khứ' },
  { c: 0, title: 'Future Simple', desc: 'Dự định tương lai' },
  { c: 0, title: 'Present Perfect', desc: 'Thì hiện tại hoàn thành' },
  { c: 0, title: 'Conditionals Type 1', desc: 'Câu điều kiện loại 1' },
  { c: 0, title: 'Modal Verbs', desc: 'Động từ khuyết thiếu' },
  { c: 1, title: 'Family & Friends', desc: 'Từ vựng gia đình và bạn bè' },
  { c: 1, title: 'Food & Drinks', desc: 'Đồ ăn và thức uống' },
  { c: 1, title: 'Animals', desc: 'Thế giới động vật' },
  { c: 1, title: 'Colors & Shapes', desc: 'Màu sắc và hình khối' },
  { c: 1, title: 'Weather', desc: 'Từ vựng thời tiết' },
  { c: 1, title: 'Emotions', desc: 'Cảm xúc và cảm giác' },
  { c: 1, title: 'Jobs & Careers', desc: 'Nghề nghiệp' },
  { c: 2, title: 'Travel & Holidays', desc: 'Du lịch và kỳ nghỉ' },
  { c: 2, title: 'Shopping', desc: 'Mua sắm tại siêu thị' },
  { c: 2, title: 'Daily Routine', desc: 'Thói quen hằng ngày' },
  { c: 2, title: 'Hobbies & Sports', desc: 'Sở thích và thể thao' },
  { c: 2, title: 'Health & Fitness', desc: 'Sức khỏe và thể chất' },
  { c: 2, title: 'Technology', desc: 'Công nghệ và tương lai' }
];

const lessons = topics.map((t, index) => {
  return {
    id: 'lesson-' + index,
    title: t.title,
    category: categories[t.c],
    icon: '📚',
    description: t.desc,
    level: 'Beginner',
    color: '#7ED6DF',
    theory: {
      summary: 'Giới thiệu về ' + t.title,
      structure: 'Subject + Verb + Object',
      examples: ['Example 1.', 'Example 2.']
    },
    visualNovel: [
      {
        id: 1,
        speaker: 'System Message',
        text: 'Chào mừng bạn đến với bài học: ' + t.title,
        choices: []
      },
      {
        id: 2,
        speaker: 'Hana',
        text: 'Chúng ta cùng bắt đầu ôn tập phần kiến thức này nhé!',
        choices: []
      }
    ],
    miniGames: [
      {
        type: 'multipleChoice',
        question: 'Chọn đáp án đúng nhất cho chủ đề ' + t.title + ':',
        options: [
          'Đáp án A',
          'Đáp án B (Đúng)',
          'Đáp án C'
        ],
        answerIndex: 1
      }
    ],
    passScore: 1,
    reward: {
      xp: 15,
      stars: 3
    }
  }
});

const fileContent = 'export const lessons = ' + JSON.stringify(lessons, null, 2) + ';'
fs.writeFileSync('./src/lessons/index.js', fileContent);

console.log('Generated 20 lessons.');
