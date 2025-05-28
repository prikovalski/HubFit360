
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Download, User, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ReportViewer from '@/components/ReportViewer';
import AssessmentForm from '@/components/AssessmentForm';

interface Assessment {
  id: string;
  created_at: string;
  body_fat_percentage: number;
  lean_mass: number;
  bmi: number;
  status: string;
  assessment_text: string;
}

const UserDashboard = ({ user, onLogout }) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchAssessments();
    }
  }, [userProfile?.id]);

  const fetchAssessments = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas avaliações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSuccess = (assessment) => {
    setShowAssessmentForm(false);
    fetchAssessments(); // Recarregar a lista
    toast({
      title: "Avaliação criada!",
      description: "Sua avaliação física foi processada com sucesso."
    });
  };

  const handleReportClick = (assessment) => {
    // Adaptar os dados da avaliação para o formato esperado pelo ReportViewer
    const adaptedReport = {
      id: assessment.id,
      date: assessment.created_at,
      status: 'completed', // Assumindo que todas as avaliações estão completas
      preview: {
        leanMass: `${assessment.lean_mass?.toFixed(1) || 'N/A'}kg`,
        bodyFat: `${assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%`,
        bmi: assessment.bmi?.toFixed(1) || 'N/A',
        summary: assessment.assessment_text ? 
          assessment.assessment_text.substring(0, 300) + '...' : 
          'Avaliação física completa com análise de composição corporal.'
      }
    };
    setSelectedReport(adaptedReport);
  };

  if (selectedReport) {
    return <ReportViewer report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  if (showAssessmentForm) {
    return (
      <AssessmentForm 
        onBack={() => setShowAssessmentForm(false)}
        onSuccess={handleAssessmentSuccess}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#019f80] hover:bg-[#017a63]">Completo</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

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
              onClick={() => setShowAssessmentForm(true)}
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
              <div className="text-3xl font-bold">{assessments.length}</div>
              <p className="text-white/80 text-sm">Avaliações realizadas</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Última Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-[#019f80]">IMC: {assessments[0]?.bmi?.toFixed(1) || 'N/A'}</div>
                  <p className="text-gray-600 text-sm">
                    {new Date(assessments[0]?.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-400">--</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Gordura Corporal</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-green-600">{assessments[0]?.body_fat_percentage?.toFixed(1) || 'N/A'}%</div>
                  <p className="text-gray-600 text-sm">Última medição</p>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-400">--</div>
              )}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#019f80]" />
                <span className="ml-2 text-gray-600">Carregando avaliações...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div 
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#019f80]/30"
                    onClick={() => handleReportClick(assessment)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Avaliação de {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                          </h3>
                          {getStatusBadge(assessment.status)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Gordura Corporal:</span>
                            <div className="font-semibold text-[#019f80]">
                              {assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Massa Magra:</span>
                            <div className="font-semibold text-[#019f80]">
                              {assessment.lean_mass?.toFixed(1) || 'N/A'}kg
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">IMC:</span>
                            <div className="font-semibold text-[#019f80]">
                              {assessment.bmi?.toFixed(1) || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        {assessment.assessment_text && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {assessment.assessment_text.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {assessment.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implementar download PDF
                            }}
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
                
                {assessments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nenhuma avaliação encontrada
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Faça sua primeira avaliação física para começar
                    </p>
                    <Button 
                      onClick={() => setShowAssessmentForm(true)}
                      className="bg-[#019f80] hover:bg-[#017a63] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Fazer Primeira Avaliação
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
