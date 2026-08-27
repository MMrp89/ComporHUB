export type SectionVariant = 'landscape' | 'portrait';

export type AttachmentType = 'pdf' | 'spreadsheet' | 'zip' | 'doc' | 'image' | 'link' | 'video';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  size?: string; // e.g. "4.2 MB"
  description?: string;
  lessonId?: string; // Associated lesson or global course asset
  downloadCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isFree: boolean; // true = Public, false = Pro (Login required)
  description?: string;
  attachments?: Attachment[]; // Lesson-specific downloadable materials
}

export interface Course {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  lessons: Lesson[]; 
  progress?: number; // 0 to 100
  views?: number;
  duration: string; // Total duration or lesson count
  description: string;
  instructor?: string;
  instructorRole?: string;
  tips?: string[]; // Key takeaways / instructor tips
  attachments?: Attachment[]; // Downloadable materials across entire course
}

export interface Section {
  title: string;
  variant: SectionVariant;
  courses: Course[];
}

export type UserRole = 'professor' | 'student';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Comment {
  id: string;
  courseId: string;
  lessonId?: string;
  user: string;
  text: string;
  date: string;
  reply?: string; // Professor's reply
  replyDate?: string;
}