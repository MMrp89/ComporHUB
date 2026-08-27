import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Settings, 
  Users, 
  BarChart, 
  Trash2, 
  Edit2, 
  X, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Loader2, 
  FileText, 
  FileSpreadsheet,
  FileArchive,
  Link as LinkIcon, 
  Paperclip, 
  Lightbulb, 
  ListVideo, 
  Check, 
  Lock, 
  Unlock, 
  UploadCloud, 
  Globe,
  Download
} from 'lucide-react';
import { Course, Comment, Attachment, Lesson, AttachmentType } from '../types';
import { useToast } from '../context/ToastContext';
import { getCourses, saveCourse, deleteCourse, getComments, saveComment } from '../services/db';
import { generateStudentReply } from '../services/ai';
import { CATEGORIES } from '../constants';
import { getAttachmentIcon, getAttachmentBadge } from '../components/MaterialCard';

// 1. Create/Edit Course Modal
const CourseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialData?: Course;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [instructor, setInstructor] = useState('Mário Morgado');
  const [instructorRole, setInstructorRole] = useState('Especialista em Performance');
  
  // Lesson Management
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // New Lesson State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonIsFree, setNewLessonIsFree] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'link'>('upload');
  const [selectedFileName, setSelectedFileName] = useState('');
  const lessonFileInputRef = useRef<HTMLInputElement>(null);

  // Tips & Global Attachments
  const [tips, setTips] = useState<string[]>([]);
  const [newTip, setNewTip] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // New Attachment State
  const [newAttName, setNewAttName] = useState('');
  const [newAttType, setNewAttType] = useState<AttachmentType>('pdf');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [newAttSize, setNewAttSize] = useState('');
  const [newAttDesc, setNewAttDesc] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setCategory(initialData.category);
        setThumbnailPreview(initialData.thumbnail);
        setInstructor(initialData.instructor || 'Mário Morgado');
        setInstructorRole(initialData.instructorRole || 'Especialista em Performance');
        setTips(initialData.tips || []);
        setAttachments(initialData.attachments || []);
        setLessons(initialData.lessons || []);
      } else {
        setTitle('');
        setDescription('');
        setCategory(CATEGORIES[0]);
        setThumbnailPreview('');
        setInstructor('Mário Morgado');
        setInstructorRole('Especialista em Performance');
        setTips([]);
        setAttachments([]);
        setLessons([]);
      }
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
    }
  };

  const handleLessonVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setNewLessonVideoUrl(objectUrl);
      setSelectedFileName(file.name);
      if (!newLessonDuration) setNewLessonDuration('15m');
    }
  };

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) {
      alert("Digite um título para a aula.");
      return;
    }
    if (!newLessonVideoUrl.trim()) {
      alert("Selecione um vídeo ou insira um link.");
      return;
    }

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle,
      duration: newLessonDuration || '15m',
      videoUrl: newLessonVideoUrl,
      isFree: newLessonIsFree,
      description: ''
    };

    setLessons([...lessons, newLesson]);
    
    setNewLessonTitle('');
    setNewLessonDuration('');
    setNewLessonVideoUrl('');
    setSelectedFileName('');
    setNewLessonIsFree(false);
    if (lessonFileInputRef.current) lessonFileInputRef.current.value = '';
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const toggleLessonAccess = (id: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, isFree: !l.isFree } : l));
  };

  const handleAddTip = () => {
    if (newTip.trim()) {
      setTips([...tips, newTip.trim()]);
      setNewTip('');
    }
  };

  const removeTip = (idx: number) => {
    setTips(tips.filter((_, i) => i !== idx));
  };

  const handleAddAttachment = () => {
    if (!newAttName.trim()) {
      alert("Informe o nome do arquivo para download.");
      return;
    }

    const att: Attachment = {
      id: `att-${Date.now()}`,
      name: newAttName.trim(),
      type: newAttType,
      url: newAttUrl.trim() || '#',
      size: newAttSize.trim() || '1.5 MB',
      description: newAttDesc.trim()
    };

    setAttachments([...attachments, att]);
    setNewAttName('');
    setNewAttSize('');
    setNewAttUrl('');
    setNewAttDesc('');
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lessons.length === 0) {
      alert("Adicione pelo menos uma aula à trilha.");
      return;
    }

    setIsSubmitting(true);
    
    const durationStr = `${lessons.length} Aulas`; 

    onSave({
      id: initialData?.id || `course-${Date.now()}`,
      title,
      description,
      category: category || CATEGORIES[0],
      thumbnail: thumbnailPreview || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      duration: durationStr,
      instructor,
      instructorRole,
      views: initialData?.views || 0,
      progress: initialData?.progress || 0,
      lessons: lessons,
      tips: tips,
      attachments: attachments
    });
    
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-[#141416] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl animate-fade-in-up max-h-[92vh] overflow-y-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Course Details, Tips & Downloads */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="flex justify-between items-center lg:hidden mb-2">
            <h2 className="text-xl font-bold text-white">{initialData ? 'Editar Curso' : 'Criar Curso'}</h2>
            <button onClick={onClose}><X className="text-white" /></button>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Imagem de Capa (16:9)</label>
            <div 
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <>
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-orange-500 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Alterar Capa</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="w-10 h-10 text-orange-400/60 mx-auto mb-2" />
                  <p className="text-gray-300 text-xs font-medium">Clique para selecionar imagem</p>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">Título do Curso</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Masterclass: Escala de Tráfego Pago"
                className="w-full bg-black/50 text-white text-base font-bold border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500/50"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">Instrutor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Nome do Instrutor"
                  className="w-full bg-black/50 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">Descrição do Curso</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="O que os alunos vão aprender e dominar neste curso?"
                className="w-full bg-black/50 text-white border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Downloadable Materials Section */}
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                Materiais Complementares ({attachments.length})
              </h3>
            </div>

            {/* Add attachment inputs */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="text" 
                  value={newAttName}
                  onChange={(e) => setNewAttName(e.target.value)}
                  placeholder="Nome do arquivo (ex: Planilha_ROAS.xlsx)"
                  className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
                />
                <select
                  value={newAttType}
                  onChange={(e) => setNewAttType(e.target.value as AttachmentType)}
                  className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="spreadsheet">Planilha</option>
                  <option value="zip">Pacote ZIP</option>
                  <option value="doc">Documento</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newAttSize}
                  onChange={(e) => setNewAttSize(e.target.value)}
                  placeholder="Tamanho (ex: 2.4 MB)"
                  className="w-28 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <input 
                  type="text" 
                  value={newAttDesc}
                  onChange={(e) => setNewAttDesc(e.target.value)}
                  placeholder="Breve descrição do material..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button 
                  type="button" 
                  onClick={handleAddAttachment}
                  className="bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg text-white text-xs font-bold shrink-0 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* List of Attachments */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-1">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getAttachmentIcon(att.type)}
                    <span className="text-gray-200 font-medium truncate">{att.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({att.size || '1 MB'})</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeAttachment(att.id)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lessons Builder */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="hidden lg:flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-white">
                {initialData ? 'Gerenciar Trilha & Aulas' : 'Estruturar Grade de Aulas'}
              </h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="bg-black/50 rounded-2xl border border-white/10 overflow-hidden mb-6">
              <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-orange-400" />
                  <h3 className="font-bold text-white text-sm">Grade do Curso</h3>
                </div>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-0.5 rounded-full text-xs font-bold">
                  {lessons.length} Aulas
                </span>
              </div>

              {/* Lesson List */}
              <div className="overflow-y-auto p-4 space-y-2.5 max-h-[300px]">
                {lessons.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500 space-y-2">
                    <ListVideo className="w-8 h-8 opacity-20 text-orange-400" />
                    <p className="text-xs">Nenhuma aula cadastrada ainda. Adicione abaixo.</p>
                  </div>
                )}
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-3 bg-white/[0.04] p-3 rounded-xl border border-white/5 group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 text-gray-400 font-mono text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-xs md:text-sm truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Video className="w-3 h-3 text-orange-400/70"/> {lesson.duration}</span>
                        {lesson.isFree ? (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded text-[9px] uppercase">GRÁTIS</span>
                        ) : (
                          <span className="text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded text-[9px] uppercase">EXCLUSIVA</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => toggleLessonAccess(lesson.id)}
                        className={`p-1.5 rounded-lg transition-colors ${lesson.isFree ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-purple-400 hover:bg-purple-500/10'}`}
                        title={lesson.isFree ? "Tornar Exclusiva para Membros" : "Tornar Grátis"}
                      >
                        {lesson.isFree ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button 
                        type="button"
                        onClick={() => removeLesson(lesson.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Lesson Form Box */}
              <div className="p-4 bg-zinc-950 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  Cadastrar Nova Aula
                </h4>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="Título da Aula (ex: 01. Configuração do Pixel)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                  <input 
                    type="text"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    placeholder="Duração (ex: 25m)"
                    className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                {/* Video Source Tabs */}
                <div className="flex gap-2 items-center">
                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button 
                      type="button"
                      onClick={() => setVideoSourceType('upload')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${videoSourceType === 'upload' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
                    >
                      Vídeo MP4
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVideoSourceType('link')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${videoSourceType === 'link' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
                    >
                      URL Externa
                    </button>
                  </div>

                  <div className="flex-1">
                    {videoSourceType === 'upload' ? (
                      <div 
                        onClick={() => lessonFileInputRef.current?.click()}
                        className="border border-dashed border-white/20 hover:border-orange-500/50 rounded-xl py-2 px-3 text-center cursor-pointer transition-all bg-white/[0.02]"
                      >
                        <input 
                          ref={lessonFileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleLessonVideoFileSelect}
                        />
                        <span className="text-xs text-gray-300 truncate block">
                          {selectedFileName ? `Arquivo: ${selectedFileName}` : 'Selecionar arquivo de vídeo'}
                        </span>
                      </div>
                    ) : (
                      <input 
                        type="text"
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        placeholder="https://commondatastorage.googleapis.com/...mp4"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={handleAddLesson}
                    className="bg-white hover:bg-orange-500 hover:text-white text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shrink-0"
                  >
                    Adicionar Aula
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-orange-500/25"
            >
              {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações no Curso' : 'Publicar Curso & Materiais')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'comments'>('courses');
  const [allComments, setAllComments] = useState<{comment: Comment, courseTitle: string}[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const data = await getCourses();
    setCourses(data);
    
    // Load all comments
    const commentsAccumulator: {comment: Comment, courseTitle: string}[] = [];
    for (const c of data) {
      const courseComments = await getComments(c.id);
      courseComments.forEach(comm => {
        commentsAccumulator.push({ comment: comm, courseTitle: c.title });
      });
    }
    setAllComments(commentsAccumulator);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      await deleteCourse(id);
      showToast('Curso removido com sucesso!', 'success');
      loadData();
    }
  };

  const handleSave = async (course: Course) => {
    await saveCourse(course);
    showToast('Curso e materiais salvos com sucesso!', 'success');
    loadData();
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    const target = allComments.find(c => c.comment.id === commentId);
    if (target) {
      const updatedComment: Comment = {
        ...target.comment,
        reply: replyText,
        replyDate: new Date().toLocaleDateString('pt-BR')
      };
      await saveComment(updatedComment);
      showToast('Resposta enviada com sucesso!', 'success');
      setReplyingTo(null);
      setReplyText('');
      loadData();
    }
  };

  const handleGenerateAIReply = async (commentText: string, courseTitle: string) => {
    setIsGeneratingReply(true);
    try {
      const aiReply = await generateStudentReply(commentText, courseTitle);
      setReplyText(aiReply);
    } catch (e) {
      showToast('Erro ao gerar resposta com IA.', 'error');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Metrics
  const totalViews = courses.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0);
  const totalMaterials = courses.reduce((acc, c) => {
    const globalCount = c.attachments?.length || 0;
    const lessonCount = c.lessons.reduce((lAcc, l) => lAcc + (l.attachments?.length || 0), 0);
    return acc + globalCount + lessonCount;
  }, 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-caption text-orange-400 mb-2">
            <span>Compor HUB</span>
            <span>•</span>
            <span>Painel do Instrutor</span>
          </div>
          <h1 className="font-display text-subheading sm:text-heading-sm md:text-heading font-bold tracking-heading leading-heading">
            Gestão de Cursos & Materiais
          </h1>
          <p className="text-body-sm font-normal text-gray-400 mt-1 leading-body-sm tracking-body-sm">
            Cadastre videoaulas, organize trilhas e disponibilize arquivos de apoio para download.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-body-sm font-semibold tracking-body-sm px-6 py-3 rounded-[980px] shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Curso</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-zinc-900/60 border border-white/10 p-5 rounded-[8px] shadow-xl">
          <span className="text-caption text-gray-400 font-semibold uppercase tracking-caption">Total de Cursos</span>
          <p className="font-display text-subheading md:text-heading-sm font-bold text-white mt-1">{courses.length}</p>
        </div>
        <div className="bg-zinc-900/60 border border-white/10 p-5 rounded-[8px] shadow-xl">
          <span className="text-caption text-gray-400 font-semibold uppercase tracking-caption">Total de Aulas</span>
          <p className="font-display text-subheading md:text-heading-sm font-bold text-orange-400 mt-1">{totalLessons}</p>
        </div>
        <div className="bg-zinc-900/60 border border-white/10 p-5 rounded-[8px] shadow-xl">
          <span className="text-caption text-gray-400 font-semibold uppercase tracking-caption">Materiais para Download</span>
          <p className="font-display text-subheading md:text-heading-sm font-bold text-emerald-400 mt-1">{totalMaterials}</p>
        </div>
        <div className="bg-zinc-900/60 border border-white/10 p-5 rounded-[8px] shadow-xl">
          <span className="text-caption text-gray-400 font-semibold uppercase tracking-caption">Visualizações Acumuladas</span>
          <p className="font-display text-subheading md:text-heading-sm font-bold text-white mt-1">{totalViews.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-body-sm font-semibold tracking-body-sm transition-all border-b-2 ${
            activeTab === 'courses'
              ? 'border-orange-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Cursos Cadastrados ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 text-body-sm font-semibold tracking-body-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'comments'
              ? 'border-orange-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Dúvidas dos Alunos ({allComments.length})
        </button>
      </div>

      {/* Tab: Courses List */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => {
            const courseAttachments = (course.attachments?.length || 0) + course.lessons.reduce((acc, l) => acc + (l.attachments?.length || 0), 0);
            
            return (
              <div 
                key={course.id} 
                className="bg-zinc-900/80 border border-white/10 rounded-[8px] overflow-hidden flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300 group shadow-xl"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden bg-black rounded-t-[8px]">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-[980px] text-caption font-semibold uppercase tracking-caption text-white border border-white/10">
                      {course.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-subheading text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors tracking-subheading leading-subheading">
                      {course.title}
                    </h3>
                    <p className="text-caption text-gray-400 line-clamp-2 leading-caption tracking-caption font-normal mb-4">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 text-caption text-gray-400 pt-3 border-t border-white/5 font-semibold tracking-caption">
                      <span className="flex items-center gap-1 text-gray-300 font-semibold">
                        <Video className="w-3.5 h-3.5 text-orange-400" />
                        {course.lessons.length} Aulas
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-300 font-semibold">
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        {courseAttachments} Materiais
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[980px] bg-white/5 hover:bg-orange-500 hover:text-white text-body-sm font-semibold tracking-body-sm transition-colors text-gray-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar Conteúdo
                  </button>

                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2.5 rounded-[980px] bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Excluir Curso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Comments / Questions */}
      {activeTab === 'comments' && (
        <div className="space-y-4 max-w-4xl">
          {allComments.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-orange-400" />
              <p className="text-body-sm font-normal text-gray-400">Nenhuma dúvida enviada por alunos até o momento.</p>
            </div>
          ) : (
            allComments.map(({ comment, courseTitle }) => (
              <div key={comment.id} className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-caption text-orange-400 font-semibold uppercase tracking-caption">{courseTitle}</span>
                    <h4 className="font-semibold text-white text-body-sm tracking-body-sm">{comment.user}</h4>
                  </div>
                  <span className="text-caption text-gray-500 font-mono">{comment.date}</span>
                </div>

                <p className="text-body-sm text-gray-300 bg-black/30 p-3.5 rounded-[8px] border border-white/5 leading-body-sm tracking-body-sm font-normal">
                  {comment.text}
                </p>

                {comment.reply ? (
                  <div className="pl-4 border-l-2 border-orange-500 bg-white/[0.02] p-3 rounded-r-[8px]">
                    <span className="text-caption font-semibold text-orange-400 uppercase tracking-caption">Sua Resposta ({comment.replyDate}):</span>
                    <p className="text-body-sm text-gray-200 mt-1 leading-body-sm">{comment.reply}</p>
                  </div>
                ) : (
                  <div>
                    {replyingTo === comment.id ? (
                      <div className="space-y-3 pt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escreva a resposta para o aluno..."
                          className="w-full bg-black/60 border border-white/10 rounded-[8px] p-3 text-body-sm text-white focus:outline-none focus:border-orange-500/50 resize-none"
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleGenerateAIReply(comment.text, courseTitle)}
                            disabled={isGeneratingReply}
                            className="inline-flex items-center gap-1.5 text-body-sm text-orange-400 hover:text-orange-300 font-semibold"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isGeneratingReply ? 'Gerando com IA...' : 'Sugerir Resposta com IA'}
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="px-3.5 py-2 rounded-[980px] text-body-sm text-gray-400 hover:text-white font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSendReply(comment.id)}
                              className="px-5 py-2 rounded-[980px] bg-orange-500 hover:bg-orange-600 text-white text-body-sm font-semibold tracking-body-sm shadow-xl"
                            >
                              Enviar Resposta
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-body-sm font-semibold text-orange-400 hover:text-orange-300 tracking-body-sm"
                      >
                        Responder Dúvida &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CourseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingCourse}
      />
    </div>
  );
};
