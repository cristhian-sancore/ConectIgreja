import React from 'react';
import { Flame, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from './Icons';

interface FooterProps {
  churchName?: string;
  pastorName?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagramHandle?: string;
  facebookUrl?: string;
  youtubeChannelId?: string;
}

export const Footer: React.FC<FooterProps> = ({
  churchName = 'ConectIgreja',
  pastorName = 'Pastor Samuel Oliveira',
  address = 'Av. das Nações, 1500 - Centro',
  phone = '5511988887777',
  email = 'contato@conectigreja.cristhiansancore.com.br',
  instagramHandle = '@conectigreja.oficial',
  facebookUrl = 'https://facebook.com',
  youtubeChannelId,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Coluna 1: Sobre */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-xl text-white">
                {churchName}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Uma comunidade de fé comprometida com os ensinamentos de Jesus, o amor ao próximo e o avivamento das famílias.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Pastor Presidente: <strong className="text-slate-300 font-medium">{pastorName}</strong>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#aovivo" className="hover:text-amber-400 transition-colors">Cultos Ao Vivo no YouTube</a></li>
              <li><a href="#programacao" className="hover:text-amber-400 transition-colors">Grade de Programação Semanal</a></li>
              <li><a href="#celulas" className="hover:text-amber-400 transition-colors">Localizador de Células nos Lares</a></li>
              <li><a href="#social" className="hover:text-amber-400 transition-colors">Mural de Fotos & Redes Sociais</a></li>
              <li><a href="#oracao" className="hover:text-amber-400 transition-colors">Enviar Pedido de Oração</a></li>
              <li><a href="#contribuir" className="hover:text-amber-400 transition-colors">Dízimos & Ofertas (PIX)</a></li>
            </ul>
          </div>

          {/* Coluna 3: Localização & Atendimento */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Localização & Contato
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>

          {/* Coluna 4: Redes Sociais & Área Administrativa */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">
              Acompanhe Nossas Redes
            </h4>
            <div className="flex items-center gap-2.5">
              <a
                href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 flex items-center justify-center text-slate-300 hover:text-pink-400 transition-all hover:scale-110"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all hover:scale-110"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={youtubeChannelId ? `https://youtube.com/channel/${youtubeChannelId}` : "https://youtube.com"}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all hover:scale-110"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-900">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <ShieldCheck className="w-4 h-4" />
                Acesso Restrito: Painel Administrativo
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {churchName}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com excelência para o Reino de Deus.
          </p>
        </div>
      </div>
    </footer>
  );
};
