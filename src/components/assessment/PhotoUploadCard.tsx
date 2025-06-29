
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from 'lucide-react';

interface PhotoUploadCardProps {
  position: 'front' | 'side' | 'back';
  title: string;
  description: string;
  exampleImage: string;
  photo: File | string | null;
  onPhotoUpload: (position: 'front' | 'side' | 'back', file: File) => void;
}

const PhotoUploadCard = ({ 
  position, 
  title, 
  description, 
  exampleImage,
  photo,
  onPhotoUpload
}: PhotoUploadCardProps) => {
  
  const getPhotoSrc = () => {
    if (!photo) return null;
    
    // Se é uma string (base64), usar diretamente
    if (typeof photo === 'string') {
      return photo;
    }
    
    // Se é um File, criar URL
    if (photo instanceof File && photo.size > 0) {
      return URL.createObjectURL(photo);
    }
    
    return null;
  };

  const photoSrc = getPhotoSrc();

  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-[#019f80] transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <img 
            src={exampleImage} 
            alt={`Exemplo ${title}`}
            className="w-32 h-40 mx-auto object-cover rounded-lg border-2 border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-2">Exemplo de como tirar a foto</p>
        </div>
        
        <div className="text-center">
          <Label htmlFor={`photo-${position}`} className="cursor-pointer">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#019f80] transition-colors">
              {photoSrc ? (
                <img 
                  src={photoSrc} 
                  alt={`Foto ${title}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Clique para adicionar</p>
                </div>
              )}
            </div>
            <Input
              id={`photo-${position}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoUpload(position, file);
              }}
            />
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadCard;
