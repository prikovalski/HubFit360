
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

  const getLoginErrorMessage = (error: any): string => {
    console.log('Erro de login recebido:', error);
    console.log('Mensagem do erro:', error?.message);
    console.log('Código do erro:', error?.code);
    
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || '';
    
    console.log('Mensagem processada:', errorMessage);
    console.log('Código processado:', errorCode);
    
    // Verificar códigos de erro específicos do Supabase
    if (errorCode === 'invalid_credentials' || 
        errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('invalid email or password')) {
      return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }
    
    if (errorMessage.includes('email not confirmed') || 
        errorCode === 'email_not_confirmed') {
      return 'Conta não confirmada. Verifique seu email para confirmar a conta.';
    }
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit') ||
        errorCode === 'too_many_requests' ||
        errorMessage.includes('429')) {
      return 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
    }
    
    if (errorMessage.includes('user not found') || 
        errorCode === 'user_not_found') {
      return 'Usuário não encontrado. Verifique o email ou crie uma nova conta.';
    }
    
    if (errorMessage.includes('signup disabled') || 
        errorCode === 'signup_disabled') {
      return 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.';
    }
    
    // Mensagem genérica para outros erros
    console.log('Usando mensagem genérica para erro:', errorMessage);
    return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Tentando fazer login com:', formData.email);
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.log('Erro no signIn:', error);
          const userFriendlyMessage = getLoginErrorMessage(error);
          console.log('Mensagem amigável gerada:', userFriendlyMessage);
          
          toast({
            title: "Erro no login",
            description: userFriendlyMessage,
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
        console.log('Atividades físicas antes do signup:', formData.physicalActivities);
        console.log('Número de atividades:', formData.physicalActivities?.length || 0);
        
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
          console.log('Usuário criado com sucesso, criando perfil de paciente...');
          console.log('Dados completos do formData antes de criar perfil:', JSON.stringify(formData, null, 2));
          console.log('Atividades físicas específicas:', formData.physicalActivities);
          
          try {
            await createPatientProfile(data.user.id, formData);
            console.log('Perfil de paciente criado com sucesso');
          } catch (profileError) {
            console.error('Erro ao criar perfil de paciente:', profileError);
            // Não bloquear o fluxo, mas mostrar aviso
            toast({
              title: "Aviso",
              description: "Conta criada, mas alguns dados podem não ter sido salvos. Você pode completá-los no seu perfil.",
              variant: "default"
            });
          }

          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Redirecionando para o dashboard..."
          });
          
          console.log('Cadastro bem-sucedido, redirecionamento automático para dashboard');
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit (catch):', error);
      
      if (isLogin) {
        const userFriendlyMessage = getLoginErrorMessage(error);
        console.log('Mensagem de erro final para login:', userFriendlyMessage);
        
        toast({
          title: "Erro no login",
          description: userFriendlyMessage,
          variant: "destructive"
        });
      } else {
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
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
};
