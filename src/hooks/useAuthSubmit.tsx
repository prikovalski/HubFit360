
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

    // Para pacientes, incluir dados físicos e medidas
    if (formData.userType === 'patient') {
      userMetadata.weight = formData.weight;
      userMetadata.height = formData.height;
      userMetadata.city = formData.city;
      userMetadata.state = formData.state;
      userMetadata.goal = formData.goal;
      userMetadata.physical_activities = formData.physicalActivities;
      userMetadata.neck_circumference = formData.neckCircumference;
      userMetadata.waist_circumference = formData.waistCircumference;
      userMetadata.hip_circumference = formData.hipCircumference;
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
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      throw error;
    }

    console.log('Login realizado com sucesso:', data);
    return data;
  };

  const handleSubmit = async (formData: any, isLogin: boolean) => {
    try {
      if (isLogin) {
        const data = await submitLogin(formData.email, formData.password);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
        
        return data;
      } else {
        const data = await submitSignup(formData);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
        
        return data;
      }
    } catch (error: any) {
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
