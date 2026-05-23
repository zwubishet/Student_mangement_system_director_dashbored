import {
  BookOpen, FileText, Video, Link2, Clipboard, Bookmark, Bell, Folder,
  Globe, Pin, Download, Eye, Share2, ExternalLink,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ui } from '../../theme/tokens';

const ICON_MAP = {
  book: BookOpen,
  'book-open': BookOpen,
  'file-text': FileText,
  clipboard: Clipboard,
  file: FileText,
  bookmark: Bookmark,
  video: Video,
  bell: Bell,
  folder: Folder,
};

const TYPE_COLORS = {
  pdf: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  video: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  link: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  pptx: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  image: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
};

function ResourceIcon({ icon, fileType, size = 22 }) {
  const Icon = ICON_MAP[icon] || (fileType === 'video' ? Video : fileType === 'link' ? Link2 : FileText);
  return <Icon size={size} />;
}

export default function ResourceCard({
  resource,
  onOpen,
  onShare,
  onApprove,
  onReject,
  showAdminActions,
}) {
  const typeClass = TYPE_COLORS[resource.file_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

  return (
    <article className={`${ui.card} ${ui.cardHover} overflow-hidden flex flex-col`}>
      <div className={`h-28 flex items-center justify-center ${typeClass} relative`}>
        <ResourceIcon icon={resource.category_icon} fileType={resource.file_type} size={36} />
        {resource.is_pinned && (
          <span className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 shadow-sm">
            <Pin size={14} className="text-amber-500" />
          </span>
        )}
      </div>

      <div className="flex-1 px-4 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
          {resource.category_name}
        </p>
        <h3 className="font-black text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
          {resource.title}
        </h3>
        {resource.title_am && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{resource.title_am}</p>
        )}
        {resource.share_note && (
          <p className="text-xs mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-900/40">
            {resource.share_note}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {resource.grade_name && <Badge color="gray">{resource.grade_name}</Badge>}
          {resource.subject_name && <Badge color="gray">{resource.subject_name}</Badge>}
        </div>
        {resource.description && (
          <p className={`${ui.muted} text-xs mt-2 line-clamp-2`}>{resource.description}</p>
        )}
      </div>

      <footer className="px-4 pb-4 pt-2 flex flex-wrap items-center gap-2 mt-auto">
        <div className="flex items-center gap-3 text-xs text-slate-400 mr-auto">
          <span className="inline-flex items-center gap-1"><Eye size={12} /> {resource.view_count || 0}</span>
          <span className="inline-flex items-center gap-1"><Download size={12} /> {resource.download_count || 0}</span>
        </div>

        {resource.source === 'global' && <Badge color="blue">MoE</Badge>}
        {resource.is_pinned && <Badge color="yellow">Pinned</Badge>}
        {resource.status === 'pending' && <Badge color="yellow">Pending</Badge>}

        {showAdminActions && resource.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => onApprove?.(resource)}>Approve</Button>
            <Button size="sm" variant="ghost" onClick={() => onReject?.(resource)}>Reject</Button>
          </>
        )}

        {onShare && resource.status === 'published' && (
          <Button size="sm" variant="secondary" onClick={() => onShare(resource)}>
            <Share2 size={14} className="mr-1" /> Share
          </Button>
        )}

        <Button size="sm" onClick={() => onOpen?.(resource)}>
          {resource.file_type === 'link' ? <ExternalLink size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
          Open
        </Button>
      </footer>
    </article>
  );
}
