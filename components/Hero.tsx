import React from 'react';
import { Play, Plus, Sparkles } from 'lucide-react';
import { FEATURED_COURSE } from '../constants';
import { Course } from '../types';

interface HeroProps {
  onPlay?: (course: Course) => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlay }) => {

  return (
    <div className="relative w-full min-h-[75vh] lg:min-h-[82vh] max-h-[800px] h-auto overflow-hidden group flex flex-col justify-end pt-28 pb-12 sm:pb-16 px-6 md:px-12">
      {/* Background Image with Cinematic Gradient Overlay */}
      <div className="absolute inset-0 transition-transform duration-[20s] ease-in-out group-hover:scale-105">
        <img 
          src={FEATURED_COURSE.thumbnail} 
          alt="Featured Course" 
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients for text readability and seamless transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto">
        <div className="max-w-3xl lg:max-w-4xl animate-fade-in-up flex flex-col items-start">
          
          {/* Metadata Badges / Tags */}
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white/90 mb-3.5">
            <span className="bg-orange-500 text-white px-3.5 py-1 rounded-[980px] shadow-xl flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              Destaque
            </span>
            <span className="text-gray-300">{FEATURED_COURSE.category}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">{FEATURED_COURSE.duration}</span>
          </div>
          
          {/* Main Display Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl mb-4">
            {FEATURED_COURSE.title}
          </h1>
          
          {/* Subhead / Lead Description */}
          <p className="text-sm sm:text-base md:text-lg font-normal text-gray-200 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed opacity-90 mb-6 sm:mb-8">
            {FEATURED_COURSE.description}
          </p>

          {/* Action Buttons with comfortable width, borders, and spacing */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary CTA */}
            <button 
              onClick={() => onPlay?.(FEATURED_COURSE)}
              className="flex items-center justify-center gap-3 bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-[980px] text-sm sm:text-base font-bold hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-xl min-w-[200px]"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Assistir Aula 1</span>
            </button>

            {/* Add to List */}
            <button 
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[980px] bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white transition-all duration-200 active:scale-95 group shadow-xl shrink-0"
              title="Adicionar aos Favoritos"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

