"use client"

import { useEffect, useState } from 'react'

interface DashboardStats {
  totalSites: number
  sitesInProduction: number
  sitesPending: number
  sitesCompleted: number
  creditsAvailable: number
}

interface RecentProject {
  id: string
  name: string
  status: string
  createdAt: string
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Buscar estatísticas e projetos recentes em paralelo
        const [statsResponse, projectsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-projects')
        ])

        if (!statsResponse.ok || !projectsResponse.ok) {
          throw new Error('Erro ao carregar dados')
        }

        const statsData = await statsResponse.json()
        const projectsData = await projectsResponse.json()

        setStats(statsData)
        
        // Converter datas de string para Date
        const processedProjects = projectsData.map((project: RecentProject) => ({
          ...project,
          createdAt: project.createdAt
        }))
        
        setRecentProjects(processedProjects)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar dados do dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, recentProjects, isLoading, error }
}