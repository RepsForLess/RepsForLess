import {useState} from 'react';
import {Package} from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function ProductImage({src, alt, title, className = ''}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-[#1b1b20] to-zinc-950 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="h-8 w-8 text-[#CCFF00] mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-zinc-400">{title || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
