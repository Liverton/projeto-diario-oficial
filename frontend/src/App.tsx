// frontend/src/App.tsx
import { useEffect, useState } from 'react';
import api from './services/api';

// Definindo a "forma" dos dados (TypeScript)
interface Edicao {
  id: number;
  numero: number;
  data_publicacao: string;
  esta_aberta: boolean;
}

function App() {
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando Diário Oficial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            🏛️ Diário Oficial - DPES
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe as edições e publicações oficiais.
          </p>
        </header>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Edições Disponíveis
            </h2>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {edicoes.length > 0 ? (
              edicoes.map(edicao => (
                <li key={edicao.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-indigo-600">
                        Edição nº {edicao.numero}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        Publicada em: {edicao.data_publicacao}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {edicao.esta_aberta ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
                          Aberta para matérias
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
                          Fechada
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-10 text-center text-gray-500">
                Nenhuma edição encontrada.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
