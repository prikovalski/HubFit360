
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
  progress?: number;
}

export const LoadingOverlay = ({ isVisible, text, className, progress }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <LoadingSpinner size="lg" text={text} className="mb-4" />
        
        {progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-[#019f80] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {progress !== undefined && (
          <p className="text-sm text-gray-600 text-center">
            {Math.round(progress)}% completo
          </p>
        )}
      </div>
    </div>
  );
};
