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

  if (loading) return <p>Carregando Diário Oficial...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🏛️ Diário Oficial - DPES</h1>
      <hr />
      <h2>Edições Disponíveis</h2>
      <ul>
        {edicoes.map(edicao => (
          <li key={edicao.id}>
            <strong>Edição nº {edicao.numero}</strong> - Publicada em: {edicao.data_publicacao}
            {edicao.esta_aberta ? " (Aberta para matérias)" : " (Fechada)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
