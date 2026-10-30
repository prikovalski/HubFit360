import { useState } from 'react';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface BigFiveAssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const BIG_FIVE_QUESTIONS = [
  { text: "Sou comunicativo(a)", trait: "extraversion", reversed: false },
  { text: "Tendo a ser crítico(a) com os outros", trait: "agreeableness", reversed: true },
  { text: "Faço um trabalho completo e minucioso", trait: "conscientiousness", reversed: false },
  { text: "Fico deprimido(a), abatido(a)", trait: "neuroticism", reversed: false },
  { text: "Sou original, tenho sempre novas ideias", trait: "openness", reversed: false },
  { text: "Sou reservado(a)", trait: "extraversion", reversed: true },
  { text: "Sou prestativo(a) e altruísta com os outros", trait: "agreeableness", reversed: false },
  { text: "Posso ser um pouco descuidado(a)", trait: "conscientiousness", reversed: true },
  { text: "Sou relaxado(a), lido bem com o estresse", trait: "neuroticism", reversed: true },
  { text: "Sou curioso(a) sobre muitas coisas diferentes", trait: "openness", reversed: false },
  { text: "Sou cheio(a) de energia", trait: "extraversion", reversed: false },
  { text: "Começo discussões com os outros", trait: "agreeableness", reversed: true },
  { text: "Sou um trabalhador confiável", trait: "conscientiousness", reversed: false },
  { text: "Posso ficar tenso(a)", trait: "neuroticism", reversed: false },
  { text: "Sou engenhoso(a), um(a) pensador(a) profundo(a)", trait: "openness", reversed: false },
  { text: "Gero muito entusiasmo", trait: "extraversion", reversed: false },
  { text: "Tenho uma natureza indulgente", trait: "agreeableness", reversed: false },
  { text: "Tendo a ser desorganizado(a)", trait: "conscientiousness", reversed: true },
  { text: "Me preocupo muito", trait: "neuroticism", reversed: false },
  { text: "Tenho uma imaginação ativa", trait: "openness", reversed: false },
  { text: "Tendo a ficar quieto(a)", trait: "extraversion", reversed: true },
  { text: "Geralmente confio nas pessoas", trait: "agreeableness", reversed: false },
  { text: "Tendo a ser preguiçoso(a)", trait: "conscientiousness", reversed: true },
  { text: "Sou emocionalmente estável, não fico chateado(a) facilmente", trait: "neuroticism", reversed: true },
  { text: "Sou inventivo(a)", trait: "openness", reversed: false },
  { text: "Tenho uma personalidade assertiva", trait: "extraversion", reversed: false },
  { text: "Posso ser frio(a) e distante", trait: "agreeableness", reversed: true },
  { text: "Persevero até a tarefa estar terminada", trait: "conscientiousness", reversed: false },
  { text: "Posso ser temperamental", trait: "neuroticism", reversed: false },
  { text: "Valorizo experiências artísticas e estéticas", trait: "openness", reversed: false },
  { text: "Sou às vezes tímido(a), inibido(a)", trait: "extraversion", reversed: true },
  { text: "Sou atencioso(a) e gentil com quase todos", trait: "agreeableness", reversed: false },
  { text: "Faço as coisas de forma eficiente", trait: "conscientiousness", reversed: false },
  { text: "Permaneço calmo(a) em situações tensas", trait: "neuroticism", reversed: true },
  { text: "Prefiro trabalho que é rotineiro", trait: "openness", reversed: true },
  { text: "Sou extrovertido(a), sociável", trait: "extraversion", reversed: false },
  { text: "Às vezes sou rude com os outros", trait: "agreeableness", reversed: true },
  { text: "Faço planos e os sigo", trait: "conscientiousness", reversed: false },
  { text: "Fico nervoso(a) facilmente", trait: "neuroticism", reversed: false },
  { text: "Gosto de refletir, brincar com ideias", trait: "openness", reversed: false },
  { text: "Tenho poucos interesses artísticos", trait: "openness", reversed: true },
  { text: "Gosto de cooperar com os outros", trait: "agreeableness", reversed: false },
  { text: "Sou facilmente distraído(a)", trait: "conscientiousness", reversed: true },
  { text: "Sou sofisticado(a) nas artes, música ou literatura", trait: "openness", reversed: false }
];

const RESPONSE_OPTIONS = [
  { value: "1", label: "Discordo totalmente" },
  { value: "2", label: "Discordo" },
  { value: "3", label: "Neutro" },
  { value: "4", label: "Concordo" },
  { value: "5", label: "Concordo totalmente" }
];

const BigFiveAssessmentForm = ({ onBack, onSuccess }: BigFiveAssessmentFormProps) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'questions'>('info');
  
  const [patientName, setPatientName] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [assessmentType, setAssessmentType] = useState<'self' | 'other'>('self');
  
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionIndex]: value }));
  };

  const isInfoComplete = () => {
    if (assessmentType === 'self') return true;
    return patientName && patientGender && (patientAge || patientBirthDate);
  };

  const allQuestionsAnswered = Object.keys(responses).length === BIG_FIVE_QUESTIONS.length;

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
      const responsesArray = BIG_FIVE_QUESTIONS.map((_, index) => 
        parseInt(responses[index] || "3")
      );

      const payload: any = {
        responses: responsesArray,
        assessment_type: assessmentType,
      };

      if (assessmentType === 'other') {
        payload.patient_name = patientName;
        payload.patient_gender = patientGender;
        if (patientAge) payload.patient_age = parseInt(patientAge);
        if (patientBirthDate) payload.patient_birth_date = patientBirthDate;
      }

      const { data, error } = await supabase.functions.invoke('create-big-five-assessment', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "Avaliação criada com sucesso!",
        description: "Sua avaliação Big Five foi processada.",
      });

      onSuccess(data);
    } catch (error: any) {
      console.error('Erro ao criar avaliação Big Five:', error);
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
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teste de Personalidade Big Five</h1>
              <p className="text-sm text-muted-foreground">
                Avaliação dos cinco grandes fatores de personalidade
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
            <Card className="bg-purple-50/50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">
                    Progresso: {Object.keys(responses).length} de {BIG_FIVE_QUESTIONS.length}
                  </span>
                  <span className="text-sm text-purple-700">
                    {Math.round((Object.keys(responses).length / BIG_FIVE_QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(Object.keys(responses).length / BIG_FIVE_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questionário Big Five</CardTitle>
                <CardDescription>
                  Avalie cada afirmação de acordo com o quanto você concorda ou discorda dela. Seja honesto(a) e responda de forma espontânea.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {BIG_FIVE_QUESTIONS.map((question, index) => (
                  <div key={index} className="space-y-3 pb-6 border-b last:border-b-0">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.text}
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
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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

export default BigFiveAssessmentForm;
