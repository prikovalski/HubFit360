import { useState } from 'react';
import { Brain, ArrowLeft, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserCredits } from '@/hooks/useUserCredits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DIVA2AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

// Critérios DSM-5 - DIVA 2.0
const DIVA_CRITERIA = {
  inattention: {
    title: "Critério A1: Desatenção",
    description: "Frequentemente:",
    childhood: [
      {
        id: "a1_1",
        text: "Não presta atenção em detalhes ou comete erros por descuido em trabalhos escolares, trabalho ou outras atividades",
        examples: "Por exemplo: negligencia ou deixa passar detalhes, o trabalho é impreciso"
      },
      {
        id: "a1_2",
        text: "Tem dificuldade em manter a atenção em tarefas ou atividades lúdicas",
        examples: "Por exemplo: tem dificuldade em manter o foco durante aulas, conversas ou leitura prolongada"
      },
      {
        id: "a1_3",
        text: "Parece não escutar quando alguém lhe fala diretamente",
        examples: "Por exemplo: a mente parece estar em outro lugar, mesmo na ausência de qualquer distração óbvia"
      },
      {
        id: "a1_4",
        text: "Não segue instruções até o fim e não consegue terminar trabalhos escolares, tarefas ou deveres no local de trabalho",
        examples: "Por exemplo: inicia tarefas mas rapidamente perde o foco e facilmente se distrai"
      },
      {
        id: "a1_5",
        text: "Tem dificuldade para organizar tarefas e atividades",
        examples: "Por exemplo: dificuldade em gerenciar tarefas sequenciais; dificuldade em manter materiais e pertences em ordem; trabalho desorganizado e desleixado; mau gerenciamento do tempo"
      },
      {
        id: "a1_6",
        text: "Evita, não gosta ou reluta em se envolver em tarefas que exigem esforço mental prolongado",
        examples: "Por exemplo: trabalhos escolares ou deveres de casa; para adolescentes e adultos: preparar relatórios, preencher formulários, revisar longos textos"
      },
      {
        id: "a1_7",
        text: "Perde coisas necessárias para tarefas ou atividades",
        examples: "Por exemplo: materiais escolares, lápis, livros, ferramentas, carteiras, chaves, papelada, óculos, celular"
      },
      {
        id: "a1_8",
        text: "É facilmente distraído por estímulos externos",
        examples: "Para adolescentes e adultos, pode incluir pensamentos não relacionados"
      },
      {
        id: "a1_9",
        text: "Esquece atividades cotidianas",
        examples: "Por exemplo: fazer tarefas, recados; para adolescentes e adultos: retornar chamadas, pagar contas, manter compromissos"
      }
    ]
  },
  hyperactivity: {
    title: "Critério A2: Hiperatividade e Impulsividade",
    description: "Frequentemente:",
    childhood: [
      {
        id: "a2_1",
        text: "Remexe ou batuca as mãos ou os pés ou se contorce na cadeira",
        examples: ""
      },
      {
        id: "a2_2",
        text: "Levanta da cadeira em situações em que se espera que permaneça sentado",
        examples: "Por exemplo: sai do lugar em sala de aula, no escritório ou outro local de trabalho, ou em outras situações que exigem permanecer em um lugar"
      },
      {
        id: "a2_3",
        text: "Corre ou sobe nas coisas em situações em que isso é inapropriado",
        examples: "Nota: Em adolescentes ou adultos, pode se limitar a sensação de inquietação"
      },
      {
        id: "a2_4",
        text: "É incapaz de brincar ou se envolver em atividades de lazer calmamente",
        examples: ""
      },
      {
        id: "a2_5",
        text: "Está 'a todo vapor' ou age como se estivesse 'com o motor ligado'",
        examples: "Por exemplo: é incapaz de ficar ou se sente desconfortável ficando parado por muito tempo, como em restaurantes, reuniões; pode ser percebido pelos outros como inquieto ou difícil de acompanhar"
      },
      {
        id: "a2_6",
        text: "Fala demais",
        examples: ""
      },
      {
        id: "a2_7",
        text: "Deixa escapar uma resposta antes que a pergunta tenha sido concluída",
        examples: "Por exemplo: completa as frases dos outros; não consegue esperar a vez de falar em conversas"
      },
      {
        id: "a2_8",
        text: "Tem dificuldade para esperar sua vez",
        examples: "Por exemplo: enquanto espera em uma fila"
      },
      {
        id: "a2_9",
        text: "Interrompe ou se intromete",
        examples: "Por exemplo: intromete-se em conversas, jogos ou atividades; pode começar a usar as coisas de outras pessoas sem pedir ou receber permissão; para adolescentes e adultos: pode intrometer-se ou assumir o que os outros estão fazendo"
      }
    ]
  }
};

const RESPONSE_OPTIONS = [
  { value: "0", label: "Nunca ou raramente" },
  { value: "1", label: "Às vezes" },
  { value: "2", label: "Frequentemente" },
  { value: "3", label: "Muito frequentemente" }
];

const DIVA2AssessmentForm = ({ onBack, onSuccess }: DIVA2AssessmentFormProps) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const { hasCredits, balance } = useUserCredits();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'questions'>('info');
  const [currentPeriod, setCurrentPeriod] = useState<'childhood' | 'adulthood'>('childhood');
  const [showPeriodInfo, setShowPeriodInfo] = useState(false);
  const [periodInfoType, setPeriodInfoType] = useState<'childhood' | 'adulthood'>('childhood');
  
  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [assessmentType, setAssessmentType] = useState<'self' | 'other'>('self');
  
  // Responses - separadas por período (infância e idade adulta)
  const [childhoodResponses, setChildhoodResponses] = useState<Record<string, string>>({});
  const [adulthoodResponses, setAdulthoodResponses] = useState<Record<string, string>>({});

  const handleResponseChange = (criterionId: string, value: string, period: 'childhood' | 'adulthood') => {
    if (period === 'childhood') {
      setChildhoodResponses(prev => ({ ...prev, [criterionId]: value }));
    } else {
      setAdulthoodResponses(prev => ({ ...prev, [criterionId]: value }));
    }
  };

  const isInfoComplete = () => {
    if (assessmentType === 'self') {
      return true;
    }
    return patientName && patientGender && (patientAge || patientBirthDate);
  };

  const totalQuestions = Object.values(DIVA_CRITERIA).reduce(
    (sum, criterion) => sum + criterion.childhood.length, 0
  );

  const childhoodAnswered = Object.keys(childhoodResponses).length;
  const adulthoodAnswered = Object.keys(adulthoodResponses).length;
  const allQuestionsAnswered = childhoodAnswered === totalQuestions && adulthoodAnswered === totalQuestions;

  const handlePeriodChange = (newPeriod: 'childhood' | 'adulthood') => {
    setCurrentPeriod(newPeriod);
    setPeriodInfoType(newPeriod);
    setShowPeriodInfo(true);
  };

  const calculateScore = () => {
    const inattentionChildhood = DIVA_CRITERIA.inattention.childhood.filter(
      q => parseInt(childhoodResponses[q.id] || '0') >= 2
    ).length;
    
    const inattentionAdulthood = DIVA_CRITERIA.inattention.childhood.filter(
      q => parseInt(adulthoodResponses[q.id] || '0') >= 2
    ).length;

    const hyperactivityChildhood = DIVA_CRITERIA.hyperactivity.childhood.filter(
      q => parseInt(childhoodResponses[q.id] || '0') >= 2
    ).length;
    
    const hyperactivityAdulthood = DIVA_CRITERIA.hyperactivity.childhood.filter(
      q => parseInt(adulthoodResponses[q.id] || '0') >= 2
    ).length;

    return {
      inattentionChildhood,
      inattentionAdulthood,
      hyperactivityChildhood,
      hyperactivityAdulthood,
      totalScore: inattentionAdulthood + hyperactivityAdulthood
    };
  };

  const getClassification = (scores: ReturnType<typeof calculateScore>) => {
    // Critérios DSM-5 para TDAH em adultos
    const hasInattention = scores.inattentionChildhood >= 6 && scores.inattentionAdulthood >= 5;
    const hasHyperactivity = scores.hyperactivityChildhood >= 6 && scores.hyperactivityAdulthood >= 5;

    if (hasInattention && hasHyperactivity) {
      return "TDAH - Apresentação Combinada";
    } else if (hasInattention) {
      return "TDAH - Apresentação Predominantemente Desatenta";
    } else if (hasHyperactivity) {
      return "TDAH - Apresentação Predominantemente Hiperativa-Impulsiva";
    } else if (scores.inattentionAdulthood >= 3 || scores.hyperactivityAdulthood >= 3) {
      return "Sintomas sugestivos de TDAH - Avaliação profissional recomendada";
    }
    return "Sem indicação significativa de TDAH";
  };

  const handleSubmit = async () => {
    if (!hasCredits) {
      toast({
        title: "Créditos insuficientes",
        description: "Você precisa de créditos para criar uma avaliação TDAH DIVA 2.0.",
        variant: "destructive",
      });
      return;
    }

    if (!allQuestionsAnswered) {
      toast({
        title: "Respostas incompletas",
        description: `Por favor, responda todas as perguntas. Infância: ${childhoodAnswered}/${totalQuestions}, Idade Adulta: ${adulthoodAnswered}/${totalQuestions}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const scores = calculateScore();
      const classification = getClassification(scores);
      
      const responsesData = {
        childhood: childhoodResponses,
        adulthood: adulthoodResponses,
        scores,
        method: 'DIVA 2.0'
      };

      const { data: assessmentData, error: assessmentError } = await supabase.functions.invoke(
        'create-tdah-assessment',
        {
          body: {
            patientName: assessmentType === 'self' ? userProfile?.name : patientName,
            patientGender: assessmentType === 'self' ? userProfile?.gender : patientGender,
            patientAge: assessmentType === 'self' 
              ? (userProfile?.birth_date ? new Date().getFullYear() - new Date(userProfile.birth_date).getFullYear() : null)
              : (patientAge || null),
            patientBirthDate: assessmentType === 'self' ? userProfile?.birth_date : (patientBirthDate || null),
            assessmentType,
            responses: responsesData,
            classification,
            assessmentMethod: 'DIVA 2.0'
          }
        }
      );

      if (assessmentError) throw assessmentError;

      toast({
        title: "Avaliação criada!",
        description: "Sua avaliação DIVA 2.0 foi criada com sucesso.",
      });

      onSuccess(assessmentData);
    } catch (error: any) {
      console.error('Error creating DIVA assessment:', error);
      toast({
        title: "Erro ao criar avaliação",
        description: error.message || "Ocorreu um erro ao processar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: typeof DIVA_CRITERIA.inattention.childhood[0], period: 'childhood' | 'adulthood') => {
    const responses = period === 'childhood' ? childhoodResponses : adulthoodResponses;
    const currentValue = responses[question.id];

    return (
      <Card key={`${question.id}_${period}`} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{question.text}</CardTitle>
          {question.examples && (
            <CardDescription className="text-sm italic">{question.examples}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentValue}
            onValueChange={(value) => handleResponseChange(question.id, value, period)}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RESPONSE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value={option.value} id={`${question.id}_${period}_${option.value}`} />
                  <Label
                    htmlFor={`${question.id}_${period}_${option.value}`}
                    className="cursor-pointer text-sm flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    );
  };

  if (step === 'info') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Avaliação TDAH - DIVA 2.0</CardTitle>
                <CardDescription>
                  Entrevista Diagnóstica para TDAH em Adultos baseada nos critérios DSM-5
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Sobre o DIVA 2.0</h3>
              <p className="text-sm text-blue-800">
                O DIVA 2.0 é uma entrevista semiestruturada que avalia sintomas de TDAH tanto na <strong>infância</strong> quanto na <strong>vida adulta</strong>. 
                Segundo o DSM-5, para o diagnóstico de TDAH em adultos, é essencial que os sintomas tenham estado presentes em ambos os períodos.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Você responderá às mesmas perguntas duas vezes: uma para sua infância (antes dos 12 anos) e outra para sua vida adulta atual.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Tipo de Avaliação
                </Label>
                <RadioGroup
                  value={assessmentType}
                  onValueChange={(value: 'self' | 'other') => setAssessmentType(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self" className="cursor-pointer flex-1">
                      Autoavaliação
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer flex-1">
                      Avaliar outra pessoa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {assessmentType === 'other' && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="patientName">Nome do Paciente *</Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patientGender">Gênero *</Label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                      <SelectTrigger id="patientGender">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Feminino</SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientAge">Idade</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Idade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientBirthDate">Data de Nascimento</Label>
                      <Input
                        id="patientBirthDate"
                        type="date"
                        value={patientBirthDate}
                        onChange={(e) => setPatientBirthDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>Importante:</strong> Esta avaliação consome 1 crédito. Você possui {balance} crédito(s) disponível(is).
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onBack}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setStep('questions');
                  setShowPeriodInfo(true);
                }}
                disabled={!isInfoComplete()}
              >
                Iniciar Avaliação
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => setStep('info')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>DIVA 2.0 - Critérios DSM-5</CardTitle>
                <CardDescription>
                  Progresso: Infância ({childhoodAnswered}/{totalQuestions}) | Idade Adulta ({adulthoodAnswered}/{totalQuestions})
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Dialog open={showPeriodInfo} onOpenChange={setShowPeriodInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {periodInfoType === 'childhood' ? 'Período: Infância' : 'Período: Idade Adulta'}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              {periodInfoType === 'childhood' ? (
                <>
                  <p className="text-base font-semibold text-foreground">
                    📅 Responda pensando em como você era ANTES DOS 12 ANOS DE IDADE
                  </p>
                  <p className="text-sm">
                    Pense em situações da sua infância, como na escola, em casa, brincando com amigos, etc.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    É importante avaliar se os sintomas já estavam presentes nesta fase da vida.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold text-foreground">
                    📅 Responda pensando em como você É ATUALMENTE (últimos 6 meses)
                  </p>
                  <p className="text-sm">
                    Considere seu comportamento atual no trabalho, estudos, relacionamentos e atividades do dia a dia.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avalie como os sintomas se manifestam na sua vida adulta.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowPeriodInfo(false)}>
              Entendi, começar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={currentPeriod} onValueChange={(v) => handlePeriodChange(v as 'childhood' | 'adulthood')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="childhood" className="gap-2">
            Infância (antes dos 12 anos)
            <span className="text-xs">({childhoodAnswered}/{totalQuestions})</span>
          </TabsTrigger>
          <TabsTrigger value="adulthood" className="gap-2">
            Idade Adulta (atual)
            <span className="text-xs">({adulthoodAnswered}/{totalQuestions})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="childhood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">{DIVA_CRITERIA.inattention.title}</CardTitle>
              <CardDescription>{DIVA_CRITERIA.inattention.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIVA_CRITERIA.inattention.childhood.map(q => renderQuestion(q, 'childhood'))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">{DIVA_CRITERIA.hyperactivity.title}</CardTitle>
              <CardDescription>{DIVA_CRITERIA.hyperactivity.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIVA_CRITERIA.hyperactivity.childhood.map(q => renderQuestion(q, 'childhood'))}
            </CardContent>
          </Card>

          {childhoodAnswered === totalQuestions && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle className="h-6 w-6" />
                  <p className="text-lg font-semibold">Questionário da Infância Concluído!</p>
                </div>
                <p className="text-muted-foreground">
                  Agora vamos avaliar os sintomas na idade adulta.
                </p>
                <Button 
                  onClick={() => handlePeriodChange('adulthood')}
                  className="mt-4"
                  size="lg"
                >
                  Continuar para Idade Adulta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="adulthood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">{DIVA_CRITERIA.inattention.title}</CardTitle>
              <CardDescription>{DIVA_CRITERIA.inattention.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIVA_CRITERIA.inattention.childhood.map(q => renderQuestion(q, 'adulthood'))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">{DIVA_CRITERIA.hyperactivity.title}</CardTitle>
              <CardDescription>{DIVA_CRITERIA.hyperactivity.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIVA_CRITERIA.hyperactivity.childhood.map(q => renderQuestion(q, 'adulthood'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6 sticky bottom-4 bg-background p-4 rounded-lg border shadow-lg">
        <Button variant="outline" onClick={() => setStep('info')}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || loading}
        >
          {loading ? 'Processando...' : 'Finalizar Avaliação'}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DIVA2AssessmentForm;