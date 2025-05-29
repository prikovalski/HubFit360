
import { Button } from "@/components/ui/button";

interface PasswordResetFormProps {
  email: string;
  loading: boolean;
  onSendReset: () => void;
  onCancel: () => void;
}

export const PasswordResetForm = ({ 
  email, 
  loading, 
  onSendReset, 
  onCancel 
}: PasswordResetFormProps) => {
  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800">Recuperar Senha</h3>
      <p className="text-sm text-blue-700">
        Enviaremos um link para redefinir sua senha para: {email}
      </p>
      <div className="space-y-2">
        <Button 
          onClick={onSendReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
        </Button>
        <Button 
          onClick={onCancel}
          variant="ghost"
          className="w-full text-gray-600"
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};
