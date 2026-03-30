// Quản lý danh sách các lesson, dễ mở rộng
import { presentSimpleLesson } from "./presentSimpleLesson";
import { presentContinuousLesson } from "./presentContinuousLesson";
import { pastSimpleLesson } from "./pastSimpleLesson";

export const lessons = [
  presentSimpleLesson,
  presentContinuousLesson,
  pastSimpleLesson
];
