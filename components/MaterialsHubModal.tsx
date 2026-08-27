import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  FileArchive, 
  FileCode, 
  Sparkles,
  ExternalLink,
  BookOpen,
  Layers
} from 'lucide-react';
import { Course, Attachment, AttachmentType } from '../types';
import { MaterialCard } from './MaterialCard';

interface MaterialsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
}

export const MaterialsHubModal: React.FC<MaterialsHubModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSelectCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Aggregate all materials across all courses and lessons
  const allMaterials: Array<{ attachment: Attachment; course: Course; lessonTitle?: string }> = [];

  courses.forEach(course => {
    // Global course attachments
    if (course.attachments && course.attachments.length > 0) {
      course.attachments.forEach(att => {
        allMaterials.push({ attachment: att, course });
      });
    }

    // Lesson specific attachments
    if (course.lessons) {
      course.lessons.forEach(lesson => {
        if (lesson.attachments && lesson.attachments.length > 0) {
          lesson.attachments.forEach(att => {
            allMaterials.push({ attachment: att, course, lessonTitle: lesson.title });
          });
        }
      });
    }
  });

  // Filtered materials
  const filtered = allMaterials.filter(item => {
    const matchesSearch = 
      item.attachment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.attachment.description && item.attachment.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || item.attachment.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || item.course.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(courses.map(c => c.category)));

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
      <div className="bg-[#101012] border border-white/10 rounded-[8px] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-orange-950/20 via-black to-black">
          <div>
            <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-caption text-orange-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Central de Recursos & Downloads</span>
            </div>
            <h2 className="font-display text-subheading md:text-heading-sm font-bold text-white tracking-heading-sm leading-heading-sm">
              Biblioteca de Materiais Complementares
            </h2>
            <p className="text-body-sm font-normal text-gray-400 mt-1 leading-body-sm tracking-body-sm">
              Baixe planilhas, modelos, e-books, checklists e PDFs de todos os cursos do Compor HUB.
            </p>
          </div>

          <button
            onClick={onClose}
            className="self-end md:self-center px-5 py-2.5 rounded-[980px] bg-white/10 hover:bg-white/20 text-white text-body-sm font-semibold tracking-body-sm transition-all shadow-xl"
          >
            Fechar
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-6 border-b border-white/5 bg-[#141417] space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar material por nome, curso ou palavra-chave..."
                className="w-full bg-black/60 border border-white/10 rounded-[8px] pl-12 pr-4 py-3 text-body-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
            </div>

            {/* Type Filters Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pdf', label: 'PDFs' },
                { id: 'spreadsheet', label: 'Planilhas' },
                { id: 'zip', label: 'Pacotes ZIP' },
                { id: 'doc', label: 'Documentos' },
                { id: 'link', label: 'Links' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-4 py-2 rounded-[980px] text-body-sm font-semibold tracking-body-sm whitespace-nowrap transition-all ${
                    selectedType === t.id
                      ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap text-caption font-semibold tracking-caption text-gray-400 pt-1">
            <span className="text-gray-300 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-orange-400" /> Categoria:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-[980px] transition-colors ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'hover:text-white'
              }`}
            >
              Todas ({allMaterials.length})
            </button>
            {categories.map(cat => {
              const count = allMaterials.filter(m => m.course.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-[980px] transition-colors ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Material Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-3 opacity-30 text-orange-400" />
              <p className="text-body font-semibold text-gray-400">Nenhum material encontrado</p>
              <p className="text-caption text-gray-600 mt-1">Tente ajustar seus termos de pesquisa ou filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item, index) => (
                <div key={`${item.attachment.id}-${index}`} className="flex flex-col">
                  {/* Context Badge: Which Course / Lesson */}
                  <div className="flex items-center justify-between text-caption font-semibold tracking-caption text-gray-400 mb-2 px-1">
                    <span 
                      onClick={() => {
                        onClose();
                        onSelectCourse?.(item.course);
                      }}
                      className="hover:text-orange-400 cursor-pointer truncate flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-orange-500/80" />
                      {item.course.title}
                    </span>
                    {item.lessonTitle && (
                      <span className="text-gray-500 truncate max-w-[120px] font-normal" title={item.lessonTitle}>
                        {item.lessonTitle}
                      </span>
                    )}
                  </div>
                  
                  <MaterialCard attachment={item.attachment} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 px-8 border-t border-white/5 bg-[#0a0a0c] flex items-center justify-between text-caption font-semibold tracking-caption text-gray-500">
          <span>{filtered.length} materiais disponíveis para download</span>
          <span>Compor HUB • Materiais Exclusivos</span>
        </div>
      </div>
    </div>
  );
};
