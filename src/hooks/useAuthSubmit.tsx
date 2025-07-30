
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export const useAuthSubmit = () => {
  const submitSignup = async (formData: any) => {
    console.log('=== INÍCIO DO PROCESSO DE CADASTRO ===');
    console.log('FormData recebido:', JSON.stringify(formData, null, 2));

    const redirectUrl = `${window.location.origin}/`;
    console.log('URL de redirecionamento:', redirectUrl);

    // Determinar o role baseado no tipo de usuário
    const userRole = formData.userType === 'professional' ? 'PROFESSIONAL' : 'PATIENT';
    
    // Preparar metadados do usuário
    const userMetadata: any = {
      name: formData.name,
      gender: formData.gender,
      birth_date: formData.birthDate,
      user_type: formData.userType,
      role: userRole
    };

    // Adicionar profissão se for profissional
    if (formData.userType === 'professional' && formData.profession) {
      userMetadata.profession = formData.profession;
    }

    // Para pacientes, incluir apenas dados que foram preenchidos
    if (formData.userType === 'patient') {
      // Campos obrigatórios
      userMetadata.city = formData.city;
      userMetadata.state = formData.state;
      userMetadata.goal = formData.goal;
      userMetadata.physical_activities = formData.physicalActivities;
      
      // Campos opcionais - só incluir se preenchidos
      if (formData.weight) {
        userMetadata.weight = formData.weight;
      }
      if (formData.height) {
        userMetadata.height = formData.height;
      }
      if (formData.neckCircumference) {
        userMetadata.neck_circumference = formData.neckCircumference;
      }
      if (formData.waistCircumference) {
        userMetadata.waist_circumference = formData.waistCircumference;
      }
      if (formData.hipCircumference) {
        userMetadata.hip_circumference = formData.hipCircumference;
      }
    }

    console.log('Metadados do usuário:', userMetadata);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userMetadata
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }

    console.log('Cadastro realizado com sucesso:', data);
    return data;
  };

  const submitLogin = async (email: string, password: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('🔧 useAuthSubmit: === TENTATIVA DE LOGIN ===');
    console.log('🔧 useAuthSubmit:', { email, isMobile, userAgent: navigator.userAgent });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('🔧 useAuthSubmit: Erro no login:', error);
      throw error;
    }

    console.log('🔧 useAuthSubmit: Login realizado com sucesso:', { 
      hasData: !!data, 
      hasUser: !!data?.user, 
      hasSession: !!data?.session,
      email: data?.user?.email,
      isMobile 
    });
    
    return data;
  };

  const handleSubmit = async (formData: any, isLogin: boolean) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('🔧 useAuthSubmit: handleSubmit iniciado', { isLogin, isMobile });
    
    try {
      if (isLogin) {
        console.log('🔧 useAuthSubmit: Processando login...');
        const data = await submitLogin(formData.email, formData.password);
        
        console.log('🔧 useAuthSubmit: Login finalizado, mostrando toast');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
        
        // Para mobile, aguardar um pouco antes de retornar para garantir que a sessão seja processada
        if (isMobile) {
          console.log('🔧 useAuthSubmit: Aguardando processamento da sessão no mobile...');
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return data;
      } else {
        console.log('🔧 useAuthSubmit: Processando cadastro...');
        const data = await submitSignup(formData);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
        
        return data;
      }
    } catch (error: any) {
      console.error('🔧 useAuthSubmit: Erro no handleSubmit:', error);
      toast({
        title: isLogin ? "Erro no login" : "Erro no cadastro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    submitSignup,
    submitLogin,
    handleSubmit
  };
};
