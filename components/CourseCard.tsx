import React from 'react';
import { PlayCircle, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Course, SectionVariant } from '../types';

interface CourseCardProps {
  course: Course;
  variant: SectionVariant;
  onClick?: (course: Course) => void;
  onOpenMaterials?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  variant, 
  onClick,
  onOpenMaterials 
}) => {
  const widthClass = variant === 'landscape' 
    ? 'w-[320px] md:w-[420px]' 
    : 'w-[200px] md:w-[260px]';
    
  const aspectRatioClass = variant === 'landscape'
    ? 'aspect-video'
    : 'aspect-[3/4]';

  // Count total materials (global + lesson specific)
  const globalAttachmentsCount = course.attachments?.length || 0;
  const lessonAttachmentsCount = course.lessons?.reduce((acc, l) => acc + (l.attachments?.length || 0), 0) || 0;
  const totalMaterials = globalAttachmentsCount + lessonAttachmentsCount;

  return (
    <div 
      className={`group relative flex-none ${widthClass} cursor-pointer snap-start`}
    >
      {/* Thumbnail Container */}
      <div 
        onClick={() => onClick?.(course)}
        className={`relative ${aspectRatioClass} w-full overflow-hidden rounded-[8px] bg-zinc-900 shadow-xl transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-orange-500/10 group-hover:z-10 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-orange-500/40`}
      >
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="h-full w-full object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100 rounded-[8px] select-none pointer-events-none"
        />

        {/* Badges on Thumbnail */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="text-caption font-semibold tracking-caption uppercase bg-black/75 backdrop-blur-md text-white px-2.5 py-0.5 rounded-[980px] border border-white/10 shadow-sm">
            {course.category.split('&')[0].trim()}
          </span>

          {totalMaterials > 0 && (
            <span className="flex items-center gap-1 text-caption font-semibold tracking-caption bg-orange-500/90 text-white px-2.5 py-0.5 rounded-[980px] backdrop-blur-md shadow-sm">
              <Download className="w-3 h-3" />
              {totalMaterials} {totalMaterials === 1 ? 'Material' : 'Materiais'}
            </span>
          )}
        </div>
        
        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-[980px] bg-orange-500 p-3 shadow-xl shadow-orange-500/30 scale-90 group-hover:scale-100 transition-transform duration-300">
            <PlayCircle className="h-6 w-6 text-white fill-white/20" />
          </div>
        </div>
        
        {/* Progress Bar */}
        {course.progress !== undefined && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div 
              className="h-full bg-orange-500 transition-all duration-300" 
              style={{ width: `${course.progress}%` }} 
            />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className={`flex flex-col px-0.5 mt-3 transition-opacity duration-300 opacity-90 group-hover:opacity-100 ${variant === 'portrait' ? 'text-center' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <h3 
            onClick={() => onClick?.(course)}
            className="text-body font-semibold text-white/95 line-clamp-1 group-hover:text-orange-400 transition-colors leading-body tracking-body"
          >
            {course.title}
          </h3>
        </div>

        <div className={`flex items-center gap-2 text-caption font-normal tracking-caption text-gray-400 mt-1 ${variant === 'portrait' ? 'justify-center' : ''}`}>
          <span>{course.duration}</span>
          {course.instructor && (
            <>
              <span className="w-1 h-1 rounded-[980px] bg-gray-600"></span>
              <span className="truncate">{course.instructor}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
