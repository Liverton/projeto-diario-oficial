import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Materia {
  id: number;
  titulo: string;
  conteudo: string;
  setor: string;
  criado_em: string;
}

interface Edicao {
  id: number;
  numero: number;
  data_publicacao: string;
  tipo: 'Ordinária' | 'Extraordinária' | 'Errata';
  esta_aberta: boolean;
  materias: Materia[];
}

interface EdicoesPageProps {
  onLogout: () => void;
}

function EdicoesPage({ onLogout }: EdicoesPageProps) {
  const navigate = useNavigate();
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showEdicaoForm, setShowEdicaoForm] = useState(false);
  const [formEdicao, setFormEdicao] = useState({
    data_publicacao: new Date().toLocaleDateString('en-CA'),
    tipo: 'Ordinária' as Edicao['tipo']
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [edicaoError, setEdicaoError] = useState<string | null>(null);

  const fetchEdicoes = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    api.get('edicoes/')
      .then(response => {
        setEdicoes(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar edições:", error);
        if (error.response?.status === 401) onLogout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onLogout]);

  useEffect(() => {
    fetchEdicoes();
  }, [fetchEdicoes]);

  const handleSubmitEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    setEdicaoError(null);
    setIsSubmitting(true);

    api.post('edicoes/', formEdicao)
      .then(() => {
        setShowEdicaoForm(false);
        setFormEdicao({
          data_publicacao: new Date().toLocaleDateString('en-CA'),
          tipo: 'Ordinária'
        });

        fetchEdicoes(false);
      })
      .catch(err => {
        console.error("Erro ao criar edição:", err);
        const detail = err.response?.data?.data_publicacao || err.response?.data?.numero || "Erro ao criar edição.";
        setEdicaoError(Array.isArray(detail) ? detail[0] : detail);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const edicoesFiltradas = useMemo(() => {
    if (!searchTerm) return edicoes;
    const searchLower = searchTerm.toLowerCase();
    return edicoes.filter(edicao => {
      const numeroMatch = edicao.numero.toString().includes(searchLower);
      const materiaMatch = edicao.materias?.some(m => m.titulo.toLowerCase().includes(searchLower));
      return numeroMatch || materiaMatch;
    });
  }, [searchTerm, edicoes]);

  if (loading && edicoes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-600 font-semibold text-lg animate-pulse">Iniciando Área do Servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8 transition-opacity duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16 relative">
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            <button
              onClick={() => setShowEdicaoForm(true)}
              className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nova Edição</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              title="Sair do Sistema"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
            Diário Oficial <span className="text-indigo-600">DPES</span>
          </h1>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-6">Área do Servidor</p>
        </header>

        <div className="mb-10">
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-12 py-5 border-none bg-white shadow-2xl rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-gray-900 text-lg placeholder-gray-400"
              placeholder="Buscar por nome ou número de portaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white">
          <div className="px-8 py-6 bg-white/50 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edições Disponíveis</h2>
              <p className="text-sm text-gray-500 mt-1">Lista cronológica das publicações</p>
            </div>
            <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 shadow-inner">
              {edicoesFiltradas.length} {edicoesFiltradas.length === 1 ? 'Edição' : 'Edições'}
            </span>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {edicoesFiltradas.length > 0 ? (
              edicoesFiltradas.map(edicao => (
                <li 
                  key={edicao.id} 
                  onClick={() => navigate(`/edicao/${edicao.id}`)}
                  className="px-8 py-7 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-black text-indigo-600">#{edicao.numero}</span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-500 uppercase tracking-tighter shadow-sm">
                          {edicao.tipo}
                        </span>
                        <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-500 font-semibold">
                          {edicao.data_publicacao.split('-').reverse().join('/')}
                        </span>
                      </div>
                      
                      {/* Matérias ocultas na listagem conforme solicitado */}
                    </div>

                    
                    <div className="ml-6 flex flex-col items-end">
                      {edicao.esta_aberta ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>ABERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">FECHADA</span>
                      )}
                      
                      <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-widest">
                          Acessar matérias
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-8 py-20 text-center text-gray-400">Nenhum resultado encontrado</li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal de Nova Edição */}
      {showEdicaoForm && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowEdicaoForm(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative overflow-hidden animate-slide-in">
            <div className="p-8 bg-indigo-600 text-white">
              <h2 className="text-3xl font-black">Nova Edição</h2>
              <p className="text-indigo-100 text-sm mt-1">Configure os dados da nova publicação</p>
            </div>
            
            <form onSubmit={handleSubmitEdicao} className="p-8 space-y-6">
              {edicaoError && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{edicaoError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data de Publicação</label>
                  <input 
                    type="date" required
                    className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800"
                    value={formEdicao.data_publicacao}
                    onChange={e => setFormEdicao({...formEdicao, data_publicacao: e.target.value})}
                  />
                  <p className="mt-2 text-[10px] text-gray-400 font-medium">O número da edição será gerado automaticamente.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Edição</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Ordinária', 'Extraordinária', 'Errata'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormEdicao({...formEdicao, tipo: type})}
                      className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${
                        formEdicao.tipo === type 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowEdicaoForm(false)} className="flex-1 px-6 py-4 border border-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Edição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EdicoesPage;
