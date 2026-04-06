import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Plus, Link2, Type, AlignLeft, Smile } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "./ui/utils";

interface AddWebsiteDialogProps {
  onAdd: (data: any) => Promise<boolean>;
  onEdit: (data: any) => Promise<boolean>;
  categories: { id: string; name: string }[];
  isEditMode: boolean;
  editWebsite: any;
  onEditModeChange: (mode: boolean) => void;
  onEditWebsiteChange: (website: any) => void;
}

const ICON_CATEGORIES = {
  '常用': ['🌐', '🔗', '🔖', '⭐', '🔥', '💡', '📍', '🚀', '⚡', '✨', '🌈', '💎', '🚩', '📌', '🔍', '⚙️'],
  '设计': ['🎨', '🖌️', '✒️', '📐', '🖼️', '🎭', '🧶', '🧵', '✂️', '📏', '🖍️', '📝', '💠', '🎯', '🧊', '🎡'],
  '技术': ['💻', '⌨️', '🖥️', '🖱️', '💾', '🔧', '🔨', '🧱', '🔌', '📡', '📱', '🤖', '🧠', '🧬', '🔬', '🧪'],
  '媒体': ['📺', '🎬', '🎵', '🎧', '📷', '📹', '🎙️', '📻', '🎮', '🎲', '🎺', '🎹', '🎸', '🥁', '📢', '🔔'],
  '办公': ['📁', '📂', '📄', '📊', '📈', '📅', '📎', '📦', '📇', '📠', '💼', '📮', '📧', '💬', '🤝', '👥'],
  '生活': ['🏠', '🛒', '🛍️', '🎁', '⏰', '⌚', '👓', '🎒', '🎓', '🧢', '👕', '👟', '🍔', '☕', '🚗', '✈️']
};

export function AddWebsiteDialog({ onAdd, onEdit, categories, isEditMode, editWebsite, onEditModeChange, onEditWebsiteChange }: AddWebsiteDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('常用');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    tags: '',
    icon: '🌐'
  });

  // 当editWebsite变化时，更新表单数据
  useEffect(() => {
    if (editWebsite) {
      setFormData({
        name: editWebsite.name || '',
        url: editWebsite.url || '',
        description: editWebsite.description || '',
        category: editWebsite.category || '',
        tags: editWebsite.tags ? editWebsite.tags.join(', ') : '',
        icon: editWebsite.icon || '🌐'
      });
      setOpen(true);
    }
  }, [editWebsite, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url || !formData.category) {
      toast.error("请填写完整信息");
      return;
    }

    const websiteData = {
      ...formData,
      tags: formData.tags.split(/[,，\s]+/).filter(Boolean),
      icon: formData.icon || '🌐'
    };

    let ok;
    if (isEditMode) {
      ok = await onEdit(websiteData);
    } else {
      ok = await onAdd(websiteData);
    }

    if (ok) {
      setOpen(false);
      setFormData({ name: '', url: '', description: '', category: '', tags: '', icon: '🌐' });
      setActiveTab('常用');
      toast.success(isEditMode ? "编辑成功！" : "添加成功！");
    } else {
      console.error(isEditMode ? "Edit failed" : "Add failed");
      toast.error("保存失败：请确认已管理员登录，且服务端已配置 ADMIN_TOKEN");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // 当对话框关闭时，重置编辑状态
      onEditModeChange(false);
      onEditWebsiteChange(null);
      setFormData({ name: '', url: '', description: '', category: '', tags: '', icon: '🌐' });
      setActiveTab('常用');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 
                     transition-all duration-300 rounded-xl h-12 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">添加新页面</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-gray-100 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{isEditMode ? '编辑页面' : '添加新页面'}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {isEditMode ? '修改下方信息更新网站信息。' : '填写下方信息将新网站添加到您的收藏中。'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-500 font-medium">名称</Label>
            <div className="relative">
              <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                placeholder="例如: Figma"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-gray-500 font-medium">链接</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-500 font-medium">图标</Label>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-3xl shadow-sm shrink-0">
                  {formData.icon}
                </div>
                <div className="relative flex-1">
                  <Smile className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="pl-9 bg-white border-gray-200 focus:bg-white transition-all rounded-xl"
                    placeholder="输入 Emoji 或从下方选择"
                    maxLength={2}
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-gray-100/80 rounded-lg overflow-x-auto no-scrollbar">
                  {Object.keys(ICON_CATEGORIES).map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                  <TabsContent key={category} value={category} className="mt-3">
                    <div className="grid grid-cols-8 gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110",
                            formData.icon === icon 
                              ? "bg-white shadow-md border border-gray-200 ring-2 ring-gray-900 ring-offset-1 z-10" 
                              : "hover:bg-white hover:shadow-sm"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-gray-500 font-medium">分类</Label>
            <div className="relative">
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="" disabled hidden>选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-gray-500 font-medium">描述</Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                placeholder="简短的描述..."
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags" className="text-gray-500 font-medium">标签</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
              placeholder="设计, 工具, 协作 (用逗号分隔)"
            />
          </div>

          <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 rounded-xl h-11 mt-2">
            {isEditMode ? '确认修改' : '确认添加'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
