'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SystemConfig {
  id: string
  key: string
  value: string | null
  encrypted: boolean
  category: string
  description: string | null
  createdAt: string
  updatedAt: string
  createdBy: {
    name: string | null
    email: string
  }
}

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  
  // Formulário para nova configuração ou edição
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null)
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    encrypted: false,
    category: 'general',
    description: ''
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-config')
      
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs)
      } else {
        toast.error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (key: string, value: string, options: {
    encrypted?: boolean
    category?: string
    description?: string | null
  } = {}) => {
    try {
      console.log(`🔄 Salvando configuração: ${key}`, { value, options })
      setSaving(key)
      
      const payload = { key, value, ...options }
      console.log('📤 Payload:', payload)
      
      const response = await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response headers:', response.headers)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Resposta:', result)
        toast.success(`Configuração ${key} salva!`)
        fetchConfigs()
      } else {
        console.log('❌ Resposta com erro. Status:', response.status)
        console.log('❌ Response text before JSON:', response.statusText)
        
        let errorText
        try {
          const data = await response.json()
          console.error('❌ Erro na API (JSON):', data)
          errorText = data.error || data.message || 'Erro desconhecido'
        } catch {
          // Se não conseguir fazer parse do JSON, pegar como texto
          errorText = await response.text()
          console.error('❌ Erro na API (TEXT):', errorText)
        }
        
        toast.error(`Erro ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      toast.error('Erro ao salvar configuração: ' + error.message)
    } finally {
      setSaving(null)
    }
  }

  const deleteConfig = async (key: string) => {
    if (!confirm(`Deseja realmente remover a configuração "${key}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/system-config?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Configuração removida!')
        fetchConfigs()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao remover')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao remover configuração')
    }
  }

  const startEdit = (config: SystemConfig) => {
    setEditingConfig(config)
    setFormData({
      key: config.key,
      value: config.encrypted ? '' : (config.value || ''),
      encrypted: config.encrypted,
      category: config.category,
      description: config.description || ''
    })
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingConfig(null)
    setFormData({
      key: '',
      value: '',
      encrypted: false,
      category: 'general',
      description: ''
    })
    setShowForm(false)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.key.trim()) {
      toast.error('Chave é obrigatória')
      return
    }

    await saveConfig(formData.key, formData.value, {
      encrypted: formData.encrypted,
      category: formData.category,
      description: formData.description || null
    })

    // Limpar formulário
    setFormData({
      key: '',
      value: '',
      encrypted: false,
      category: 'general',
      description: ''
    })
    setEditingConfig(null)
    setShowForm(false)
  }

  const quickSetupMinIO = async () => {
    try {
      console.log('🚀 Iniciando Quick Setup MinIO...')
      toast.info('Configurando MinIO...', { duration: 2000 })

      const minioConfigs = [
        { 
          key: 'minio_endpoint', 
          value: 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me',
          category: 'minio',
          description: 'Endpoint do MinIO S3 API'
        },
        { 
          key: 'minio_access_key', 
          value: 'kzNTeGwrChUpHmPn',
          category: 'minio',
          description: 'Access Key do MinIO'
        },
        { 
          key: 'minio_secret_key', 
          value: 'icrEGiYs4nr21mHP8aIDJi2D4HEXyJHq',
          encrypted: true,
          category: 'minio',
          description: 'Secret Key do MinIO (criptografada)'
        },
        { 
          key: 'minio_bucket', 
          value: 'seusiteem24h',
          category: 'minio',
          description: 'Nome do bucket padrão'
        },
        { 
          key: 'minio_region', 
          value: 'us-east-1',
          category: 'minio',
          description: 'Região do MinIO'
        }
      ]

      console.log('📝 Configurações a serem salvas:', minioConfigs)

      // Salvar uma por vez para melhor controle de erro
      for (const config of minioConfigs) {
        console.log(`💾 Salvando: ${config.key}`)
        await saveConfig(config.key, config.value, {
          encrypted: config.encrypted || false,
          category: config.category,
          description: config.description
        })
      }

      toast.success('✅ MinIO configurado com sucesso!')
      console.log('✅ Quick Setup MinIO concluído!')

    } catch (error) {
      console.error('❌ Erro no Quick Setup:', error)
      toast.error('Erro ao configurar MinIO: ' + error.message)
    }
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, SystemConfig[]>)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4 text-gray-600">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/test-auth')
                const data = await response.json()
                console.log('🔍 Teste de auth:', data)
                toast.info(`Auth: ${data.authenticated ? '✅ OK' : '❌ FALHOU'}`)
              } catch (error) {
                console.error('Erro no teste:', error)
                toast.error('Erro no teste de auth')
              }
            }}
            className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            🔍 Test Auth
          </button>
          <button
            onClick={quickSetupMinIO}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            ⚡ Quick Setup MinIO
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancelar' : '+ Nova Configuração'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingConfig ? `Editar: ${editingConfig.key}` : 'Nova Configuração'}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editingConfig ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="ex: smtp_host"
                  readOnly={!!editingConfig}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">Geral</option>
                  <option value="minio">MinIO</option>
                  <option value="smtp">SMTP</option>
                  <option value="ai">IA</option>
                  <option value="integrations">Integrações</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type={formData.encrypted ? "password" : "text"}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Valor da configuração"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição opcional"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="encrypted"
                checked={formData.encrypted}
                onChange={(e) => setFormData(prev => ({ ...prev, encrypted: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="encrypted" className="ml-2 text-sm text-gray-700">
                Valor criptografado (para senhas e chaves sensíveis)
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Configuração
              </button>
              <button
                type="button"
                onClick={editingConfig ? cancelEdit : () => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {Object.keys(groupedConfigs).length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Nenhuma configuração encontrada</p>
          <button
            onClick={quickSetupMinIO}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configurar MinIO Automaticamente
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <div key={category} className="bg-white rounded-lg border">
              <div className="border-b px-6 py-3">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {category === 'minio' ? 'MinIO Storage' : 
                   category === 'smtp' ? 'Email SMTP' :
                   category === 'ai' ? 'Inteligência Artificial' : 
                   category}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {categoryConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {config.key}
                          </span>
                          {config.encrypted && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              🔒 Criptografado
                            </span>
                          )}
                        </div>
                        {config.description && (
                          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Criado por {config.createdBy.name || config.createdBy.email} em{' '}
                          {new Date(config.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                          {config.encrypted ? '***' : (config.value || 'null')}
                        </span>
                        <button
                          onClick={() => startEdit(config)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Editar configuração"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteConfig(config.key)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="Remover configuração"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}