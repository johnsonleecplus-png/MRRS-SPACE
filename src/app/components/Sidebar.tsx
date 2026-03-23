import { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Film, 
  Code, 
  BookOpen, 
  Briefcase, 
  Mail, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { MarsLogo } from './MarsLogo';
import { AddWebsiteDialog } from './AddWebsiteDialog';
import { motion } from 'motion/react';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddWebsite: (website: any) => Promise<boolean>;
}

export const categories = [
  { id: 'design', name: '设计', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'ai', name: 'AI', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'video', name: '影视', icon: Film, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'programming', name: '编程', icon: Code, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'books', name: '书籍', icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'work', name: '工作', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'email', name: '邮箱', icon: Mail, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'search', name: '搜索', icon: Search, color: 'text-teal-500', bg: 'bg-teal-50' },
];

export function Sidebar({ activeCategory, onCategoryChange, onAddWebsite }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-80 bg-white/70 backdrop-blur-2xl border-r border-gray-200/50
          transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-10 px-2 pt-2">
            <MarsLogo />
          </div>

          {/* Categories */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsOpen(false);
                  }}
                  className={`
                    group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl
                    transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' 
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-xl transition-colors duration-300
                    ${isActive ? 'bg-white/20' : category.bg}
                  `}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : category.color}`} />
                  </div>
                  <span className="font-medium tracking-wide text-sm">{category.name}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer / Add Button */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <AddWebsiteDialog onAdd={onAddWebsite} categories={categories} />
            <p className="text-[10px] text-gray-400 text-center mt-6 font-medium tracking-wider uppercase">
              © 2025 MARS Collection
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}
