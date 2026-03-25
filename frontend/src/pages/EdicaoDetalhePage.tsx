import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function EdicaoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  
  // Estados para Expansão e Edição
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formMateria, setFormMateria] = useState({
    titulo: '',
    conteudo: '',
    setor: 'Recursos Humanos'
  });

  const fetchEdicao = useCallback(async () => {
    try {
      const response = await api.get(`edicoes/${id}/`);
      setEdicao(response.data);
    } catch (error) {
      console.error("Erro ao buscar edição:", error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEdicao();
  }, [fetchEdicao]);

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

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormMateria({ titulo: '', conteudo: '', setor: 'Recursos Humanos' });
    setShowForm(true);
  };

  const handleOpenEdit = (materia: Materia) => {
    setEditingId(materia.id);
    setFormMateria({
      titulo: materia.titulo,
      conteudo: materia.conteudo,
      setor: materia.setor
    });
    setShowForm(true);
  };

  const handleSubmitMateria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edicao) return;

    setIsSubmitting(true);
    const data = {
      ...formMateria,
      edicao: edicao.id
    };

    const request = editingId 
      ? api.patch(`materias/${editingId}/`, data)
      : api.post('materias/', data);

    request
      .then(() => {
        setFormMateria({ titulo: '', conteudo: '', setor: 'Recursos Humanos' });
        setShowForm(false);
        setEditingId(null);
        fetchEdicao();
      })
      .catch(error => {
        console.error("Erro ao salvar matéria:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteMateria = (materiaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria? Esta ação não pode ser desfeita.')) {
      api.delete(`materias/${materiaId}/`)
        .then(() => {
          fetchEdicao();
        })
        .catch(error => {
          console.error("Erro ao excluir matéria:", error);
          alert("Não foi possível excluir a matéria.");
        });
    }
  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!edicao) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-indigo-600 font-bold transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Edições
          </button>
          
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
              edicao.esta_aberta 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {edicao.esta_aberta ? 'ABERTA' : 'FECHADA'}
            </span>
          </div>
        </header>

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-white p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-4xl font-black text-indigo-600">#{edicao.numero}</span>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{edicao.tipo}</h1>
              <p className="text-gray-500 font-semibold">
                {edicao.data_publicacao.split('-').reverse().join('/')}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-8">
            <h2 className="text-xl font-bold text-gray-800">Matérias Publicadas</h2>
            {edicao.esta_aberta && (
              <button
                onClick={handleOpenCreate}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nova Matéria</span>
              </button>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {edicao.materias && edicao.materias.length > 0 ? (
              edicao.materias.map(m => (
                <div 
                  key={m.id} 
                  className={`bg-gray-50/50 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    expandedId === m.id ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-100 hover:border-indigo-100'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    className="p-6 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                          {m.setor}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {new Date(m.criado_em).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{m.titulo}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {edicao.esta_aberta && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(m);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar matéria"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {edicao.esta_aberta && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMateria(m.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir matéria"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}

                      <div className={`transform transition-transform duration-300 ${expandedId === m.id ? 'rotate-180' : ''}`}>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedId === m.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-indigo-50 bg-white/50 animate-slide-down">
                      <div 
                        className="text-sm text-gray-600 prose max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: m.conteudo }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                Nenhuma matéria publicada nesta edição ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over de Lançamento/Edição de Matéria */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="px-8 py-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{editingId ? 'Editar Matéria' : 'Lançar Matéria'}</h2>
                <p className="text-indigo-100 text-sm">Edição #{edicao.numero}</p>
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
                  {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Publicar Matéria')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EdicaoDetalhePage;
