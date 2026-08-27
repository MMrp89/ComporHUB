import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CourseRow } from './CourseRow';
import { Section, Course } from '../types';
import { initDB, getCourses } from '../services/db';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface CourseGridProps {
  onCourseSelect?: (course: Course) => void;
  selectedCategoryFilter?: string;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ 
  onCourseSelect,
  selectedCategoryFilter
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Slider State & Refs for Categories
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const draggedDistanceRef = useRef(0);
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);

  const checkCategoryBoundaries = useCallback(() => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollCatLeft(scrollLeft > 10);
    setCanScrollCatRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await initDB();
      const allCourses = await getCourses();
      setCourses(allCourses);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    checkCategoryBoundaries();
    window.addEventListener('resize', checkCategoryBoundaries);
    return () => window.removeEventListener('resize', checkCategoryBoundaries);
  }, [checkCategoryBoundaries, courses]);

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 300;
    categoryScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!categoryScrollRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - categoryScrollRef.current.offsetLeft;
    scrollLeftRef.current = categoryScrollRef.current.scrollLeft;
    draggedDistanceRef.current = 0;
    setIsDraggingCategory(false);
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !categoryScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    draggedDistanceRef.current = Math.abs(walk);

    if (draggedDistanceRef.current > 5) {
      setIsDraggingCategory(true);
      categoryScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleCatMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDraggingCategory(false);
      draggedDistanceRef.current = 0;
    }, 50);
  };

  const handleCategoryClick = (cat: string) => {
    if (draggedDistanceRef.current < 8) {
      setActiveCategory(cat);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Filter courses if a specific category is active
  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  // Group into curated sections for Netflix/Apple TV style layout
  const sections: Section[] = [
    {
      title: activeCategory === 'all' ? 'Cursos em Destaque' : activeCategory,
      variant: 'landscape',
      courses: filteredCourses
    },
    {
      title: 'Com Materiais & Planilhas para Download',
      variant: 'landscape',
      courses: courses.filter(c => (c.attachments && c.attachments.length > 0) || c.lessons.some(l => l.attachments && l.attachments.length > 0))
    },
    {
      title: 'Formações Recomendadas',
      variant: 'portrait',
      courses: courses
    }
  ];

  return (
    <section className="relative z-20 pb-32 space-y-8">
      
      {/* Category Pills Slider Container */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto select-none">
        <div className="relative group/catslider flex items-center">
          
          {/* Scroll Button Left */}
          {canScrollCatLeft && (
            <button
              onClick={() => handleCategoryScroll('left')}
              className="absolute -left-3 sm:-left-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900/90 hover:bg-orange-500 text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 shrink-0"
              title="Categorias anteriores"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Left Gradient Fade */}
          {canScrollCatLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-10" />
          )}

          {/* Scrollable Category Track */}
          <div
            ref={categoryScrollRef}
            onMouseDown={handleCatMouseDown}
            onMouseMove={handleCatMouseMove}
            onMouseUp={handleCatMouseUp}
            onMouseLeave={handleCatMouseUp}
            onScroll={checkCategoryBoundaries}
            className={`flex items-center gap-2.5 overflow-x-auto py-2 hide-scrollbar flex-1 min-w-0 overscroll-x-contain scroll-smooth ${
              isDraggingCategory ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-5 py-2.5 rounded-[980px] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 shadow-sm ${
                activeCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-zinc-900/90 text-gray-300 hover:bg-zinc-800 hover:text-white border border-white/10'
              }`}
            >
              Todos os Cursos ({courses.length})
            </button>

            {CATEGORIES.map(cat => {
              const count = courses.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-5 py-2.5 rounded-[980px] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 shadow-sm ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                      : 'bg-zinc-900/90 text-gray-300 hover:bg-zinc-800 hover:text-white border border-white/10'
                  }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade */}
          {canScrollCatRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-10" />
          )}

          {/* Scroll Button Right */}
          {canScrollCatRight && (
            <button
              onClick={() => handleCategoryScroll('right')}
              className="absolute -right-3 sm:-right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900/90 hover:bg-orange-500 text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 shrink-0"
              title="Mais categorias"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

        </div>
      </div>

      {/* Sections Rows */}
      {sections.map((section, index) => (
        section.courses.length > 0 && (
          <CourseRow 
            key={`${section.title}-${index}`} 
            section={section} 
            onCourseClick={onCourseSelect}
          />
        )
      ))}
    </section>
  );
};

