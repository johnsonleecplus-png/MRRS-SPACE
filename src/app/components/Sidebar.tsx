import { useEffect, useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddWebsite: (website: any) => Promise<boolean>;
  onEdit: (website: any) => Promise<boolean>;
  isEditMode: boolean;
  editWebsite: any;
  onEditModeChange: (mode: boolean) => void;
  onEditWebsiteChange: (website: any) => void;
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

export function Sidebar({ activeCategory, onCategoryChange, onAddWebsite, onEdit, isEditMode, editWebsite, onEditModeChange, onEditWebsiteChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminTokenInput, setAdminTokenInput] = useState('');
  const [adminAuthed, setAdminAuthed] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const refreshAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/status', { credentials: 'same-origin' });
      if (!res.ok) return;
      const json = await res.json();
      setAdminAuthed(Boolean(json?.authed));
    } catch (err) {
      console.error('[adminStatus]', err);
    }
  };

  useEffect(() => {
    refreshAdminStatus();
  }, []);

  const adminLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminTokenInput }),
      });
      if (!res.ok) {
        toast.error('管理员登录失败');
        return;
      }
      toast.success('管理员登录成功');
      setAdminTokenInput('');
      setAdminDialogOpen(false);
      refreshAdminStatus();
    } catch (err) {
      console.error('[adminLogin]', err);
      toast.error('管理员登录失败');
    }
  };

  const adminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
      setAdminAuthed(false);
      toast.success('已退出管理员');
    } catch (err) {
      console.error('[adminLogout]', err);
      setAdminAuthed(false);
      toast.error('退出失败，请重试');
    }
  };

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
            <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-11 mb-3"
                  onClick={() => refreshAdminStatus()}
                >
                  {adminAuthed ? '管理员已登录' : '管理员登录'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px] bg-white/95 backdrop-blur-xl border-gray-100 shadow-2xl rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">管理员登录</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    登录后才可添加、编辑、删除与同步。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  {adminAuthed ? (
                    <Button className="w-full rounded-xl h-11" variant="outline" onClick={adminLogout}>
                      退出管理员
                    </Button>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <Label className="text-gray-500 font-medium">管理口令</Label>
                        <Input
                          value={adminTokenInput}
                          onChange={(e) => setAdminTokenInput(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                          placeholder="输入 ADMIN_TOKEN"
                          type="password"
                        />
                      </div>
                      <Button className="w-full rounded-xl h-11" onClick={adminLogin} disabled={!adminTokenInput}>
                        登录
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <AddWebsiteDialog 
              onAdd={onAddWebsite} 
              onEdit={onEdit}
              categories={categories} 
              isEditMode={isEditMode}
              editWebsite={editWebsite}
              onEditModeChange={onEditModeChange}
              onEditWebsiteChange={onEditWebsiteChange}
            />
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
