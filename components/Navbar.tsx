import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, Search, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { SearchModal } from './SearchModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { Course } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  onPlay: (course: Course) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPlay }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isMaterialsPage = location.pathname === '/materiais';
  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-4 ${
          scrolled || location.pathname !== '/'
            ? 'bg-[#09090b]/95 backdrop-blur-xl shadow-2xl shadow-black/80' 
            : 'bg-transparent bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 md:gap-8">
            <div 
              className="flex items-center gap-2 group cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Logo variant="dark" size="lg" />
            </div>

            {/* Quick Navigation Links */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-[980px] transition-colors ${
                  isHomePage
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Cursos
              </button>
              <button
                onClick={() => navigate('/materiais')}
                className={`px-4 py-2 rounded-[980px] transition-colors flex items-center gap-2 ${
                  isMaterialsPage
                    ? 'text-orange-400 bg-orange-500/15 font-semibold border border-orange-500/30'
                    : 'text-gray-400 hover:text-orange-400 hover:bg-white/5'
                }`}
              >
                <Folder className="w-4 h-4 text-orange-400" />
                <span>Biblioteca de Materiais</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search */}
            <button 
              onClick={() => setShowSearchModal(true)}
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 px-3.5 py-2.5 rounded-[980px] hover:bg-white/10 border border-transparent hover:border-white/10"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Buscar</span>
            </button>

            {!user ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all duration-300 px-6 py-2.5 rounded-[980px] text-sm font-bold text-white shadow-xl shadow-orange-500/25 shrink-0"
              >
                <UserIcon className="w-4 h-4 text-white" />
                <span>Entrar</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {user.role === 'professor' && (
                  <button 
                    onClick={() => navigate('/gerenciar')}
                    className={`text-sm font-semibold px-5 py-2.5 rounded-[980px] transition-colors ${
                      location.pathname === '/gerenciar' 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                        : 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    Painel do Instrutor
                  </button>
                )}

                <div className="h-4 w-[1px] bg-white/20 hidden sm:block"></div>

                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-gray-300 hidden md:block">
                    Olá, <strong className="text-white font-semibold">{user.name.split(' ')[0]}</strong>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all duration-300 px-4 py-2 rounded-[980px] border border-red-500/20 group text-xs font-semibold text-red-400"
                    title="Encerrar Sessão"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onPlay={onPlay} />
    </>
  );
};


