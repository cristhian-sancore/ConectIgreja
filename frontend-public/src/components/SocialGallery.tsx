import React, { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './Icons';

interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  platform: 'instagram' | 'facebook';
  likes: number;
}

interface SocialGalleryProps {
  gallery?: GalleryItem[];
  instagramHandle?: string;
  facebookUrl?: string;
}

export const SocialGallery: React.FC<SocialGalleryProps> = ({
  gallery = [],
  instagramHandle = '@conectigreja.oficial',
  facebookUrl = 'https://facebook.com',
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const defaultGallery: GalleryItem[] = gallery.length > 0 ? gallery : [
    {
      id: '1',
      title: 'Celebração de Domingo',
      caption: 'Uma noite inesquecível na presença de Deus com nossa família reunida no Templo Sede.',
      imageUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1000&q=80',
      date: 'Ontem',
      platform: 'instagram',
      likes: 184,
    },
    {
      id: '2',
      title: 'Batismo nas Águas',
      caption: 'Novas vidas declarando publicamente sua fé em Jesus Cristo! O céu está em festa!',
      imageUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80',
      date: '3 dias atrás',
      platform: 'instagram',
      likes: 247,
    },
    {
      id: '3',
      title: 'Comunhão nas Células',
      caption: 'O evangelho avançando de casa em casa com amor, alegria e partilha do pão.',
      imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80',
      date: '5 dias atrás',
      platform: 'facebook',
      likes: 92,
    },
    {
      id: '4',
      title: 'Vigília e Clamor Jovem',
      caption: 'Geração apaixonada por Jesus se rendendo ao chamado do Senhor na madrugada.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
      date: '1 semana atrás',
      platform: 'instagram',
      likes: 310,
    },
  ];

  return (
    <section id="social" className="py-24 relative bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>MURAL DAS PROGRAMAÇÕES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
              Momentos Marcantes & Redes Sociais
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
              Veja os registros fotográficos de nossos cultos, congressos, retiros e ações sociais. Siga nossas páginas oficiais!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-105"
            >
              <InstagramIcon className="w-4 h-4" />
              {instagramHandle}
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <FacebookIcon className="w-4 h-4" />
              Facebook
            </a>
          </div>
        </div>

        {/* Grade de Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-3xl overflow-hidden glass-panel border border-slate-800 hover:border-pink-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-pink-500/10 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badge da Rede Social */}
                <div className="absolute top-3.5 right-3.5">
                  {item.platform === 'instagram' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Overlay no Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-3 text-white text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-3.5 h-3.5 fill-pink-400" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Comentar
                    </span>
                  </div>
                  <p className="text-white text-xs font-light line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate">{item.title}</span>
                <span className="text-slate-500 text-[11px] shrink-0">{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalhe da Foto */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scaleUp">
              <div className="relative aspect-video sm:aspect-[4/3] bg-black">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{selectedImage.title}</h3>
                  <span className="text-xs text-pink-400 font-semibold flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-pink-400" />
                    {selectedImage.likes} curtidas
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-light leading-relaxed mb-4">
                  {selectedImage.caption}
                </p>
                <div className="flex justify-end">
                  <a
                    href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300"
                  >
                    Ver publicação no {selectedImage.platform === 'instagram' ? 'Instagram' : 'Facebook'}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
