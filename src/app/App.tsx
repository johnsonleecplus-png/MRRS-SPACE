import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WebsiteCard } from './components/WebsiteCard';
import { websitesData as initialData } from './data/websites';
import { Search as SearchIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { storageService } from '../services/storage';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './components/ui/alert-dialog';

const STORAGE_KEY = 'websites_data_v1';

export default function Web() {
  const [activeCategory, setActiveCategory] = useState('design');
  const [searchQuery, setSearchQuery] = useState('');
  const [allWebsites, setAllWebsites] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editWebsite, setEditWebsite] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<{ website: any; category: string } | null>(null);
  
  const readLocal = () => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch (err) {
      console.error('[readLocal]', err);
      return null;
    }
  };
  const writeLocal = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[writeLocal]', err);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const adapter = storageService.getAdapter();
        if (adapter) {
          await adapter.init();
          const data = await adapter.load();
          
          if (data) {
            setAllWebsites(data);
            writeLocal(data);
            setBackendOk(true);
          } else {
            // If backend is empty, seed it with initial data
            await seedData();
          }
        } else {
          // No backend adapter configured, use local storage
          setBackendOk(false);
          const local = readLocal();
          if (local) {
            setAllWebsites(local);
          } else {
            setAllWebsites(initialData);
            writeLocal(initialData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Silent failure for backend, fallback to local
        setBackendOk(false);
        const local = readLocal();
        if (local) {
          setAllWebsites(local);
        } else {
          setAllWebsites(initialData);
          writeLocal(initialData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const seedData = async () => {
    try {
      const adapter = storageService.getAdapter();
      if (adapter) {
        const success = await adapter.save(initialData);
        if (success) {
          setBackendOk(true);
        }
      }
    } catch (error) {
      console.error('Failed to seed data:', error);
      setBackendOk(false);
    }
  };

  const currentWebsites = allWebsites[activeCategory as keyof typeof allWebsites] || [];

  const filteredWebsites = currentWebsites.filter((website: any) =>
    website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      design: '设计灵感',
      ai: '人工智能',
      video: '影视创作',
      programming: '代码编程',
      books: '书籍阅读',
      work: '高效工作',
      email: '邮箱服务',
      search: '搜索工具'
    };
    return titles[category] || category;
  };

  const syncToBackend = async (newData: any) => {
    if (!backendOk) return;
    try {
      const adapter = storageService.getAdapter();
      if (adapter) {
        const success = await adapter.save(newData);
        if (!success) {
          throw new Error('Sync failed');
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setBackendOk(false);
    }
  };

  const handleAddWebsite = async (newWebsite: any): Promise<boolean> => {
    const category = newWebsite.category;
    if (!category) return false;

    // Optimistic update
    let updatedData = { ...allWebsites };
    updatedData = {
      ...updatedData,
      [category]: [newWebsite, ...(updatedData[category as keyof typeof updatedData] || [])]
    };

    setAllWebsites(updatedData);
    writeLocal(updatedData);
    
    // Sync to backend
    await syncToBackend(updatedData);
    
    return true;
  };

  const handleDeleteWebsite = (website: any, category: string): void => {
    if (!category) return;
    setWebsiteToDelete({ website, category });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWebsite = async (): Promise<void> => {
    if (!websiteToDelete) return;

    const { website, category } = websiteToDelete;

    // Optimistic update
    let updatedData = { ...allWebsites };
    const list = updatedData[category as keyof typeof updatedData] || [];
    const filtered = (list as any[]).filter((item) => item.url !== website.url || item.name !== website.name);
    updatedData = { ...updatedData, [category]: filtered };

    setAllWebsites(updatedData);
    writeLocal(updatedData);
    toast.success('已删除');

    // Sync to backend
    await syncToBackend(updatedData);

    // Reset delete state
    setIsDeleteDialogOpen(false);
    setWebsiteToDelete(null);
  };

  const handleEditWebsite = (website: any, category: string): void => {
    setEditWebsite({ ...website, category });
    setIsEditMode(true);
  };

  const handleEditSubmit = async (updatedWebsite: any): Promise<boolean> => {
    const oldCategory = editWebsite.category;
    const newCategory = updatedWebsite.category;

    if (!newCategory) return false;

    // Optimistic update
    let updatedData = { ...allWebsites };

    // Remove from old category
    if (oldCategory) {
      const oldList = updatedData[oldCategory as keyof typeof updatedData] || [];
      const filteredOld = oldList.filter((item: any) => item.url !== editWebsite.url || item.name !== editWebsite.name);
      updatedData = { ...updatedData, [oldCategory]: filteredOld };
    }

    // Check for duplicates in new category (exclude current editing website)
    const newList = updatedData[newCategory as keyof typeof updatedData] || [];
    const existing = newList.find(item => 
      (item.url === updatedWebsite.url || item.name === updatedWebsite.name)
    );
    if (existing) {
      toast.error('该网站已存在');
      return false;
    }

    // Add to new category
    updatedData = {
      ...updatedData,
      [newCategory]: [updatedWebsite, ...newList.filter((item: any) => item.url !== updatedWebsite.url || item.name !== updatedWebsite.name)]
    };

    setAllWebsites(updatedData);
    writeLocal(updatedData);
    toast.success('编辑成功');

    // Sync to backend
    await syncToBackend(updatedData);

    // Reset edit state
    setIsEditMode(false);
    setEditWebsite(null);

    return true;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
        <Toaster position="top-center" />
        
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAddWebsite={handleAddWebsite}
          onEdit={handleEditSubmit}
          isEditMode={isEditMode}
          editWebsite={editWebsite}
          onEditModeChange={setIsEditMode}
          onEditWebsiteChange={setEditWebsite}
        />

        {/* Main Content */}
        <main className="lg:ml-80 min-h-screen transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
            {/* Header */}
            <header className="mb-12 relative">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    {getCategoryTitle(activeCategory)}
                  </h2>
                  <span className={backendOk ? 'text-green-600 text-xs font-medium' : 'text-amber-600 text-xs font-medium'}>
                    {backendOk ? '云端同步开启' : '离线保存（未连接云端）'}
                  </span>
                  <p className="text-base text-gray-500 max-w-2xl font-medium tracking-wide leading-relaxed">
                    探索精选的{getCategoryTitle(activeCategory)}资源，提升你的工作效率与创造力。
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-80 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索资源..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-xl border-none 
                             rounded-xl text-sm text-gray-900 placeholder-gray-400
                             shadow-[0_2px_10px_rgba(0,0,0,0.03)]
                             focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white
                             transition-all duration-300"
                  />
                </div>
              </div>
            </header>

            {/* Websites Grid */}
            <div className="relative min-h-[500px]">
               {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                 </div>
               ) : filteredWebsites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                  {filteredWebsites.map((website: any, index: number) => (
                    <WebsiteCard
                    key={`${website.name}-${index}`}
                    {...website}
                    onDelete={() => handleDeleteWebsite(website, activeCategory)}
                    onEdit={() => handleEditWebsite(website, activeCategory)}
                  />
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                    <SearchIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">未找到相关资源</h3>
                  <p className="text-gray-500 text-lg">
                    试试搜索其他关键词，或切换分类查看
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                你确定要删除 "{websiteToDelete?.website.name}" 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setWebsiteToDelete(null);
              }}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteWebsite} className="bg-red-600 hover:bg-red-700 text-white">
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
}
