import React, { useState } from 'react';
import api from './services/api';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('auth/token/', { username, password });
      const { access } = response.data;
      localStorage.setItem('token', access);
      onLogin(access);
    } catch (err) {
      console.error('Erro de login:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = err as any; 
      if (axiosError.response?.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        setError('Erro ao conectar ao servidor. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl space-y-8 animate-slide-in relative">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-2.107-7.705L4.47 10.652M4 10.652a22.95 22.95 0 00.707-3.676M7.47 10.652a22.903 22.903 0 01-3.047-3.676m14.504 3.676a22.902 22.902 0 01-3.047-3.676M17.47 10.652a22.95 22.95 0 00.707-3.676M17.47 10.652l3.003 3.003m0 0l-3.003 3.003m3.003-3.003H17.47m0 0l-3-3m3 3l-3 3"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Diário Oficial</h1>
          <p className="text-gray-400 mt-2">Acesso exclusivo para servidores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-xl animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest pl-1">Usuário</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
              placeholder="Digite seu usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest pl-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-900/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Defensoria Pública do Estado do Espírito Santo
        </p>
      </div>
    </div>
  );
};

export default Login;
