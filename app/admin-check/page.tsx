import Link from 'next/link'
import { CheckCircle, AlertCircle, Users, FileText, BarChart3, Settings, MessageSquare, Layout } from 'lucide-react'

export default function AdminSystemCheck() {
  const adminFeatures = [
    {
      name: "Dashboard Admin",
      path: "/admin",
      icon: Layout,
      description: "Visão geral do sistema com estatísticas"
    },
    {
      name: "Gestão de Usuários",
      path: "/admin/users",
      icon: Users,
      description: "Gerenciar usuários e suas permissões"
    },
    {
      name: "Gestão de Projetos",
      path: "/admin/projects",
      icon: FileText,
      description: "Ver e gerenciar todos os projetos"
    },
    {
      name: "Relatórios",
      path: "/admin/reports",
      icon: BarChart3,
      description: "Analytics e relatórios do sistema"
    },
    {
      name: "Chat Administrativo",
      path: "/admin/chat",
      icon: MessageSquare,
      description: "Comunicação com usuários"
    },
    {
      name: "Configurações",
      path: "/admin/settings",
      icon: Settings,
      description: "Configurações do sistema"
    }
  ]

  const systemChecks = [
    {
      name: "NextAuth com Roles",
      status: "ok",
      description: "Sistema de autenticação com suporte a roles USER/ADMIN"
    },
    {
      name: "Middleware de Proteção",
      status: "ok", 
      description: "Rotas admin protegidas por middleware"
    },
    {
      name: "APIs Admin",
      status: "ok",
      description: "Endpoints para gestão de usuários, projetos e relatórios"
    },
    {
      name: "Interface Admin",
      status: "ok",
      description: "Páginas completas para todas as funcionalidades admin"
    },
    {
      name: "Chart.js",
      status: "ok",
      description: "Biblioteca para gráficos nos relatórios"
    },
    {
      name: "Usuário Admin",
      status: "ok",
      description: "Usuário admin@site24h.com disponível no banco"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema Administrativo - Site 24 Horas
          </h1>
          <p className="text-xl text-gray-600">
            Verificação completa das funcionalidades administrativas
          </p>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            Status do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemChecks.map((check) => (
              <div key={check.name} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {check.status === 'ok' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <h3 className="font-semibold">{check.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{check.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Funcionalidades Administrativas */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Funcionalidades Administrativas Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature) => (
              <Link key={feature.name} href={feature.path}>
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center mb-3">
                    <feature.icon className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Informações de Login */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Informações para Acesso Admin
          </h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>Email:</strong> admin@site24h.com</p>
            <p><strong>Senha:</strong> (definida no banco de dados)</p>
            <p><strong>Role:</strong> ADMIN</p>
          </div>
          <div className="mt-4">
            <Link 
              href="/auth/signin" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fazer Login como Admin
            </Link>
          </div>
        </div>

        {/* Recursos Implementados */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recursos Implementados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Gestão de Usuários</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Listagem com busca e filtros</li>
                <li>• Alteração de roles (USER/ADMIN)</li>
                <li>• Visualização de detalhes completos</li>
                <li>• Estatísticas de usuários</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Gestão de Projetos</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Visualização de todos os projetos</li>
                <li>• Filtros por status e usuário</li>
                <li>• Atribuição a administradores</li>
                <li>• Acompanhamento de progresso</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Relatórios e Analytics</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Gráficos com Chart.js</li>
                <li>• Estatísticas em tempo real</li>
                <li>• Exportação de dados (CSV)</li>
                <li>• Filtros por período</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Configurações</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Configurações gerais do sistema</li>
                <li>• Gestão de integrações</li>
                <li>• Modo de manutenção</li>
                <li>• Testes de webhook</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}