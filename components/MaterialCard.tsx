import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileArchive, 
  FileCode, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Download, 
  ExternalLink,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import { Attachment, AttachmentType } from '../types';
import { useToast } from '../context/ToastContext';

interface MaterialCardProps {
  attachment: Attachment;
  onDownload?: (attachment: Attachment) => void;
  compact?: boolean;
}

export const getAttachmentIcon = (type: AttachmentType) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-6 h-6 text-rose-500 shrink-0" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />;
    case 'zip':
      return <FileArchive className="w-6 h-6 text-amber-400 shrink-0" />;
    case 'doc':
      return <FileText className="w-6 h-6 text-blue-400 shrink-0" />;
    case 'image':
      return <ImageIcon className="w-6 h-6 text-purple-400 shrink-0" />;
    case 'link':
      return <LinkIcon className="w-6 h-6 text-sky-400 shrink-0" />;
    default:
      return <Paperclip className="w-6 h-6 text-gray-400 shrink-0" />;
  }
};

export const getAttachmentBadge = (type: AttachmentType) => {
  switch (type) {
    case 'pdf':
      return { label: 'PDF', bg: 'bg-rose-500/15 text-rose-400 font-bold' };
    case 'spreadsheet':
      return { label: 'PLANILHA', bg: 'bg-emerald-500/15 text-emerald-400 font-bold' };
    case 'zip':
      return { label: 'PACOTE ZIP', bg: 'bg-amber-500/15 text-amber-400 font-bold' };
    case 'doc':
      return { label: 'DOCUMENTO', bg: 'bg-blue-500/15 text-blue-400 font-bold' };
    case 'image':
      return { label: 'IMAGEM / ASSET', bg: 'bg-purple-500/15 text-purple-400 font-bold' };
    case 'link':
      return { label: 'LINK EXTERNO', bg: 'bg-sky-500/15 text-sky-400 font-bold' };
    default:
      return { label: 'ARQUIVO', bg: 'bg-gray-500/15 text-gray-400 font-bold' };
  }
};

export const MaterialCard: React.FC<MaterialCardProps> = ({
  attachment,
  onDownload,
  compact = false,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);
  const { showDownloadToast, showToast } = useToast();
  const badge = getAttachmentBadge(attachment.type);

  const handleAction = (e: React.MouseEvent) => {
    setDownloaded(true);
    if (attachment.type === 'link') {
      showToast(`Acessando link "${attachment.name}"`, 'info');
    } else {
      showDownloadToast(attachment.name, attachment.size);
    }

    if (onDownload) {
      onDownload(attachment);
    }
    // If it has a real URL that is not '#', let the default anchor do its work
    if (!attachment.url || attachment.url === '#') {
      e.preventDefault();
      // Trigger a synthetic download notification reset
      setTimeout(() => setDownloaded(false), 3000);
    }
  };

  if (compact) {
    return (
      <a
        href={attachment.url || '#'}
        target={attachment.type === 'link' ? '_blank' : '_self'}
        rel="noreferrer"
        onClick={handleAction}
        className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 transition-all duration-200 group shadow-sm"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          <div className="shrink-0 group-hover:scale-110 transition-transform">
            {getAttachmentIcon(attachment.type)}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-white truncate">
              {attachment.name}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-normal text-gray-400 mt-0.5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${badge.bg}`}>
                {badge.label}
              </span>
              {attachment.size && <span className="font-mono">• {attachment.size}</span>}
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-2">
          {downloaded ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/15 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Baixado
            </span>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-orange-500 hover:text-white text-gray-200 px-3.5 py-1.5 rounded-lg transition-all active:scale-95"
            >
              {attachment.type === 'link' ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Acessar
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Baixar
                </>
              )}
            </button>
          )}
        </div>
      </a>
    );
  }

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 hover:shadow-xl transition-all duration-300 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="shrink-0 group-hover:scale-110 transition-transform">
            {getAttachmentIcon(attachment.type)}
          </div>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {attachment.name}
        </h4>
        
        {attachment.description && (
          <p className="text-xs font-normal text-gray-400 line-clamp-2 mb-4">
            {attachment.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
        <span className="text-xs font-mono text-gray-400 font-medium">
          {attachment.size || 'Disponível'}
        </span>

        <a
          href={attachment.url || '#'}
          target={attachment.type === 'link' ? '_blank' : '_self'}
          rel="noreferrer"
          onClick={handleAction}
          className="inline-flex items-center gap-2 text-xs font-bold text-black bg-white hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-md"
        >
          {attachment.type === 'link' ? (
            <>
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir Link
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              Baixar Arquivo
            </>
          )}
        </a>
      </div>
    </div>
  );
};
