
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const InstallPWAButton = () => {
  const { isInstallable, isInstalled, installPWA } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <Smartphone className="w-4 h-4" />
        <span>App instalado</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={installPWA}
      variant="outline"
      size="sm"
      className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
    >
      <Download className="w-4 h-4 mr-2" />
      Instalar App
    </Button>
  );
};

export default InstallPWAButton;
