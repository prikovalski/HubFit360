
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export const DeleteProfileDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading
}: DeleteProfileDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-600">
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir Perfil Permanentemente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <p className="font-semibold text-gray-800">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
            <p>
              Ao confirmar, os seguintes dados serão <strong>permanentemente excluídos</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Todas as suas avaliações físicas</li>
              <li>Relatórios e análises detalhadas</li>
              <li>Dados pessoais e perfil</li>
              <li>Conta de login</li>
            </ul>
            <p className="text-red-600 font-medium">
              Não será possível recuperar esses dados após a exclusão.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
