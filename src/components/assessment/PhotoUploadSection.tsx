
import PhotoUploadCard from './PhotoUploadCard';

interface PhotoUploadSectionProps {
  photos: {
    front: File | null;
    side: File | null;
    back: File | null;
  };
  onPhotoUpload: (position: 'front' | 'side' | 'back', file: File) => void;
}

const PhotoUploadSection = ({ photos, onPhotoUpload }: PhotoUploadSectionProps) => (
  <div className="grid md:grid-cols-3 gap-6 mb-8">
    <PhotoUploadCard
      position="front"
      title="Foto de Frente"
      description="Posição frontal, braços ao lado do corpo"
      exampleImage="/lovable-uploads/7e388ecd-243f-413c-92c0-21a5a3751761.webp"
      photo={photos.front}
      onPhotoUpload={onPhotoUpload}
    />
    <PhotoUploadCard
      position="side"
      title="Foto de Lado"
      description="Perfil lateral direito, braços ao lado"
      exampleImage="/lovable-uploads/42608c3f-53f3-4d0d-bb0f-5436f91b0440.webp"
      photo={photos.side}
      onPhotoUpload={onPhotoUpload}
    />
    <PhotoUploadCard
      position="back"
      title="Foto de Costas"
      description="Posição posterior, braços ao lado do corpo"
      exampleImage="/lovable-uploads/1ce37401-3eb0-4b50-b9ef-7a88ddb5fb9b.webp"
      photo={photos.back}
      onPhotoUpload={onPhotoUpload}
    />
  </div>
);

export default PhotoUploadSection;
