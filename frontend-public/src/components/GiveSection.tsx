import React, { useState } from 'react';
import { HeartHandshake, Copy, Check, QrCode, Building, Sparkles } from 'lucide-react';

interface GiveSectionProps {
  pixKey?: string;
  pixType?: string;
  pixRecipient?: string;
  churchName?: string;
}

export const GiveSection: React.FC<GiveSectionProps> = ({
  pixKey = 'contato@conectigreja.cristhiansancore.com.br',
  pixType = 'E-mail',
  pixRecipient = 'Igreja Conectada',
  churchName = 'ConectIgreja',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="contribuir" className="py-24 relative bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>GENEROSIDADE & GRATIDÃO</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
            Dízimos e Ofertas
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-light">
            "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Coríntios 9:7)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card PIX */}
          <div className="p-8 rounded-3xl glass-panel-glow border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  PIX Instantâneo
                </span>
                <QrCode className="w-6 h-6 text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Chave Oficial PIX</h3>
              <p className="text-xs text-slate-300 font-light mb-6">
                Contribua com dízimos ou ofertas de maneira segura e direta de qualquer aplicativo de banco.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tipo de Chave:</span>
                  <span className="font-semibold text-slate-200">{pixType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Favorecido:</span>
                  <span className="font-semibold text-slate-200">{pixRecipient}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Chave:</span>
                  <code className="text-xs text-amber-300 font-mono break-all font-semibold">
                    {pixKey}
                  </code>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" />
                  Chave PIX Copiada com Sucesso!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Chave PIX
                </>
              )}
            </button>
          </div>

          {/* Card Contas Bancárias / Missões */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Transferência & Missões
                </span>
                <Building className="w-6 h-6 text-indigo-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Conta Bancária Oficial</h3>
              <p className="text-xs text-slate-300 font-light mb-6">
                Nossos dízimos e ofertas sustentam a obra missionária, ações sociais e a manutenção do templo sagrado.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Banco:</span>
                  <span className="text-slate-200 font-semibold">Banco do Brasil (001)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Agência:</span>
                  <span className="text-slate-200 font-semibold font-mono">1234-5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conta Corrente:</span>
                  <span className="text-slate-200 font-semibold font-mono">98765-4</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">CNPJ:</span>
                  <span className="text-slate-200 font-semibold font-mono">12.345.678/0001-90</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 mt-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Para ofertas com destino específico (ex: Missões ou Obras), identifique na descrição.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
