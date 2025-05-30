
import { EmailExistsOptions } from './auth/EmailExistsOptions';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { LoginForm } from './auth/LoginForm';
import { SignupFormSteps } from './auth/SignupFormSteps';
import { AuthHeader } from './auth/AuthHeader';
import { AuthCard } from './auth/AuthCard';
import { useAuthForm } from '@/hooks/useAuthForm';

interface AuthSectionProps {
  onBack: () => void;
  onLogin: (user: any) => void;
}

const AuthSection = ({ onBack, onLogin }: AuthSectionProps) => {
  const {
    isLogin,
    setIsLogin,
    step,
    setStep,
    loading,
    showPasswordReset,
    emailExists,
    setEmailExists,
    formData,
    setFormData,
    handleSocialLogin,
    handleForgotPassword,
    handlePasswordReset,
    handleInputChange,
    handleSubmit
  } = useAuthForm(onLogin);

  const getTitle = () => {
    if (isLogin) return 'Bem-vindo de volta!';
    if (step === 1) return 'Criar sua conta';
    if (step === 2) return 'Seus dados pessoais';
    if (step === 3) return 'Seus dados físicos';
    return 'Informações adicionais';
  };

  const getDescription = () => {
    if (isLogin) return 'Entre para acessar suas avaliações';
    if (step === 1) return 'Preencha seus dados básicos';
    if (step === 2) return 'Informações pessoais';
    if (step === 3) return 'Dados para sua avaliação';
    return 'Complete seu perfil';
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-md">
        <AuthHeader onBack={onBack} isLogin={isLogin} />

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
                  step={step}
                  formData={formData}
                  loading={loading}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onPrevStep={() => setStep(step - 1)}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </>
          )}
        </AuthCard>
      </div>
    </div>
  );
};

export default AuthSection;
