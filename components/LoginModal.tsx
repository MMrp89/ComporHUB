import React, { useState } from 'react';
import { X, Loader2, GraduationCap, School, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student'); // Default role
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate network delay for "premium" feel
    setTimeout(() => {
      // In a real app, the backend verifies credentials AND role matches.
      // Here we simulate checking if the user exists for that specific context.
      const success = login(email);
      setIsSubmitting(false);
      
      if (success) {
        onClose();
        if (email === 'admin@prof.com') {
             // Force check: if they selected student but logged in as admin credentials, redirect correctly or warn.
             // For UX simplicity here, we trust the credential mapping in AuthContext
             navigate('/gerenciar');
        } else {
             navigate('/');
        }
      } else {
        setError('Credenciais inválidas. Verifique o email ou a função selecionada.');
      }
    }, 800);
  };

  const handleDemoLogin = (roleType: UserRole) => {
    const demoEmail = roleType === 'professor' ? 'admin@prof.com' : 'aluno@test.com';
    setEmail(demoEmail);
    setPassword('demo123');
    setRole(roleType);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#1c1c1e] rounded-[8px] shadow-xl border border-white/10 p-6 md:p-8 animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-display text-heading-sm font-bold text-white mb-1.5 tracking-heading-sm leading-heading-sm">Compor HUB ID</h2>
          <p className="text-body-sm font-normal text-white/60 tracking-body-sm leading-body-sm">Acesse seu espaço de aprendizado e materiais</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-black/40 p-1 rounded-[8px] mb-6 border border-white/5 relative">
            {/* Sliding Background */}
            <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-500/20 rounded-[8px] transition-all duration-300 ease-out border border-orange-500/30 shadow-md ${role === 'student' ? 'left-1' : 'left-[calc(50%+4px)]'}`} 
            />
            
            <button 
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] relative z-10 transition-colors duration-300 ${role === 'student' ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-300'}`}
            >
                <GraduationCap className="w-4 h-4" />
                <span className="text-body-sm font-semibold tracking-body-sm">Aluno</span>
            </button>
            <button 
                type="button"
                onClick={() => setRole('professor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] relative z-10 transition-colors duration-300 ${role === 'professor' ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-300'}`}
            >
                <School className="w-4 h-4" />
                <span className="text-body-sm font-semibold tracking-body-sm">Instrutor</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 text-white placeholder:text-white/30 px-4 py-3 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/15 transition-all text-body tracking-body"
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 text-white placeholder:text-white/30 px-4 py-3 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/15 transition-all text-body tracking-body"
              />
            </div>
          </div>

          {/* Quick Demo Buttons */}
          <div className="flex gap-2 justify-center">
            <button
                type="button" 
                onClick={() => handleDemoLogin('student')}
                className="text-caption font-semibold tracking-caption text-orange-400 hover:text-orange-300 px-3 py-1 rounded-[980px] bg-orange-500/10 border border-orange-500/20 flex items-center gap-1 transition-colors"
            >
                <KeyRound className="w-3 h-3" /> Acesso Aluno (Demo)
            </button>
            <button 
                type="button" 
                onClick={() => handleDemoLogin('professor')}
                className="text-caption font-semibold tracking-caption text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-[980px] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1 transition-colors"
            >
                <KeyRound className="w-3 h-3" /> Acesso Instrutor (Demo)
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[8px] p-3">
                <p className="text-red-400 text-caption font-semibold tracking-caption text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black text-body-sm font-semibold tracking-body-sm py-3.5 rounded-[980px] hover:bg-gray-200 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};