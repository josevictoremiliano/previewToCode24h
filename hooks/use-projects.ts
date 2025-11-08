"use client"

import { useEffect, useState, useCallback } from 'react'

interface Project {
  id: string
  name: string
  status: string
  createdAt: string
  previewUrl?: string
  finalUrl?: string
  thumbnailUrl: string
}

export function useProjects(searchTerm: string = '', statusFilter: string = 'all') {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/projects?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar projetos')
      }

      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar projetos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchProjects()
  }, [searchTerm, statusFilter, fetchProjects])

  const refetch = async () => {
    setError(null)
    await fetchProjects()
  }

  return { projects, isLoading, error, refetch }
}