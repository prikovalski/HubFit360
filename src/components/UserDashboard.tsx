
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Download, Lock, CreditCard, Calendar, User } from 'lucide-react';
import ReportViewer from '@/components/ReportViewer';

const UserDashboard = ({ user, onLogout }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Mock data for user reports
  const reports = [
    {
      id: 1,
      date: '2024-01-15',
      status: 'paid',
      bodyFat: 15.2,
      leanMass: 84.8,
      bmi: 23.4,
      preview: {
        bodyFat: '15.2%',
        leanMass: '84.8%',
        bmi: '23.4',
        summary: 'Composição corporal dentro da faixa ideal para homens ativos...'
      }
    },
    {
      id: 2,
      date: '2024-01-28',
      status: 'free',
      bodyFat: 14.8,
      leanMass: 85.2,
      bmi: 23.2,
      preview: {
        bodyFat: '14.8%',
        leanMass: '85.2%',
        bmi: '23.2',
        summary: 'Melhora na composição corporal comparado à avaliação anterior...'
      }
    }
  ];

  if (selectedReport) {
    return <ReportViewer report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Olá, {user.name}!</h1>
              <p className="text-gray-600">Suas avaliações físicas</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#019f80] to-[#4ade80] text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reports.length}</div>
              <p className="text-white/80 text-sm">Avaliações realizadas</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Última Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#019f80]">IMC: {reports[0]?.bmi}</div>
              <p className="text-gray-600 text-sm">
                {new Date(reports[0]?.date).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+0.4%</div>
              <p className="text-gray-600 text-sm">Massa magra</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Histórico de Avaliações
            </CardTitle>
            <CardDescription>
              Acesse suas avaliações físicas e acompanhe seu progresso
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#019f80]/30"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Avaliação de {new Date(report.date).toLocaleDateString('pt-BR')}
                        </h3>
                        <Badge 
                          variant={report.status === 'paid' ? 'default' : 'secondary'}
                          className={report.status === 'paid' ? 'bg-[#019f80] hover:bg-[#017a63]' : ''}
                        >
                          {report.status === 'paid' ? 'Completo' : 'Gratuito'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Gordura Corporal:</span>
                          <div className="font-semibold text-[#019f80]">{report.preview.bodyFat}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Massa Magra:</span>
                          <div className="font-semibold text-[#019f80]">{report.preview.leanMass}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">IMC:</span>
                          <div className="font-semibold text-[#019f80]">{report.preview.bmi}</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {report.preview.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.status === 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      )}
                      
                      <Button 
                        size="sm"
                        className="bg-[#019f80] hover:bg-[#017a63] text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {reports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-gray-500 mb-6">
                  Faça sua primeira avaliação física para começar
                </p>
                <Button className="bg-[#019f80] hover:bg-[#017a63] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Fazer Primeira Avaliação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
