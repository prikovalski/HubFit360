
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, AlertTriangle } from 'lucide-react';
import { validateFileUpload } from '@/utils/inputValidation';
import { useToast } from "@/hooks/use-toast";

interface SecureFileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number;
  label: string;
}

const SecureFileUpload = ({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  label 
}: SecureFileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const validation = validateFileUpload(file);
    
    if (!validation.isValid) {
      toast({
        title: "Arquivo inválido",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
            <span className="text-xs text-gray-500">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onFileRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-[#019f80] bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Arraste uma foto aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Formatos aceitos: JPEG, PNG, WebP (máx. 5MB)
          </p>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
            id={`file-input-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(`file-input-${label}`)?.click()}
          >
            Selecionar Arquivo
          </Button>
        </div>
      )}
      
      <div className="flex items-start space-x-2 text-xs text-amber-600">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Importante para sua segurança:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Apenas fotos em formatos seguros (JPEG, PNG, WebP)</li>
            <li>Tamanho máximo de 5MB por arquivo</li>
            <li>Não inclua informações pessoais nas fotos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecureFileUpload;
