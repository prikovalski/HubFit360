
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { FormData } from '@/types/authForm';
import { createPatientProfile } from '@/services/patientProfileService';

interface UseAuthSubmitProps {
  isLogin: boolean;
  step: number;
  setStep: (step: number) => void;
  formData: FormData;
  emailExists: boolean;
  setEmailExists: (exists: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthSubmit = ({
  isLogin,
  step,
  setStep,
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
        if (step === 1) {
          console.log('Verificando se email existe:', formData.email);
          const emailAlreadyExists = await checkEmailExists(formData.email);
          console.log('Resultado da verificação:', emailAlreadyExists);
          
          if (emailAlreadyExists) {
            setEmailExists(true);
            return;
          }
          
          setStep(step + 1);
        } else if (step < 4) {
          setStep(step + 1);
        } else {
          // Final step - create the user and patient profile
          console.log('Creating user with form data:', formData);
          const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birthDate,
            email_confirm: false
          });

          if (error) {
            // Handle rate limiting specifically
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
            // Create patient profile using the auth user id directly
            await createPatientProfile(data.user.id, formData);

            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Redirecionando para o dashboard..."
            });
            
            console.log('Cadastro bem-sucedido, redirecionamento automático para dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      
      // Check if it's a rate limiting error
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
