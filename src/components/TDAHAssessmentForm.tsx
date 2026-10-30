import { useState } from 'react';
import { Brain, ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TDAHAssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const ASRS_QUESTIONS = [
  "Você tem dificuldade para terminar os detalhes finais de um projeto depois que as partes desafiadoras foram feitas?",
  "Você tem dificuldade para organizar tarefas e atividades?",
  "Você tem problemas para lembrar de compromissos ou obrigações?",
  "Quando você tem uma tarefa que requer muita concentração, você a evita ou adia?",
  "Você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado por muito tempo?",
  "Você se sente excessivamente ativo ou compelido a fazer coisas, como se estivesse 'a todo vapor'?",
  "Você comete erros por descuido quando está trabalhando em um projeto chato ou difícil?",
  "Você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
  "Você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando estão falando diretamente com você?",
  "Você perde ou tem dificuldade para encontrar coisas em casa ou no trabalho?",
  "Você se distrai com atividades ou barulho ao seu redor?",
  "Você se levanta da cadeira em reuniões ou outras situações onde deveria permanecer sentado?",
  "Você se sente inquieto ou agitado?",
  "Você tem dificuldade para relaxar quando tem tempo livre?",
  "Você fala demais em situações sociais?",
  "Em conversas, você se pega terminando as frases das pessoas antes que elas terminem?",
  "Você tem dificuldade para esperar sua vez em situações onde é preciso esperar?",
  "Você interrompe os outros quando estão ocupados?"
];

const RESPONSE_OPTIONS = [
  { value: "0", label: "Nunca" },
  { value: "1", label: "Raramente" },
  { value: "2", label: "Às vezes" },
  { value: "3", label: "Frequentemente" },
  { value: "4", label: "Muito Frequentemente" }
];

const TDAHAssessmentForm = ({ onBack, onSuccess }: TDAHAssessmentFormProps) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'questions'>('info');
  
  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [assessmentType, setAssessmentType] = useState<'self' | 'other'>('self');
  
  // Responses
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionIndex]: value }));
  };

  const isInfoComplete = () => {
    if (assessmentType === 'self') {
      return true;
    }
    return patientName && patientGender && (patientAge || patientBirthDate);
  };

  const allQuestionsAnswered = Object.keys(responses).length === ASRS_QUESTIONS.length;

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      toast({
        title: "Respostas incompletas",
        description: "Por favor, responda todas as perguntas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const responsesArray = ASRS_QUESTIONS.map((_, index) => 
        parseInt(responses[index] || "0")
      );

      const payload: any = {
        responses: responsesArray,
        assessment_type: assessmentType,
      };

      if (assessmentType === 'other') {
        payload.patient_name = patientName;
        payload.patient_gender = patientGender;
        if (patientAge) {
          payload.patient_age = parseInt(patientAge);
        }
        if (patientBirthDate) {
          payload.patient_birth_date = patientBirthDate;
        }
      }

      const { data, error } = await supabase.functions.invoke('create-tdah-assessment', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "Avaliação criada com sucesso!",
        description: "Sua avaliação TDAH foi processada.",
      });

      onSuccess(data);
    } catch (error: any) {
      console.error('Erro ao criar avaliação TDAH:', error);
      toast({
        title: "Erro ao criar avaliação",
        description: error.message || "Ocorreu um erro ao processar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Avaliação TDAH</h1>
              <p className="text-sm text-muted-foreground">
                Questionário ASRS-18 para triagem de TDAH
              </p>
            </div>
          </div>
        </div>

        {step === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Paciente</CardTitle>
              <CardDescription>
                Para quem é esta avaliação?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Avaliação</Label>
                <RadioGroup
                  value={assessmentType}
                  onValueChange={(value: 'self' | 'other') => setAssessmentType(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self" className="font-normal cursor-pointer">
                      Autoavaliação
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      Avaliação para outra pessoa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {assessmentType === 'other' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Paciente *</Label>
                    <Input
                      id="name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                      <SelectTrigger>
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
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Ex: 30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthdate">Ou Data de Nascimento</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={patientBirthDate}
                        onChange={(e) => setPatientBirthDate(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={() => setStep('questions')}
                disabled={!isInfoComplete()}
                className="w-full"
              >
                Continuar para Questionário
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'questions' && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Progresso: {Object.keys(responses).length} de {ASRS_QUESTIONS.length}
                  </span>
                  <span className="text-sm text-blue-700">
                    {Math.round((Object.keys(responses).length / ASRS_QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(Object.keys(responses).length / ASRS_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questionário ASRS-18</CardTitle>
                <CardDescription>
                  Para cada pergunta, selecione a frequência que melhor descreve como você tem se sentido e se comportado nos últimos 6 meses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {ASRS_QUESTIONS.map((question, index) => (
                  <div key={index} className="space-y-3 pb-6 border-b last:border-b-0">
                    <Label className="text-base font-medium">
                      {index + 1}. {question}
                    </Label>
                    <RadioGroup
                      value={responses[index] || ""}
                      onValueChange={(value) => handleResponseChange(index, value)}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        {RESPONSE_OPTIONS.map((option) => (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                              responses[index] === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <RadioGroupItem value={option.value} id={`q${index}-${option.value}`} />
                            <Label
                              htmlFor={`q${index}-${option.value}`}
                              className="font-normal cursor-pointer text-sm flex-1"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('info')}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>Processando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Avaliação
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TDAHAssessmentForm;
