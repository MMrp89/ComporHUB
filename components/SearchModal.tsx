import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, PlayCircle, Download } from 'lucide-react';
import { Course } from '../types';
import { getCourses } from '../services/db';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (course: Course) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onPlay }) => {
  const [query, setQuery] = useState('');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load courses on mount
  useEffect(() => {
    const loadData = async () => {
      const courses = await getCourses();
      setAllCourses(courses);
      setLoading(false);
    };
    loadData();
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Filter logic across Title, Category, Instructor and Materials
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allCourses.filter(c => {
      const matchesTitle = c.title.toLowerCase().includes(lowerQuery);
      const matchesCat = c.category.toLowerCase().includes(lowerQuery);
      const matchesInstructor = c.instructor?.toLowerCase().includes(lowerQuery);
      const matchesLessons = c.lessons.some(l => l.title.toLowerCase().includes(lowerQuery));
      const matchesAttachments = c.attachments?.some(a => a.name.toLowerCase().includes(lowerQuery));
      
      return matchesTitle || matchesCat || matchesInstructor || matchesLessons || matchesAttachments;
    });
    setResults(filtered);
  }, [query, allCourses]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0c]/95 backdrop-blur-xl animate-fade-in-up flex flex-col">
      {/* Header / Search Input */}
      <div className="pt-20 px-6 md:px-12 pb-6 border-b border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:right-12 p-2.5 bg-white/10 hover:bg-white/20 rounded-[980px] text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <Search className="w-7 h-7 text-orange-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por cursos, aulas, instrutor ou materiais..."
              className="w-full bg-transparent font-display text-2xl md:text-heading font-bold text-white placeholder:text-gray-600 focus:outline-none tracking-heading leading-heading"
            />
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
        <div className="max-w-[1440px] mx-auto">
          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
          ) : (
            <>
              {!query && (
                <div className="text-center mt-20 opacity-40 space-y-2">
                  <p className="font-display text-subheading font-normal text-gray-300 tracking-subheading leading-subheading">Digite um termo para pesquisar cursos ou arquivos</p>
                  <p className="text-caption font-normal text-gray-500 tracking-caption">Ex: Meta Ads, ROAS, Planilha, Criativos, Funil</p>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="text-center mt-20">
                  <p className="text-body font-normal text-gray-400 tracking-body">Nenhum curso ou material encontrado para "{query}"</p>
                </div>
              )}

              {results.length > 0 && (
                <div>
                  <h3 className="text-gray-400 font-semibold mb-6 uppercase tracking-caption text-caption flex items-center gap-2">
                    <span className="w-2 h-2 rounded-[980px] bg-orange-500"></span>
                    {results.length} Curso{results.length !== 1 ? 's' : ''} Encontrado{results.length !== 1 ? 's' : ''}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {results.map(course => {
                      const matCount = (course.attachments?.length || 0) + course.lessons.reduce((acc, l) => acc + (l.attachments?.length || 0), 0);
                      
                      return (
                        <div 
                          key={course.id} 
                          onClick={() => { onPlay(course); onClose(); }} 
                          className="cursor-pointer group bg-zinc-900/60 rounded-[8px] p-3 border border-white/5 hover:border-orange-500/40 transition-all duration-300 shadow-xl"
                        >
                          <div className="aspect-video bg-gray-900 rounded-[8px] overflow-hidden mb-3 relative">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 rounded-[8px]" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <PlayCircle className="w-10 h-10 text-orange-500" />
                            </div>
                            {matCount > 0 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-[980px] text-caption font-semibold text-orange-400 border border-orange-500/30 flex items-center gap-1">
                                <Download className="w-2.5 h-2.5" />
                                {matCount}
                              </div>
                            )}
                          </div>
                          
                          <h4 className="text-white font-semibold text-body-sm truncate group-hover:text-orange-400 transition-colors leading-body-sm tracking-body-sm">
                            {course.title}
                          </h4>
                          <div className="flex items-center justify-between text-caption font-normal tracking-caption text-gray-500 mt-1">
                            <span className="truncate">{course.category}</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
