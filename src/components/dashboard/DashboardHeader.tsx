
import { Button } from "@/components/ui/button";
import { LogOut, Plus, User } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  onNewAssessment: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({ userName, onNewAssessment, onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Olá, {userName}!</h1>
          <p className="text-gray-600">Suas avaliações físicas</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          onClick={onNewAssessment}
          className="bg-[#019f80] hover:bg-[#017a63] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Avaliação
        </Button>
        <Button 
          onClick={onLogout}
          variant="outline" 
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
