// frontend/src/App.tsx
import { useEffect, useState, useMemo } from 'react';
import api from './services/api';

// Definindo a "forma" dos dados (TypeScript)
interface Materia {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: string;
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
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Função que busca os dados no Django
    api.get('edicoes/')
      .then(response => {
        setEdicoes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar edições:", error);
        setLoading(false);
      });
  }, []);

  // Lógica de filtro: filtra por número da edição ou por título das matérias
  const edicoesFiltradas = useMemo(() => {
    if (!searchTerm) return edicoes;
    
    const searchLower = searchTerm.toLowerCase();
    return edicoes.filter(edicao => {
      // Verifica se o número da edição contém o termo
      const numeroMatch = edicao.numero.toString().includes(searchLower);
      
      // Verifica se alguma matéria contém o termo no título
      const materiaMatch = edicao.materias?.some(materia => 
        materia.titulo.toLowerCase().includes(searchLower)
      );

      return numeroMatch || materiaMatch;
    });
  }, [searchTerm, edicoes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-600 font-semibold text-lg animate-pulse">
            Carregando Diário Oficial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            Diário Oficial <span className="text-indigo-600">DPES</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Portal de transparência para acompanhamento de edições e publicações oficiais da Defensoria Pública.
          </p>
        </header>

        {/* Campo de Busca */}
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
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 bg-white inline-block px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                🔍 Mostrando resultados para: <span className="font-bold text-indigo-600">"{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white">
          <div className="px-8 py-6 bg-white/50 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Edições Disponíveis
              </h2>
              <p className="text-sm text-gray-500 mt-1">Lista cronológica das publicações</p>
            </div>
            <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 shadow-inner">
              {edicoesFiltradas.length} {edicoesFiltradas.length === 1 ? 'Edição' : 'Edições'}
            </span>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {edicoesFiltradas.length > 0 ? (
              edicoesFiltradas.map(edicao => {
                const searchLower = searchTerm.toLowerCase();
                const materiasCorrespondentes = searchTerm 
                  ? edicao.materias?.filter(m => m.titulo.toLowerCase().includes(searchLower))
                  : [];

                return (
                  <li key={edicao.id} className="px-8 py-7 hover:bg-gray-50/50 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-black text-indigo-600">
                            #{edicao.numero}
                          </span>
                          <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-500 font-semibold">
                            {new Date(edicao.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        
                        {/* Seção de Matérias Encontradas */}
                        {materiasCorrespondentes.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Matérias correspondentes:
                            </h4>
                            <div className="space-y-2">
                              {materiasCorrespondentes.map(m => (
                                <div key={m.id} className="flex items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 group/item">
                                  <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></div>
                                  <span className="text-sm font-medium text-gray-700 leading-tight">
                                    {m.titulo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex flex-col items-end">
                        {edicao.esta_aberta ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 shadow-sm">
                            <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
                            ABERTA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            FECHADA
                          </span>
                        )}
                        <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                          Acessar Edição
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-8 py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 text-gray-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma edição disponível'}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {searchTerm 
                    ? `Não encontramos edições ou portarias correspondentes a "${searchTerm}". Tente outros termos.`
                    : 'Aguarde publicações oficiais serem lançadas no sistema.'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-6 text-indigo-600 font-bold hover:underline"
                  >
                    Ver todas as edições
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
