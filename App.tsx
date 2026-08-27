import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CourseGrid } from './components/CourseGrid';
import { ManageCourses } from './pages/ManageCourses';
import { MaterialsPage } from './pages/MaterialsPage';
import { CoursePlayerModal } from './components/CoursePlayerModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Course } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'professor' | 'student' }> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'professor' ? '/gerenciar' : '/'} replace />;
  }

  return <>{children}</>;
};

// Home component
interface HomeProps {
  onPlay: (course: Course) => void;
}

const Home: React.FC<HomeProps> = ({ onPlay }) => {
  return (
    <main>
      <Hero onPlay={onPlay} />
      <CourseGrid onCourseSelect={onPlay} />
    </main>
  );
};

function AppContent() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 selection:text-white">
      {/* Navbar with Direct Materials Hub Trigger */}
      <Navbar 
        onPlay={setSelectedCourse} 
      />
      
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              onPlay={setSelectedCourse} 
            />
          } 
        />
        
        {/* Full Dedicated Materials & Downloads Page */}
        <Route 
          path="/materiais" 
          element={
            <MaterialsPage 
              onPlayCourse={setSelectedCourse} 
            />
          } 
        />

        {/* Professor Route - Protected */}
        <Route 
          path="/gerenciar" 
          element={
            <ProtectedRoute allowedRole="professor">
              <ManageCourses />
            </ProtectedRoute>
          } 
        />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Player Modal */}
      <CoursePlayerModal 
        course={selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
      />
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-[#070709]">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Compor HUB</span>
            <span className="text-gray-600">|</span>
            <span>Portal de Cursos & Central de Downloads</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs text-gray-500">
            <span>&copy; {new Date().getFullYear()} Compor HUB. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
