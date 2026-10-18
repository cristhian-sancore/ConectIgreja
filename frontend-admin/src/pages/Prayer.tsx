import React, { useState } from 'react';
import { Heart, Lock, CheckCircle2, Clock, MessageCircle, Trash2 } from 'lucide-react';

interface PrayerPageProps {
  requests: any[];
  onRefresh: () => void;
}

export const Prayer: React.FC<PrayerPageProps> = ({ requests, onRefresh }) => {
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/prayer-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este pedido de oração?')) {
      await fetch(`/api/prayer-requests/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const handleContactWhatsApp = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const text = `Graça e Paz, ${name}! Recebemos seu pedido de oração no site da nossa igreja e queremos dizer que nossa equipe pastoral está intercedendo por você! 🙏✨`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-white tracking-tight">
          Ministério de Intercessão & Pedidos de Oração
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pedidos recebidos através do site público e dos membros da congregação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-6 rounded-2xl admin-card border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    req.status === 'EM_ORACAO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : req.status === 'ATENDIDO'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {req.status === 'EM_ORACAO' ? 'Em Intercessão' : req.status === 'ATENDIDO' ? 'Milagre / Atendido' : 'Pendente'}
                </span>

                {req.isConfidential && (
                  <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    Confidencial
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1">{req.name}</h3>
              {req.phone && (
                <span className="text-xs text-emerald-400 font-mono block mb-3">{req.phone}</span>
              )}

              <p className="text-xs text-slate-300 font-light bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed mb-4">
                "{req.message}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {req.status !== 'EM_ORACAO' && (
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'EM_ORACAO')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold"
                  >
                    Orar
                  </button>
                )}
                {req.status !== 'ATENDIDO' && (
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'ATENDIDO')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold"
                  >
                    Atendido
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {req.phone && (
                  <button
                    title="Mandar Mensagem no WhatsApp"
                    onClick={() => handleContactWhatsApp(req.phone, req.name)}
                    className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  title="Excluir"
                  onClick={() => handleDelete(req.id)}
                  className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
