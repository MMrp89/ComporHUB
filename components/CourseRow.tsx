import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CourseCard } from './CourseCard';
import { Section, Course } from '../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CourseRowProps {
  section: Section;
  onCourseClick?: (course: Course) => void;
}

export const CourseRow: React.FC<CourseRowProps> = ({ section, onCourseClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const draggedDistanceRef = useRef(0);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const checkScrollBoundaries = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  }, []);

  useEffect(() => {
    checkScrollBoundaries();
    window.addEventListener('resize', checkScrollBoundaries);
    return () => window.removeEventListener('resize', checkScrollBoundaries);
  }, [checkScrollBoundaries, section.courses]);

  // Arrow button handlers
  const handleScroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.75;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse Drag-to-Scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Don't drag if clicking buttons or specific interactive items
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
    draggedDistanceRef.current = 0;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Drag sensitivity multiplier
    draggedDistanceRef.current = Math.abs(walk);
    
    if (draggedDistanceRef.current > 6) {
      setIsDragging(true);
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      draggedDistanceRef.current = 0;
    }, 50);
  };

  const handleCardClick = (course: Course) => {
    // Only trigger play/open if user wasn't dragging
    if (draggedDistanceRef.current < 10) {
      onCourseClick?.(course);
    }
  };

  return (
    <div className="flex flex-col py-6 group/row animate-fade-in-up relative select-none">
      {/* Title Header */}
      <div className="px-6 md:px-12 max-w-[1440px] w-full mx-auto mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4 group-hover/row:text-white transition-colors duration-300">
          <h2 className="font-display text-xl sm:text-2xl md:text-2xl font-bold text-gray-100 tracking-tight">
            {section.title}
          </h2>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
            {section.courses.length} {section.courses.length === 1 ? 'curso' : 'cursos'}
          </span>
        </div>

        {/* Inline Navigation Arrows for Desktop */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-orange-500 disabled:opacity-20 disabled:hover:bg-zinc-900/80 text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            title="Rolar para a esquerda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-orange-500 disabled:opacity-20 disabled:hover:bg-zinc-900/80 text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            title="Rolar para a direita"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative w-full max-w-[1440px] mx-auto group/carousel">
        
        {/* Floating Side Arrow Left (Hover Overlay) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/80 hover:bg-orange-500 text-white border border-white/20 backdrop-blur-md hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95"
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scroll Container with drag-to-scroll */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onScroll={checkScrollBoundaries}
          className={`flex overflow-x-auto gap-6 px-6 md:px-12 pb-8 pt-1 hide-scrollbar overscroll-x-contain scroll-smooth ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
        >
          {section.courses.map((course) => (
            <div key={course.id} className="snap-start shrink-0">
              <CourseCard 
                course={course} 
                variant={section.variant} 
                onClick={handleCardClick}
              />
            </div>
          ))}
          {/* Padding at the end */}
          <div className="w-8 md:w-12 flex-none" />
        </div>

        {/* Floating Side Arrow Right (Hover Overlay) */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/80 hover:bg-orange-500 text-white border border-white/20 backdrop-blur-md hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95"
            title="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        {/* Subtle Vignette on the right */}
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 hidden md:block" />
      </div>
    </div>
  );
};


