import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Search, Image as ImageIcon, Link } from 'lucide-react';

const CURATED_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80', label: 'Gradiente Azul' },
  { id: '2', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', label: 'Gradiente Colorido' },
  { id: '3', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', label: 'Tecnologia' },
  { id: '4', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80', label: 'Gradiente Escuro' },
  { id: '5', url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80', label: 'Cidade Noturna' },
  { id: '6', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', label: 'Montanhas' },
  { id: '7', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80', label: 'Nebulosa' },
  { id: '8', url: 'https://images.unsplash.com/photo-1516616370751-86d6bd8b0651?w=800&q=80', label: 'Abstrato Escuro' },
  { id: '9', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', label: 'Tokyo' },
  { id: '10', url: 'https://images.unsplash.com/photo-1475274047050-1d0c55b0033f?w=800&q=80', label: 'Cidade Moderna' },
  { id: '11', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80', label: 'Espaço' },
  { id: '12', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', label: 'Montanha Nevada' },
];

interface UnsplashImagePickerProps {
  currentImage: string;
  onSelect: (url: string) => void;
}

export function UnsplashImagePicker({ currentImage, onSelect }: UnsplashImagePickerProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImages = searchTerm
    ? CURATED_IMAGES.filter(img => img.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : CURATED_IMAGES;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar imagens..."
          className="pl-9 text-sm"
        />
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
        {filteredImages.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelect(img.url)}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all aspect-video ${
              currentImage === img.url
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-transparent hover:border-primary/40'
            }`}
          >
            <img
              src={img.url}
              alt={img.label}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              {currentImage === img.url ? (
                <div className="bg-primary rounded-full p-1">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              ) : (
                <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 truncate">
              {img.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom URL */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Link className="w-3 h-3" />
          URL personalizada
        </Label>
        <div className="flex gap-2">
          <Input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="font-mono text-xs flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { if (customUrl.trim()) { onSelect(customUrl.trim()); setCustomUrl(''); } }}
            disabled={!customUrl.trim()}
          >
            Aplicar
          </Button>
        </div>
      </div>

      {/* Current preview */}
      {currentImage && (
        <div className="relative rounded-lg overflow-hidden border border-border h-20">
          <img src={currentImage} alt="Fundo selecionado" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded">Fundo atual</span>
          </div>
        </div>
      )}
    </div>
  );
}
