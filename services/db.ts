import localforage from 'localforage';
import { Course, Comment, Section } from '../types';
import { INITIAL_COURSES, generateMockSections } from '../constants';

const COURSES_KEY = 'compor_hub_courses_v1';
const COMMENTS_KEY = 'compor_hub_comments_v1';
const PROGRESS_KEY = 'compor_hub_progress_v1';

// Initialize DB with seed courses
export const initDB = async (): Promise<void> => {
  const existingCourses = await localforage.getItem<Course[]>(COURSES_KEY);
  if (!existingCourses || existingCourses.length === 0) {
    await localforage.setItem(COURSES_KEY, INITIAL_COURSES);
  }
};

export const getCourses = async (): Promise<Course[]> => {
  const courses = await localforage.getItem<Course[]>(COURSES_KEY);
  if (!courses || courses.length === 0) {
    await initDB();
    return INITIAL_COURSES;
  }
  return courses;
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const courses = await getCourses();
  return courses.find(c => c.id === id) || null;
};

export const saveCourse = async (course: Course): Promise<void> => {
  const courses = await getCourses();
  const index = courses.findIndex(c => c.id === course.id);
  if (index >= 0) {
    courses[index] = course;
  } else {
    courses.unshift(course);
  }
  await localforage.setItem(COURSES_KEY, courses);
};

export const deleteCourse = async (id: string): Promise<void> => {
  const courses = await getCourses();
  const filtered = courses.filter(c => c.id !== id);
  await localforage.setItem(COURSES_KEY, filtered);
};

export const getComments = async (courseId: string): Promise<Comment[]> => {
  const allComments = (await localforage.getItem<Comment[]>(COMMENTS_KEY)) || [];
  return allComments.filter(c => c.courseId === courseId);
};

export const saveComment = async (comment: Comment): Promise<void> => {
  const allComments = (await localforage.getItem<Comment[]>(COMMENTS_KEY)) || [];
  const index = allComments.findIndex(c => c.id === comment.id);
  
  if (index >= 0) {
    allComments[index] = comment;
  } else {
    allComments.unshift(comment);
  }
  await localforage.setItem(COMMENTS_KEY, allComments);
};

export const saveProgress = async (courseId: string, progress: number): Promise<void> => {
  const courses = await getCourses();
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.progress = progress;
    await saveCourse(course);
  }
};

export const incrementViews = async (courseId: string): Promise<void> => {
  const courses = await getCourses();
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.views = (course.views || 0) + 1;
    await saveCourse(course);
  }
};
