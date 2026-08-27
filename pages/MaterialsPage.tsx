import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  FileArchive, 
  FileCode, 
  Link as LinkIcon,
  Search, 
  Download, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Copy,
  BookOpen,
  Undo2,
  Eye,
  LayoutGrid,
  List,
  HardDrive,
  X,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Course, Attachment, AttachmentType } from '../types';
import { getCourses } from '../services/db';
import { useToast } from '../context/ToastContext';

interface MaterialsPageProps {
  onPlayCourse: (course: Course) => void;
}

interface MaterialFileItem {
  id: string;
  name: string;
  type: string;
  formatType: AttachmentType;
  size: string;
  modified: string;
  course: Course;
  lessonTitle?: string;
  description?: string;
  url: string;
}

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ onPlayCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation & View Mode State
  const [activeFolder, setActiveFolder] = useState<string>('downloads');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedItem, setSelectedItem] = useState<MaterialFileItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MaterialFileItem | null>(null);
  
  // Filter Chip State (All, XLSX, PDF, ZIP, DOC)
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Table Sort State
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'modified'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: MaterialFileItem | null;
  }>({ visible: false, x: 0, y: 0, item: null });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast, showDownloadToast } = useToast();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getCourses().then(data => {
      setCourses(data);
      setLoading(false);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Format type helper
  const getFileExtension = (att: Attachment) => {
    if (att.type === 'spreadsheet') return 'XLSX';
    if (att.type === 'pdf') return 'PDF';
    if (att.type === 'zip') return 'ZIP';
    if (att.type === 'doc') return 'DOC';
    if (att.type === 'link') return 'JSON';
    return 'TXT';
  };

  // Compile file list
  const allFiles: MaterialFileItem[] = useMemo(() => {
    const list: MaterialFileItem[] = [];
    courses.forEach((course, cIdx) => {
      if (course.attachments && course.attachments.length > 0) {
        course.attachments.forEach((att, aIdx) => {
          const fileId = `f-c-${course.id}-${att.id || aIdx}`;
          list.push({
            id: fileId,
            name: att.name,
            type: getFileExtension(att),
            formatType: att.type,
            size: att.size || `${(aIdx + 1) * 14 + 120} KB`,
            modified: `2026. 08. 1${(aIdx % 8) + 1}`,
            course,
            description: att.description,
            url: att.url || '#'
          });
        });
      }

      if (course.lessons) {
        course.lessons.forEach((lesson, lIdx) => {
          if (lesson.attachments && lesson.attachments.length > 0) {
            lesson.attachments.forEach((att, laIdx) => {
              const fileId = `f-l-${course.id}-${lesson.id}-${att.id || laIdx}`;
              list.push({
                id: fileId,
                name: att.name,
                type: getFileExtension(att),
                formatType: att.type,
                size: att.size || `${(lIdx + 2) * 22 + 210} KB`,
                modified: `2026. 08. 1${(lIdx % 9) + 1}`,
                course,
                lessonTitle: lesson.title,
                description: att.description,
                url: att.url || '#'
              });
            });
          }
        });
      }
    });
    return list;
  }, [courses]);

  // Set default selected item if none selected
  useEffect(() => {
    if (allFiles.length > 0 && !selectedItem) {
      setSelectedItem(allFiles[0]);
    }
  }, [allFiles, selectedItem]);

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.category)));
  }, [courses]);

  // Filtered and Sorted Files
  const displayedFiles = useMemo(() => {
    return allFiles.filter(file => {
      // Type Chip filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'xlsx' && file.type !== 'XLSX') return false;
        if (typeFilter === 'pdf' && file.type !== 'PDF') return false;
        if (typeFilter === 'zip' && file.type !== 'ZIP') return false;
        if (typeFilter === 'doc' && file.type !== 'DOC' && file.type !== 'TXT') return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesType = file.type.toLowerCase().includes(query);
        const matchesCourse = file.course.title.toLowerCase().includes(query);
        const matchesDesc = file.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesCourse && !matchesDesc) {
          return false;
        }
      }

      // Folder navigation filter
      if (activeFolder === 'downloads' || activeFolder === 'my-files' || activeFolder === 'recent') {
        return true;
      }
      if (activeFolder === 'zip') {
        return file.type === 'ZIP';
      }
      if (activeFolder === 'pdf') {
        return file.type === 'PDF';
      }
      if (activeFolder === 'xlsx') {
        return file.type === 'XLSX';
      }
      if (categories.includes(activeFolder)) {
        return file.course.category === activeFolder;
      }
      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      if (sortBy === 'type') cmp = a.type.localeCompare(b.type);
      if (sortBy === 'size') cmp = a.size.localeCompare(b.size);
      if (sortBy === 'modified') cmp = a.modified.localeCompare(b.modified);
      return sortAsc ? cmp : -cmp;
    });
  }, [allFiles, searchTerm, activeFolder, typeFilter, sortBy, sortAsc, categories]);

  const handleSort = (column: 'name' | 'type' | 'size' | 'modified') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  const handleDownload = (item: MaterialFileItem) => {
    setDownloadingId(item.id);
    setContextMenu(prev => ({ ...prev, visible: false }));
    setTimeout(() => {
      setDownloadingId(null);
      showDownloadToast(item.name, item.size);
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      link.target = '_blank';
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 400);
  };

  const handleContextMenu = (e: React.MouseEvent, item: MaterialFileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 240),
      y: Math.min(e.clientY, window.innerHeight - 280),
      item
    });
  };

  // Color Coded File Icon Component with Dark Theme Styling
  const renderFileIcon = (type: string, sizeClass: string = "w-5 h-5") => {
    switch (type.toUpperCase()) {
      case 'XLSX':
      case 'SPREADSHEET':
        return <FileSpreadsheet className={`${sizeClass} text-emerald-400 shrink-0`} />;
      case 'PDF':
        return <FileText className={`${sizeClass} text-rose-400 shrink-0`} />;
      case 'ZIP':
      case 'RAR':
        return <FileArchive className={`${sizeClass} text-amber-400 shrink-0`} />;
      case 'DOC':
      case 'MD':
      case 'TXT':
        return <FileCode className={`${sizeClass} text-blue-400 shrink-0`} />;
      default:
        return <LinkIcon className={`${sizeClass} text-orange-400 shrink-0`} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 selection:text-white pt-24 pb-20 font-sans">
      
      {/* Ambient background glow matching Home */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8">
        
        {/* Breadcrumb + Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <button 
                onClick={() => navigate('/')} 
                className="hover:text-orange-400 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Início</span>
              </button>
              <span className="text-gray-600">/</span>
              <span className="text-orange-400">Central de Recursos</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Biblioteca de <span className="text-orange-500">Materiais</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-normal leading-relaxed">
              Explore e faça o download de todas as planilhas de ROI, modelos de criativos, relatórios e arquivos complementares das aulas em um ambiente integrado.
            </p>
          </div>

          {/* Quick Search & Switcher Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar material, planilha ou aula..."
                className="w-full bg-zinc-900/90 rounded-[980px] pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-gray-400 font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Switcher: Grid vs List */}
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-[980px] shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[980px] text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Visualização em Grade de Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grade</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[980px] text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Visualização em Lista de Tabela"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Explorer Area */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* Left Sidebar: Drive Structure */}
          <aside className="w-full lg:w-64 bg-zinc-950/80 rounded-2xl p-4 shadow-xl shrink-0 select-none">
            
            <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 pb-3 mb-2">
              <HardDrive className="w-4 h-4" />
              <span>Navegação do Drive</span>
            </div>

            <div className="space-y-6 text-sm font-medium">
              
              {/* Primary Folder */}
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveFolder('downloads'); setTypeFilter('all'); setSelectedItem(null); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    activeFolder === 'downloads' && typeFilter === 'all'
                      ? 'bg-orange-500/20 text-orange-400 font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-4 h-4 text-orange-400" />
                    <span>Todos os Arquivos</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-[980px] bg-white/10 text-gray-300 font-semibold">
                    {allFiles.length}
                  </span>
                </button>
              </div>

              {/* Trilhas & Categorias */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-3 pb-2 flex items-center justify-between">
                  <span>Trilhas de Cursos</span>
                </div>
                
                <div className="space-y-1">
                  {categories.map(cat => {
                    const count = allFiles.filter(f => f.course.category === cat).length;
                    const isActive = activeFolder === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setActiveFolder(cat); setTypeFilter('all'); setSelectedItem(null); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-orange-500/20 text-orange-400 font-bold'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-400 fill-orange-400/20' : 'text-gray-500'}`} />
                          <span className="truncate">{cat}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formatos Rápidos */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-3 pb-2">
                  Formatos de Download
                </div>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { setTypeFilter('xlsx'); setActiveFolder('downloads'); setSelectedItem(null); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                      typeFilter === 'xlsx' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Planilhas Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => { setTypeFilter('pdf'); setActiveFolder('downloads'); setSelectedItem(null); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                      typeFilter === 'pdf' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Documentos PDF (.pdf)</span>
                  </button>

                  <button
                    onClick={() => { setTypeFilter('zip'); setActiveFolder('downloads'); setSelectedItem(null); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                      typeFilter === 'zip' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileArchive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pacotes Compactados (.zip)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Storage Gauge */}
            <div className="mt-8 pt-4 border-t border-white/5 text-xs">
              <div className="flex items-center gap-2 text-gray-300 font-semibold mb-2">
                <HardDrive className="w-4 h-4 text-orange-400" />
                <span>Espaço de Arquivos</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-[980px] overflow-hidden mb-2">
                <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[980px]"></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Acesso Ilimitado de Alta Velocidade para Alunos Compor HUB.
              </p>
            </div>

          </aside>

          {/* Main Files Area */}
          <main className="flex-1 min-w-0 bg-zinc-950/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
            
            {/* Explorer Header */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white capitalize flex items-center gap-2">
                  <span>
                    {activeFolder === 'downloads' 
                      ? (typeFilter !== 'all' ? `Filtro: ${typeFilter.toUpperCase()}` : 'Todos os Materiais') 
                      : activeFolder}
                  </span>
                </h2>
                <span className="text-xs font-mono px-3 py-1 rounded-[980px] bg-white/10 text-orange-400 font-bold">
                  {displayedFiles.length} {displayedFiles.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {(searchTerm || typeFilter !== 'all' || activeFolder !== 'downloads') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setActiveFolder('downloads');
                      showToast('Filtros redefinidos.', 'info');
                    }}
                    className="px-4 py-2 rounded-[980px] text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Limpar Filtros</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    showToast('Materiais organizados por relevância.', 'success');
                    setSortBy('type');
                    setSortAsc(true);
                  }}
                  className="px-4 py-2 rounded-[980px] text-xs font-bold bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ordenar por Tipo</span>
                </button>
              </div>
            </div>

            {/* Files Content: Grid or List */}
            <div className="flex-1 overflow-y-auto">
              
              {/* EMPTY STATE */}
              {displayedFiles.length === 0 ? (
                <div className="py-32 text-center text-gray-400 px-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-orange-400">
                    <Folder className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Nenhum material encontrado</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    Não encontramos arquivos correspondentes aos filtros selecionados. Tente ajustar o termo de pesquisa ou limpar os filtros.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setActiveFolder('downloads');
                    }}
                    className="px-6 py-2.5 rounded-[980px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25"
                  >
                    Ver Todos os Arquivos
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="p-6 space-y-8">
                  
                  {/* Category Fast-Folders (When in All or Category View) */}
                  {activeFolder === 'downloads' && typeFilter === 'all' && !searchTerm && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-orange-400" />
                        <span>Pastas por Módulo</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                        {categories.map(cat => {
                          const count = allFiles.filter(f => f.course.category === cat).length;
                          return (
                            <div
                              key={cat}
                              onClick={() => setActiveFolder(cat)}
                              className="bg-zinc-900/60 hover:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                                  <Folder className="w-5 h-5 fill-orange-500/20" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                                    {cat}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{count} arquivos</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Material Cards Grid */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-orange-400" />
                      <span>Arquivos para Download</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {displayedFiles.map(file => {
                        const isSelected = selectedItem?.id === file.id;
                        const isDownloading = downloadingId === file.id;

                        return (
                          <div
                            key={file.id}
                            onClick={() => setSelectedItem(file)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className={`bg-zinc-900/60 hover:bg-zinc-900 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl flex flex-col justify-between group ${
                              isSelected 
                                ? 'ring-2 ring-orange-500 bg-zinc-900' 
                                : ''
                            }`}
                          >
                            {/* Card Header with Icon */}
                            <div className="p-4 bg-black/20 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {renderFileIcon(file.type, "w-6 h-6")}
                                <div>
                                  <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                    {file.type}
                                  </span>
                                  <span className="text-[11px] font-mono text-gray-500 ml-2">
                                    {file.size}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewItem(file);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Pré-visualizar detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-orange-400 transition-colors leading-snug mb-1.5">
                                  {file.name}
                                </h4>
                                <p className="text-xs text-gray-400 line-clamp-1 font-medium flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                  <span className="truncate">{file.course.title}</span>
                                </p>
                                {file.lessonTitle && (
                                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 font-normal">
                                    Aula: {file.lessonTitle}
                                  </p>
                                )}
                              </div>

                              {/* Card Footer Actions */}
                              <div className="pt-3 flex items-center justify-between gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayCourse(file.course);
                                  }}
                                  className="text-xs text-gray-400 hover:text-orange-400 flex items-center gap-1 transition-colors truncate"
                                  title="Assistir aula associada"
                                >
                                  <Play className="w-3 h-3 text-orange-400 shrink-0" />
                                  <span className="truncate">Ver Aula</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  disabled={isDownloading}
                                  className="px-4 py-2 rounded-[980px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all shrink-0"
                                >
                                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                                  <span>{isDownloading ? 'Baixando...' : 'Baixar'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                /* LIST VIEW (TABLE) */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/60 text-xs font-bold uppercase tracking-wider text-gray-400 select-none sticky top-0 z-10 backdrop-blur-md">
                      
                      <th 
                        onClick={() => handleSort('name')}
                        className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Nome do Arquivo</span>
                          {sortBy === 'name' && (
                            <span className="text-orange-400 font-bold">{sortAsc ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>

                      <th className="py-4 px-6 hidden md:table-cell">
                        <span>Curso / Trilha</span>
                      </th>

                      <th className="py-4 px-6 text-center w-36">
                        <span>Ações</span>
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5 text-sm font-medium">
                    {displayedFiles.map((file) => {
                      const isSelected = selectedItem?.id === file.id;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => setSelectedItem(file)}
                          onContextMenu={(e) => handleContextMenu(e, file)}
                          className={`group transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-orange-500/10'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Name column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              {renderFileIcon(file.type, "w-6 h-6")}
                              
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold transition-colors truncate text-sm ${
                                    isSelected ? 'text-orange-400' : 'text-white group-hover:text-orange-400'
                                  }`}>
                                    {file.name}
                                  </span>
                                </div>

                                {file.lessonTitle && (
                                  <p className="text-xs text-gray-400 truncate mt-0.5 font-normal">
                                    Aula: {file.lessonTitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Course / Owner */}
                          <td className="py-4 px-6 hidden md:table-cell text-gray-300">
                            <span className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-[980px] text-xs font-semibold text-gray-300">
                              <BookOpen className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{file.course.title}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(file);
                                }}
                                className="p-2 rounded-[980px] bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white transition-all shadow-sm"
                                title="Baixar arquivo"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewItem(file);
                                }}
                                className="p-2 rounded-[980px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPlayCourse(file.course);
                                }}
                                className="p-2 rounded-[980px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 transition-colors"
                                title="Assistir aula"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>

            {/* Table Footer */}
            <div className="p-4 px-6 bg-black/40 flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold">{displayedFiles.length} item(s) listados</span>
              <span className="hidden sm:inline">Dica: Clique com o botão direito para o menu de ações rápido</span>
            </div>

          </main>

        </div>

      </div>

      {/* QUICK PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/15 rounded-[12px] max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {renderFileIcon(previewItem.type)}
                <div>
                  <h3 className="text-base font-bold text-white truncate max-w-xs">{previewItem.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">{previewItem.size} • {previewItem.type}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-[8px] bg-zinc-900 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Trilha:</span>
                  <span className="text-white font-semibold">{previewItem.course.title}</span>
                </div>
                {previewItem.lessonTitle && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Aula:</span>
                    <span className="text-white font-semibold">{previewItem.lessonTitle}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Instrutor:</span>
                  <span className="text-orange-400 font-semibold">{previewItem.course.instructor.name}</span>
                </div>
              </div>

              {previewItem.description && (
                <div className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-[8px] border border-white/10">
                  {previewItem.description}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  onPlayCourse(previewItem.course);
                  setPreviewItem(null);
                }}
                className="px-5 py-2.5 rounded-[980px] bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 text-orange-400" />
                <span>Assistir Aula</span>
              </button>

              <button
                onClick={() => {
                  handleDownload(previewItem);
                  setPreviewItem(null);
                }}
                className="px-6 py-2.5 rounded-[980px] bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Material</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu Popup */}
      {contextMenu.visible && contextMenu.item && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-60 bg-zinc-950 border border-white/15 rounded-[12px] shadow-2xl py-2 text-xs text-gray-200 animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          
          <button
            onClick={() => handleDownload(contextMenu.item!)}
            className="w-full text-left px-4 py-2.5 hover:bg-orange-500 hover:text-white flex items-center gap-2.5 transition-colors font-bold text-orange-400"
          >
            <Download className="w-4 h-4" />
            <span>Fazer Download</span>
          </button>

          <button
            onClick={() => {
              onPlayCourse(contextMenu.item!.course);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium text-white"
          >
            <Play className="w-4 h-4 text-orange-400" />
            <span>Assistir Aula do Curso</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + contextMenu.item!.url);
              showToast('Link do arquivo copiado!', 'info');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium text-gray-300"
          >
            <Copy className="w-4 h-4 text-gray-400" />
            <span>Copiar Link do Arquivo</span>
          </button>

          <div className="h-px bg-white/10 my-1"></div>

          <button
            onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
            className="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <span>Fechar</span>
          </button>

        </div>
      )}

    </div>
  );
};
