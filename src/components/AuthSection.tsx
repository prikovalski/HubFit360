
import { EmailExistsOptions } from './auth/EmailExistsOptions';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { LoginForm } from './auth/LoginForm';
import SignupFormSteps from './auth/SignupFormSteps';
import { AuthHeader } from './auth/AuthHeader';
import { AuthCard } from './auth/AuthCard';
import { EmailConfirmationCard } from './auth/EmailConfirmationCard';
import { useAuthForm } from '@/hooks/useAuthForm';

interface AuthSectionProps {
  onBack: () => void;
  onLogin: (user: any) => void;
}

const AuthSection = ({ onBack, onLogin }: AuthSectionProps) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Callback que não faz nada - o redirecionamento será automático via estado de autenticação
  const handleAuthSuccess = (user: any) => {
    // O usuário já estará logado devido ao estado de autenticação do Supabase
    // O redirecionamento para o dashboard acontecerá automaticamente via useAuth
    console.log('🔧 AuthSection: Usuário autenticado com sucesso', { 
      user: user?.email, 
      isMobile 
    });
  };

  const {
    isLogin,
    setIsLogin,
    loading,
    showPasswordReset,
    setShowPasswordReset,
    emailExists,
    setEmailExists,
    emailError,
    setEmailError,
    formData,
    setFormData,
    showEmailConfirmation,
    setShowEmailConfirmation,
    resendLoading,
    handleSocialLogin,
    handleForgotPassword,
    handlePasswordReset,
    handleInputChange,
    handleSubmit,
    validateEmailInput,
    handleResendConfirmation
  } = useAuthForm(handleAuthSuccess);

  const getTitle = () => {
    if (isLogin) return 'Bem-vindo de volta!';
    return 'Criar sua conta';
  };

  const getDescription = () => {
    if (isLogin) return 'Entre para acessar suas avaliações';
    return 'Preencha seus dados';
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-2xl py-8">
        <AuthHeader onBack={onBack} isLogin={isLogin} />

        {showEmailConfirmation ? (
          <EmailConfirmationCard
            email={formData.email}
            onResendEmail={handleResendConfirmation}
            onBack={() => setShowEmailConfirmation(false)}
            loading={loading}
            resendLoading={resendLoading}
          />
        ) : (
          <AuthCard title={getTitle()} description={getDescription()}>
            {emailExists && !isLogin && (
              <EmailExistsOptions
                email={formData.email}
                loading={loading}
                onLogin={() => {
                  setIsLogin(true);
                  setEmailExists(false);
                }}
                onPasswordReset={() => setShowPasswordReset(true)}
                onUseAnotherEmail={() => {
                  setEmailExists(false);
                  setFormData(prev => ({...prev, email: ''}));
                }}
              />
            )}

            {showPasswordReset && (
              <PasswordResetForm
                email={formData.email}
                loading={loading}
                onSendReset={handlePasswordReset}
                onCancel={() => setShowPasswordReset(false)}
              />
            )}

            {!emailExists && !showPasswordReset && (
              <>
                {isLogin ? (
                  <LoginForm
                    formData={formData}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onSocialLogin={handleSocialLogin}
                    onSwitchToSignup={() => setIsLogin(false)}
                    onForgotPassword={handleForgotPassword}
                  />
                ) : (
                  <SignupFormSteps
                    formData={formData}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onSwitchToLogin={() => setIsLogin(true)}
                    emailError={emailError}
                    onEmailValidation={validateEmailInput}
                  />
                )}
              </>
            )}
          </AuthCard>
        )}
      </div>
    </div>
  );
};

export default AuthSection;
