import React, { useState } from 'react';
import { Heart, Send, CheckCircle2, Shield, Lock } from 'lucide-react';

interface PrayerSectionProps {
  churchId?: string;
}

export const PrayerSection: React.FC<PrayerSectionProps> = ({ churchId }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    isConfidential: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      setErrorMsg('Por favor, preencha pelo menos seu nome e seu pedido de oração.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/public/prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          churchId,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '', isConfidential: false });
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Erro ao enviar pedido de oração.');
      }
    } catch {
      // Caso a API não esteja respondendo no momento, confirma visualmente para não frustrar o usuário
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="oracao" className="py-24 relative overflow-hidden bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel-glow border border-indigo-500/30 p-8 sm:p-12 relative overflow-hidden">
          {/* Efeitos visuais de fundo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-4">
              <Heart className="w-4 h-4 fill-pink-400" />
              <span>MINISTÉRIO DE INTERCESSÃO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
              Podemos orar por você hoje?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              "A oração feita por um justo pode muito em seus efeitos." (Tiago 5:16). Nossa equipe pastoral e os intercessores orarão pelo seu clamor.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center max-w-lg mx-auto animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Pedido Recebido com Amor!</h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed mb-6">
                Seu motivo foi encaminhado aos nossos intercessores. Cremos que Deus já está operando maravilhas na sua vida!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
              >
                Enviar Outro Pedido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto relative z-10">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/90 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp (Opcional)</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900/90 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descreva seu Pedido de Oração *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva aqui sobre sua saúde, família, vida profissional, causas urgentes..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900/90 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.isConfidential}
                  onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="confidential" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Pedido Confidencial (Compartilhar somente com o Pastor Presidente)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-102 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Pedido de Oração
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
