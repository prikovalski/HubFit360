
import { Button } from "@/components/ui/button";
import { Plus, User, Sparkles } from 'lucide-react';
import CreditsWidget from '@/components/credits/CreditsWidget';

interface DashboardHeaderProps {
  userName: string;
  onNewAssessment: () => void;
  onUserProfile: () => void;
  onBuyCredits: () => void;
}

const DashboardHeader = ({ userName, onNewAssessment, onUserProfile, onBuyCredits }: DashboardHeaderProps) => {
  return (
    <div className="space-y-6 mb-8">
      <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg relative group">
              <User className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-green-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Olá, {userName}!
              </h1>
              <p className="text-gray-600 font-medium">Suas avaliações físicas</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onNewAssessment}
              className="btn-modern-green text-white px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-bold group neon-accent-green"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nova Avaliação
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80">
        <CreditsWidget 
          onBuyCredits={onBuyCredits}
          onViewHistory={() => console.log('Ver histórico de créditos')}
          showActions={true}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
