
import { useState } from 'react';
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  sizes,
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div 
        className={cn("bg-gray-200 flex items-center justify-center text-gray-500", className)}
        style={{ width, height }}
        aria-label={`Erro ao carregar imagem: ${alt}`}
      >
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div 
          className={cn("absolute inset-0 bg-gray-200 animate-pulse rounded", className)}
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={priority ? 'eager' : loading}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
