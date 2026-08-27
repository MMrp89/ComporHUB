import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  User as UserIcon, 
  Lightbulb, 
  Paperclip, 
  Lock, 
  Unlock, 
  ListVideo, 
  Play, 
  Download, 
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Check,
  Share2,
  FileText
} from 'lucide-react';
import { Course, Comment, Lesson, Attachment } from '../types';
import { useAuth } from '../context/AuthContext';
import { getComments, saveComment, saveProgress, incrementViews } from '../services/db';
import { LoginModal } from './LoginModal';
import { MaterialCard } from './MaterialCard';

interface CoursePlayerModalProps {
  course: Course | null;
  onClose: () => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({ course, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlist' | 'materials' | 'discussion'>('playlist');
  const [copiedLink, setCopiedLink] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load course data & completed lessons from storage
  useEffect(() => {
    if (course) {
      incrementViews(course.id);
      getComments(course.id).then(setComments);
      setCurrentProgress(course.progress || 0);
      
      // Load completed lessons from localStorage
      const storageKey = `course_${course.id}_completed_lessons`;
      const savedCompleted = localStorage.getItem(storageKey);
      if (savedCompleted) {
        try {
          setCompletedLessonIds(JSON.parse(savedCompleted));
        } catch (e) {
          setCompletedLessonIds([]);
        }
      } else if (course.progress && course.progress > 0 && course.lessons && course.lessons.length > 0) {
        // Initial demo completion based on progress
        const count = Math.ceil((course.progress / 100) * course.lessons.length);
        const initialCompleted = course.lessons.slice(0, count).map(l => l.id);
        setCompletedLessonIds(initialCompleted);
        localStorage.setItem(storageKey, JSON.stringify(initialCompleted));
      }
      
      // Select first lesson by default
      if (course.lessons && course.lessons.length > 0) {
        setCurrentLesson(course.lessons[0]);
      }
    }
  }, [course]);

  // Persist completed lessons and recalculate progress
  const updateCompletedLessons = (newCompleted: string[]) => {
    setCompletedLessonIds(newCompleted);
    if (course) {
      localStorage.setItem(`course_${course.id}_completed_lessons`, JSON.stringify(newCompleted));
      if (course.lessons && course.lessons.length > 0) {
        const percent = Math.round((newCompleted.length / course.lessons.length) * 100);
        setCurrentProgress(percent);
        saveProgress(course.id, percent);
      }
    }
  };

  const toggleLessonCompleted = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      const updated = completedLessonIds.filter(id => id !== lessonId);
      updateCompletedLessons(updated);
    } else {
      const updated = [...completedLessonIds, lessonId];
      updateCompletedLessons(updated);
    }
  };

  // Video finished automatically -> mark lesson as completed
  const handleVideoEnded = () => {
    if (currentLesson && !completedLessonIds.includes(currentLesson.id)) {
      const updated = [...completedLessonIds, currentLesson.id];
      updateCompletedLessons(updated);
    }

    // Auto-advance to next lesson if available
    if (course?.lessons && currentLesson) {
      const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex >= 0 && currentIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentIndex + 1];
        if (nextLesson.isFree || user) {
          setTimeout(() => {
            setCurrentLesson(nextLesson);
          }, 1000);
        }
      }
    }
  };

  // Track video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0) {
        const percent = Math.round((currentTime / duration) * 100);
        // Automatically mark as complete when reaching 95%+
        if (percent >= 95 && currentLesson && !completedLessonIds.includes(currentLesson.id)) {
          const updated = [...completedLessonIds, currentLesson.id];
          updateCompletedLessons(updated);
        }
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !course) return;

    const comment: Comment = {
      id: Date.now().toString(),
      courseId: course.id,
      lessonId: currentLesson?.id,
      user: user?.name || 'Aluno Convidado',
      text: newComment,
      date: new Date().toLocaleDateString('pt-BR')
    };

    await saveComment(comment);
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const changeLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Collect all downloadable materials for this course (Global + All Lessons)
  const allCourseAttachments: Array<{ attachment: Attachment; source: string }> = [];
  
  if (course?.attachments) {
    course.attachments.forEach(att => {
      allCourseAttachments.push({ attachment: att, source: 'Material Geral do Curso' });
    });
  }

  if (course?.lessons) {
    course.lessons.forEach(l => {
      if (l.attachments) {
        l.attachments.forEach(att => {
          allCourseAttachments.push({ attachment: att, source: l.title });
        });
      }
    });
  }

  const currentLessonAttachments = currentLesson?.attachments || [];

  // Access Control Logic
  const canWatch = currentLesson && (currentLesson.isFree || user);

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] text-white overflow-y-auto animate-fade-in-up">
      {/* Top Bar Floating Controls */}
      <div className="fixed top-0 left-0 right-0 p-4 md:p-6 z-30 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-[980px] border border-white/10">
          <span className="w-2 h-2 rounded-[980px] bg-orange-500 animate-pulse"></span>
          <span className="text-caption font-semibold tracking-caption text-gray-200 truncate max-w-[200px] md:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-body-sm font-semibold tracking-body-sm px-4 py-2.5 rounded-[980px] transition-all active:scale-95 shadow-xl"
            title="Copiar Link"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>

          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2.5 rounded-[980px] transition-all active:scale-95 text-white shadow-xl"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto min-h-screen pt-16 md:pt-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8">
          
          {/* Main Left Column: Video & Lesson Details */}
          <div className="flex-1 lg:max-w-[65%] xl:max-w-[68%]">
            
            {/* Video Player Section */}
            <div className="w-full aspect-video bg-black rounded-[8px] overflow-hidden relative shadow-xl border border-white/10 group">
              {canWatch ? (
                <video 
                  key={currentLesson?.id}
                  ref={videoRef}
                  src={currentLesson?.videoUrl} 
                  className="w-full h-full object-contain rounded-[8px]"
                  controls
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              ) : (
                // Locked State
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-10 text-center p-6 rounded-[8px]">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-[8px] mb-4 text-orange-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="font-display text-subheading md:text-heading-sm font-bold tracking-heading-sm leading-heading-sm mb-2">Aula Exclusiva (Pro)</h2>
                  <p className="text-body-sm font-normal text-gray-400 mb-6 max-w-md leading-body-sm tracking-body-sm">
                    Esta aula e seus materiais de download complementares estão disponíveis para membros. Faça login para continuar assistindo.
                  </p>
                  <button 
                    onClick={() => setShowLoginPrompt(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-body-sm font-semibold tracking-body-sm px-8 py-3 rounded-[980px] transition-all shadow-xl shadow-orange-500/25 active:scale-95"
                  >
                    Fazer Login para Acessar
                  </button>
                </div>
              )}
            </div>

            {/* Current Lesson Header Info */}
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 text-caption font-semibold uppercase tracking-caption text-orange-400">
                  <span>{course.category}</span>
                  <span className="w-1 h-1 rounded-[980px] bg-zinc-700"></span>
                  <span className="text-gray-400">{currentLesson?.duration || '15m'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark as completed toggle button */}
                  {currentLesson && (
                    <button
                      onClick={() => toggleLessonCompleted(currentLesson.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[980px] transition-all active:scale-95 ${
                        completedLessonIds.includes(currentLesson.id)
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold'
                          : 'bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-gray-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completedLessonIds.includes(currentLesson.id) ? 'Aula Concluída' : 'Concluir Aula'}</span>
                    </button>
                  )}

                  {/* Direct Button to Materials Tab if Available */}
                  {allCourseAttachments.length > 0 && (
                    <button
                      onClick={() => setActiveTab('materials')}
                      className="inline-flex items-center gap-2 text-caption font-semibold tracking-caption bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-3.5 py-1.5 rounded-[980px] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{allCourseAttachments.length} {allCourseAttachments.length === 1 ? 'Material' : 'Materiais'}</span>
                    </button>
                  )}
                </div>
              </div>

              <h1 className="font-display text-subheading sm:text-heading-sm md:text-heading font-bold tracking-heading leading-heading text-white mb-3">
                {currentLesson?.title || course.title}
              </h1>

              <p className="text-body-sm sm:text-body text-gray-300 leading-body tracking-body font-normal mb-6">
                {currentLesson?.description || course.description}
              </p>

              {/* Lesson Specific Quick Downloads (if present) */}
              {currentLessonAttachments.length > 0 && (
                <div className="p-6 rounded-[8px] bg-zinc-900/80 border border-orange-500/20 mb-8 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-caption font-semibold uppercase tracking-caption text-orange-400 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Downloads Desta Aula
                    </h4>
                    <span className="text-caption font-mono text-gray-400">
                      {currentLessonAttachments.length} {currentLessonAttachments.length === 1 ? 'arquivo' : 'arquivos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentLessonAttachments.map(att => (
                      <MaterialCard key={att.id} attachment={att} compact />
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Key Takeaways / Tips */}
              {course.tips && course.tips.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[8px] p-6 mb-8 shadow-xl">
                  <h3 className="font-display text-subheading font-bold text-white mb-4 flex items-center gap-2.5 tracking-subheading leading-subheading">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Recomendações Práticas do Instrutor
                  </h3>
                  <ul className="space-y-3">
                    {course.tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-gray-300 text-body-sm font-normal leading-body-sm tracking-body-sm">
                        <span className="block w-2 h-2 rounded-[980px] bg-orange-500 mt-2 shrink-0"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Tabs for Playlist, Materials, and Discussion */}
          <div className="lg:w-[35%] xl:w-[32%] shrink-0 flex flex-col space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex items-center justify-between bg-zinc-950/90 p-1.5 rounded-[980px] border border-white/10 shadow-xl gap-1">
              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-[980px] text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'playlist'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListVideo className="w-3.5 h-3.5 shrink-0" />
                <span>Aulas ({course.lessons.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-[980px] text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'materials'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Downloads ({allCourseAttachments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('discussion')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-[980px] text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'discussion'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Dúvidas ({comments.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: Playlist */}
            {activeTab === 'playlist' && (
              <div className="bg-zinc-950/80 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Trilha de Aulas</span>
                  <span className="text-xs text-orange-400 font-mono font-bold">{course.duration}</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {course.lessons.map((lesson, index) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    const isLocked = !lesson.isFree && !user;
                    const hasAttachments = lesson.attachments && lesson.attachments.length > 0;
                    
                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => changeLesson(lesson)}
                        className={`
                          group flex items-start gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all border
                          ${isActive 
                            ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-md shadow-orange-500/10' 
                            : isCompleted
                              ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-300 shadow-sm'
                              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-transparent text-gray-200'
                          }
                          ${isLocked ? 'opacity-70' : 'opacity-100'}
                        `}
                      >
                        {/* Status Icon */}
                        <div className="mt-0.5 shrink-0">
                          {isActive ? (
                            <div className="p-2 rounded-lg bg-orange-500 text-white shadow-md">
                              <Play className="w-3.5 h-3.5 fill-white" />
                            </div>
                          ) : isCompleted ? (
                            <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isLocked ? (
                            <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-white/5 text-gray-400 font-mono text-xs font-bold w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                            isActive 
                              ? 'text-orange-400 font-bold' 
                              : isCompleted 
                                ? 'text-emerald-300 group-hover:text-emerald-200 font-semibold' 
                                : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-normal">
                            <span>{lesson.duration}</span>
                            
                            {isCompleted && (
                              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Concluída
                              </span>
                            )}

                            {lesson.isFree ? (
                              <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Grátis</span>
                            ) : (
                              <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Exclusiva</span>
                            )}
                            {hasAttachments && (
                              <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-md font-bold">
                                <Paperclip className="w-2.5 h-2.5" />
                                {lesson.attachments!.length} anexo(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Materials & Downloads */}
            {activeTab === 'materials' && (
              <div className="bg-zinc-950/80 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white">Materiais para Download</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Arquivos anexados a este curso</p>
                  </div>
                  <span className="text-xs bg-orange-500/15 text-orange-400 font-bold px-2.5 py-1 rounded-full">
                    {allCourseAttachments.length} Total
                  </span>
                </div>

                {allCourseAttachments.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Download className="w-8 h-8 mx-auto mb-2 opacity-30 text-orange-400" />
                    <p className="text-xs text-gray-400">Nenhum material cadastrado para este curso ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {allCourseAttachments.map((item, idx) => (
                      <div key={`${item.attachment.id}-${idx}`} className="space-y-1.5">
                        <span className="text-xs text-gray-400 font-semibold px-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          {item.source}
                        </span>
                        <MaterialCard attachment={item.attachment} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Discussion */}
            {activeTab === 'discussion' && (
              <div className="bg-zinc-950/80 rounded-2xl p-5 flex flex-col space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5">Dúvidas & Comentários</h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Faça uma pergunta sobre a aula..." : "Faça login para comentar"}
                    disabled={!user}
                    className="flex-1 bg-zinc-900/90 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || !user}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">Nenhum comentário ainda. Seja o primeiro a perguntar!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-3 rounded-xl bg-zinc-900/90 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-200">{c.user}</span>
                          <span className="text-gray-500 font-mono text-[11px]">{c.date}</span>
                        </div>
                        <p className="text-xs text-gray-300 font-normal leading-relaxed">{c.text}</p>
                        
                        {c.reply && (
                          <div className="mt-2 pl-3 border-l-2 border-orange-500 text-xs bg-white/[0.02] p-2 rounded-r-lg">
                            <span className="font-bold text-orange-400 uppercase text-[10px]">Instrutor:</span>
                            <p className="text-gray-300 text-xs mt-0.5">{c.reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      <LoginModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
};
