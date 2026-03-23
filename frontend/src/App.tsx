import { useEffect, useState, useMemo, useCallback } from 'react';
import api from './services/api';
import Login from './Login';

// Definindo a "forma" dos dados (TypeScript)
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
  esta_aberta: boolean;
  materias: Materia[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(false); // Começa como false para não travar a tela de login
  const [searchTerm, setSearchTerm] = useState('');

  const [edicaoSelecionada, setEdicaoSelecionada] = useState<Edicao | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMateria, setFormMateria] = useState({
    titulo: '',
    conteudo: '',
    setor: 'Recursos Humanos'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setEdicoes([]);
    setIsAuthenticated(false);
  }, []);

  const fetchEdicoes = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    api.get('edicoes/')
      .then(response => {
        setEdicoes(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar edições:", error);
        if (error.response?.status === 401) handleLogout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [handleLogout]);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchEdicoes();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [isAuthenticated, fetchEdicoes]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'docx' && ext !== 'odt') {
      setConvertError('Formato inválido. Use apenas .docx ou .odt');
      return;
    }

    setConvertError(null);
    setIsConverting(true);
    const formData = new FormData();
    formData.append('arquivo', file);

    api.post('converter-documento/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => {
      console.log('Conversão realizada:', res.data.html);
      setFormMateria(prev => ({ ...prev, conteudo: res.data.html }));
    })
    .catch(err => {
      const msg = err.response?.data?.erro || 'Falha ao converter o arquivo.';
      setConvertError(msg);
    })
    .finally(() => {
      setIsConverting(false);
      e.target.value = '';
    });
  };

  const handleSubmitMateria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edicaoSelecionada) return;

    setIsSubmitting(true);
    api.post('materias/', {
      ...formMateria,
      edicao: edicaoSelecionada.id
    })
    .then(() => {
      setFormMateria({ titulo: '', conteudo: '', setor: 'Recursos Humanos' });
      setShowForm(false);
      setEdicaoSelecionada(null);
      fetchEdicoes(false);
    })
    .catch(error => {
      console.error("Erro ao lançar matéria:", error);
      if (error.response?.status === 401) handleLogout();
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

  // Se não estiver autenticado, mostramos a tela de login imediatamente
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Se estiver autenticado e carregando mas sem dados, mostra loading cleaner
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
          <div className="absolute top-0 right-0">
            <button
              onClick={handleLogout}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center space-x-2 group"
              title="Sair do Sistema"
            >
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Sair</span>
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
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-6">
            Área do Servidor
          </p>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Portal de transparência para acompanhamento de edições e publicações oficiais da Defensoria Pública.
          </p>
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
                <li key={edicao.id} className="px-8 py-7 hover:bg-gray-50/50 transition-all duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-black text-indigo-600">#{edicao.numero}</span>
                        <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-500 font-semibold">
                          {new Date(edicao.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {edicao.materias?.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matérias na edição:</h4>
                          <div className="space-y-2">
                            {edicao.materias.map(m => (
                              <div key={m.id} className="flex items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-700">{m.titulo}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end">
                      {edicao.esta_aberta ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>ABERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">FECHADA</span>
                      )}
                      <div className="mt-4 flex flex-col space-y-2">
                        {edicao.esta_aberta && (
                          <button 
                            onClick={() => { setEdicaoSelecionada(edicao); setShowForm(true); }}
                            className="text-xs font-bold uppercase tracking-wider px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                          >
                            Lançar Matéria
                          </button>
                        )}
                        <button className="text-sm font-semibold text-gray-600 hover:text-indigo-600 flex items-center justify-end transition-colors">
                          Ver Edição
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
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

      {showForm && edicaoSelecionada && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Lançar Matéria</h2>
                <p className="text-indigo-100 text-sm">Edição #{edicaoSelecionada.numero}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitMateria} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Título da Matéria</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={formMateria.titulo}
                  onChange={e => setFormMateria({...formMateria, titulo: e.target.value})}
                />
              </div>
              {/* Restante do formulário mantido conforme anterior... */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Setor</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={formMateria.setor}
                  onChange={e => setFormMateria({...formMateria, setor: e.target.value})}
                >
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Jurídico">Jurídico</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Comunicação">Comunicação</option>
                  <option value="Gabinete">Gabinete</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Conteúdo</label>
                  <label className={`cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isConverting
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    {isConverting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Convertendo...</span>
                      </>
                    ) : (
                      <>
                        <span>Importar .docx / .odt</span>
                        <input type="file" accept=".docx,.odt" className="hidden" disabled={isConverting} onChange={handleFileImport} />
                      </>
                    )}
                  </label>
                </div>
                {convertError && <p className="text-red-500 text-xs mb-2">{convertError}</p>}
                <textarea
                  required
                  className="flex-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 min-h-[250px] font-mono text-sm outline-none"
                  value={formMateria.conteudo}
                  onChange={e => setFormMateria({...formMateria, conteudo: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-6 border-t flex space-x-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl disabled:opacity-50">
                  {isSubmitting ? 'Publicando...' : 'Publicar Matéria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
