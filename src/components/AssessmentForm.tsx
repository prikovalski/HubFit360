
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const AssessmentForm = ({ onBack, onSuccess }: AssessmentFormProps) => {
  const { toast } = useToast();
  const { userProfile, patientProfile, createOrUpdatePatientProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState({
    front: null as File | null,
    side: null as File | null,
    back: null as File | null
  });
  
  // Estados para altura e peso editáveis
  const [height, setHeight] = useState(patientProfile?.height?.toString() || '');
  const [weight, setWeight] = useState(patientProfile?.weight?.toString() || '');

  const handlePhotoUpload = (position: 'front' | 'side' | 'back', file: File) => {
    if (file.type.startsWith('image/')) {
      setPhotos(prev => ({ ...prev, [position]: file }));
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
    }
  };

  const uploadPhotoToStorage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('assessments')
      .upload(path, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('assessments')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!photos.front || !photos.side || !photos.back) {
      toast({
        title: "Fotos obrigatórias",
        description: "Por favor, adicione todas as três fotos (frente, lado e costas).",
        variant: "destructive"
      });
      return;
    }

    if (!height || !weight) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha altura e peso antes de fazer a avaliação.",
        variant: "destructive"
      });
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, insira valores válidos para altura e peso.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Atualizar perfil do paciente com os novos valores de altura e peso
      await createOrUpdatePatientProfile({
        height: heightNum,
        weight: weightNum
      });

      // Upload das fotos
      const timestamp = Date.now();
      const userId = userProfile?.id;
      
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        uploadPhotoToStorage(photos.front, `${userId}/${timestamp}/front.jpg`),
        uploadPhotoToStorage(photos.side, `${userId}/${timestamp}/side.jpg`),
        uploadPhotoToStorage(photos.back, `${userId}/${timestamp}/back.jpg`)
      ]);

      // Calcular idade
      const birthDate = new Date(userProfile?.birth_date || '');
      const age = new Date().getFullYear() - birthDate.getFullYear();

      // Chamar a função Edge
      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: {
          userId: userProfile?.id,
          frontPhoto: frontUrl,
          sidePhoto: sideUrl,
          backPhoto: backUrl,
          sex: userProfile?.gender === 'Masculino' ? 'male' : 'female',
          age: age,
          height: heightNum,
          weight: weightNum
        }
      });

      if (error) throw error;

      toast({
        title: "Avaliação criada com sucesso!",
        description: "Sua avaliação física foi processada."
      });

      onSuccess(data.assessment);

    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const PhotoUploadCard = ({ 
    position, 
    title, 
    description, 
    exampleImage 
  }: { 
    position: 'front' | 'side' | 'back'; 
    title: string; 
    description: string;
    exampleImage: string;
  }) => (
    <Card className="border-2 border-dashed border-gray-300 hover:border-[#019f80] transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <img 
            src={exampleImage} 
            alt={`Exemplo ${title}`}
            className="w-32 h-40 mx-auto object-cover rounded-lg border-2 border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-2">Exemplo de como tirar a foto</p>
        </div>
        
        <div className="text-center">
          <Label htmlFor={`photo-${position}`} className="cursor-pointer">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#019f80] transition-colors">
              {photos[position] ? (
                <img 
                  src={URL.createObjectURL(photos[position]!)} 
                  alt={`Foto ${title}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Clique para adicionar</p>
                </div>
              )}
            </div>
            <Input
              id={`photo-${position}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(position, file);
              }}
            />
          </Label>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Nova Avaliação Física</h1>
            <p className="text-gray-600">Confirme seus dados e faça o upload das suas fotos para análise</p>
          </div>
        </div>

        {/* Seção de dados pessoais */}
        <Card className="mb-8 bg-white border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Camera className="w-5 h-5 mr-2" />
              Dados para Avaliação
            </CardTitle>
            <CardDescription>
              Confirme ou atualize sua altura e peso para uma análise mais precisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
                <p className="text-xs text-gray-500">Insira sua altura em centímetros</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
                <p className="text-xs text-gray-500">Insira seu peso em quilogramas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Camera className="w-5 h-5 mr-2" />
              Instruções para as fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-700">
              <li>• Use roupas justas ou traje de banho para melhor análise</li>
              <li>• Mantenha postura ereta e natural</li>
              <li>• Certifique-se de que há boa iluminação</li>
              <li>• Tire as fotos contra uma parede lisa e clara</li>
              <li>• Mantenha distância de aproximadamente 2 metros da câmera</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PhotoUploadCard
            position="front"
            title="Foto de Frente"
            description="Posição frontal, braços ao lado do corpo"
            exampleImage="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop"
          />
          <PhotoUploadCard
            position="side"
            title="Foto de Lado"
            description="Perfil lateral direito, braços ao lado"
            exampleImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop"
          />
          <PhotoUploadCard
            position="back"
            title="Foto de Costas"
            description="Posição posterior, braços ao lado do corpo"
            exampleImage="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button 
                onClick={handleSubmit}
                disabled={loading || !photos.front || !photos.side || !photos.back || !height || !weight}
                className="bg-[#019f80] hover:bg-[#017a63] text-white px-8 py-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando Avaliação...
                  </>
                ) : (
                  'Solicitar Avaliação'
                )}
              </Button>
              {(!photos.front || !photos.side || !photos.back || !height || !weight) && (
                <p className="text-sm text-gray-500 mt-2">
                  Complete todos os campos e adicione as três fotos para continuar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentForm;
