
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { FormData } from '@/types/authForm';
import { createPatientProfile } from '@/services/patientProfileService';

interface UseAuthSubmitProps {
  isLogin: boolean;
  formData: FormData;
  emailExists: boolean;
  setEmailExists: (exists: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthSubmit = ({
  isLogin,
  formData,
  emailExists,
  setEmailExists,
  setLoading
}: UseAuthSubmitProps) => {
  const { signUp, signIn, checkEmailExists } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!"
          });
          
          console.log('Login bem-sucedido, redirecionamento automático para dashboard');
        }
      } else {
        console.log('Verificando se email existe:', formData.email);
        const emailAlreadyExists = await checkEmailExists(formData.email);
        console.log('Resultado da verificação:', emailAlreadyExists);
        
        if (emailAlreadyExists) {
          setEmailExists(true);
          return;
        }

        console.log('Creating user with form data:', formData);
        // Map gender to backend format
        let backendGender: 'MALE' | 'FEMALE' | null = null;
        if (formData.gender === 'Masculino') backendGender = 'MALE';
        else if (formData.gender === 'Feminino') backendGender = 'FEMALE';
        // If 'Outro' or empty, keep as null
        const { data, error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          gender: backendGender,
          birth_date: formData.birthDate,
          email_confirm: false
        });

        if (error) {
          if (error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.message?.includes('rate')) {
            toast({
              title: "Muitas tentativas",
              description: "Você fez muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive"
            });
          }
          return;
        }

        if (data.user) {
          await createPatientProfile(data.user.id, formData);

          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Redirecionando para o dashboard..."
          });
          
          console.log('Cadastro bem-sucedido, redirecionamento automático para dashboard');
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        toast({
          title: "Limite de tentativas excedido",
          description: "Aguarde alguns minutos antes de tentar se cadastrar novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
};
