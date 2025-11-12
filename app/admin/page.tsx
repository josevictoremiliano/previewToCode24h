'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalProjects: number
  pendingApprovals: number
  previewReady: number
  completedProjects: number
  totalUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // TODO: Criar endpoint para estatísticas do dashboard
      // const response = await fetch('/api/admin/dashboard-stats')
      
      // Mock data por enquanto
      setStats({
        totalProjects: 15,
        pendingApprovals: 3,
        previewReady: 5,
        completedProjects: 7,
        totalUsers: 25
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Gerencie projetos, usuários e configurações do sistema</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total de Projetos</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalProjects || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Aguardando Aprovação</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.pendingApprovals || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Preview Pronto</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.previewReady || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Concluídos</h3>
            <p className="text-2xl font-bold text-gray-600">{stats?.completedProjects || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total de Usuários</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link 
          href="/admin/projects"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Gerenciar Projetos</h3>
              <p className="text-gray-600 text-sm">Aprovar briefings e acompanhar progresso</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/system-config"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
              <p className="text-gray-600 text-sm">MinIO, SMTP, IA e outras configurações</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/users"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
              <p className="text-gray-600 text-sm">Gerenciar contas e permissões</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo projeto criado: "Site da Empresa XYZ"</p>
                  <p className="text-xs text-gray-500">Há 2 horas</p>
                </div>
              </div>
              <Link 
                href="/admin/projects"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Ver projeto →
              </Link>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Preview aprovado pelo cliente: "Landing Page Tech"</p>
                  <p className="text-xs text-gray-500">Há 4 horas</p>
                </div>
              </div>
              <span className="text-green-600 text-sm">✅ Concluído</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Projeto aguardando aprovação: "E-commerce Fashion"</p>
                  <p className="text-xs text-gray-500">Há 6 horas</p>
                </div>
              </div>
              <Link 
                href="/admin/projects"
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Revisar →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Status do Sistema</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">MinIO Storage</p>
                <p className="text-xs text-gray-500">Conectado e funcionando</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email SMTP</p>
                <p className="text-xs text-gray-500">Configuração pendente</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">IA Generator</p>
                <p className="text-xs text-gray-500">Operacional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}