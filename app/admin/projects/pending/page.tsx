'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  data: any;
  status: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Verificar se é admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/signin');
      return;
    }
    // Aqui você pode adicionar verificação de role se necessário
  }, [session, status]);

  // Carregar projetos pendentes
  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects/pending');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error('Erro ao carregar projetos');
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBriefing = async (projectId: string) => {
    setProcessingId(projectId);
    try {
      const response = await fetch(`/api/projects/${projectId}/approve-briefing`, {
        method: 'POST'
      });

      if (response.ok) {
        // Remover da lista de pendentes
        setProjects(projects.filter(p => p.id !== projectId));
        setSelectedProject(null);
        alert('Briefing aprovado! A IA está gerando o HTML automaticamente.');
      } else {
        const error = await response.json();
        alert(`Erro ao aprovar: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao aprovar briefing:', error);
      alert('Erro ao aprovar briefing');
    } finally {
      setProcessingId(null);
    }
  };

  const formatProjectData = (data: any) => {
    return {
      'Nome do Site': data.siteName || 'N/A',
      'Tipo de Negócio': data.businessType || 'N/A', 
      'Descrição': data.description || 'N/A',
      'Público-Alvo': data.targetAudience || 'N/A',
      'Principais Serviços': Array.isArray(data.mainServices) ? data.mainServices.join(', ') : (data.mainServices || 'N/A'),
      'Estilo Desejado': data.style || 'N/A',
      'Cores da Marca': Array.isArray(data.brandColors) ? data.brandColors.join(', ') : (data.brandColors || 'N/A'),
      'Requisitos Adicionais': data.additionalRequirements || 'Nenhum',
      'Informações de Contato': data.contactInfo ? JSON.stringify(data.contactInfo, null, 2) : 'N/A'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projetos Pendentes de Aprovação</h1>
          <p className="mt-2 text-gray-600">
            Revise e aprove os briefings dos clientes. Após aprovação, a IA gerará automaticamente o HTML.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto pendente</h3>
            <p className="text-gray-500">Não há briefings esperando aprovação no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de projetos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Projetos ({projects.length})
                  </h3>
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {project.user.name} ({project.user.email})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do projeto */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedProject.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Cliente: {selectedProject.user.name} ({selectedProject.user.email})
                        </p>
                      </div>
                      <button
                        onClick={() => handleApproveBriefing(selectedProject.id)}
                        disabled={processingId === selectedProject.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {processingId === selectedProject.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Aprovando...
                          </>
                        ) : (
                          <>
                            ✅ Aprovar Briefing
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(formatProjectData(selectedProject.data)).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-3">
                          <dt className="text-sm font-medium text-gray-700">{key}:</dt>
                          <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{value}</dd>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">⚡ Próximos Passos</h4>
                      <p className="text-sm text-blue-700">
                        Ao aprovar este briefing:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                        <li>O cliente será notificado da aprovação</li>
                        <li>Nossa IA gerará automaticamente o HTML do site</li>
                        <li>O cliente receberá uma notificação quando o preview estiver pronto</li>
                        <li>O projeto mudará para status "Preview Disponível"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <div className="text-gray-400 text-6xl mb-4">👈</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione um projeto
                    </h3>
                    <p className="text-gray-500">
                      Escolha um projeto na lista ao lado para ver os detalhes do briefing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}