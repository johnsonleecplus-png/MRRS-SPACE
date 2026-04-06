import { ExternalLink, ArrowUpRight, Trash2, Edit3 } from 'lucide-react';

interface WebsiteCardProps {
  name: string;
  description: string;
  url: string;
  icon: string;
  tags?: string[];
  onDelete?: () => void;
  onEdit?: () => void;
}

export function WebsiteCard({ name, description, url, icon, tags, onDelete, onEdit }: WebsiteCardProps) {
  return (
    <div
      className="group relative flex flex-col h-full bg-white rounded-[2rem] p-6 
                 shadow-[0_2px_20px_rgba(0,0,0,0.04)] 
                 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] 
                 border border-gray-100/50 hover:border-gray-200
                 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden"
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-gray-100/80 
                        flex items-center justify-center text-3xl shadow-inner
                        transition-colors duration-500">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center
                       bg-white text-gray-400 hover:text-gray-900 hover:border-gray-300
                       transition-all duration-300"
            title="打开链接"
          >
            <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
          </a>
          {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center
                         bg-white text-gray-400 hover:text-blue-600 hover:border-blue-300
                         transition-all duration-300"
              title="编辑该页面"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center
                         bg-white text-gray-400 hover:text-red-600 hover:border-red-300
                         transition-all duration-300"
              title="删除该页面"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1.5 tracking-tight group-hover:text-black transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-50">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-[11px] font-semibold tracking-wide bg-gray-50 text-gray-500 
                         rounded-full border border-gray-100 group-hover:border-gray-200 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
