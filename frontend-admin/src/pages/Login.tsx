import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem('conectigreja_user', JSON.stringify(data.user));
          localStorage.setItem('conectigreja_token', data.token);
        } else {
          sessionStorage.setItem('conectigreja_user', JSON.stringify(data.user));
          sessionStorage.setItem('conectigreja_token', data.token);
        }
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMessage(data.error || 'Falha ao autenticar. Verifique seus dados.');
      }
    } catch (err: any) {
      setErrorMessage(`Erro ao conectar ao servidor: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Luzes de Fundo (Backdrop Glows) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Barra Superior Dourada */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500" />

          {/* Logo & Identidade Visual */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-950 border border-amber-500/40 p-2.5 shadow-lg shadow-amber-500/10 flex items-center justify-center">
              <img
                src="/uploads/logos/conectigreja-official-logo.svg"
                alt="ConectIgreja Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Painel Administrativo & Liderança</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              CONECT<span className="text-amber-400">IGREJA</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Gestão Eclesiástica Integrada, Membresia, Finanças & Comunicação WhatsApp
            </p>
          </div>

          {/* Alerta de Erro */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="seu.email@conectigreja.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 text-white pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 text-xs focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Senha</span>
                <span className="text-[10px] text-slate-500">Padrão: 123456 ou admin</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 text-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 text-xs focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Lembrar meu acesso</span>
              </label>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@conectigreja.com.br', 'admin')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Esqueci a senha
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Perfis de Acesso Rápido / Demonstração */}
          <div className="mt-7 pt-6 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
              Perfis de Acesso Rápido para Teste
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@conectigreja.com.br', 'admin')}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                    👑
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                      Super Administrador Estadual
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      admin@conectigreja.com.br
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Preencher →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcos.campinas@conectigreja.cristhiansancore.com.br', '123456')}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    🏛️
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-indigo-300 transition-colors">
                      Pastor Local (Filial Esperança)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px] block">
                      marcos.campinas@conectigreja...
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Preencher →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Seguro */}
        <div className="text-center mt-6 text-slate-500 text-[11px] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>ConectIgreja v2.0 • Conexão Segura SSL/TLS & WhatsApp API</span>
        </div>
      </div>
    </div>
  );
};
