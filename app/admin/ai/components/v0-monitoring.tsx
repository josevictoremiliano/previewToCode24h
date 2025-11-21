'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface V0MonitoringProps {
  configs: any[]
}

export function V0Monitoring({ configs }: V0MonitoringProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [healthStatus, setHealthStatus] = useState<{[key: string]: 'healthy' | 'warning' | 'error' | 'unknown'}>({})

  const v0Configs = configs.filter(config => config.provider === 'v0')

  const checkV0Health = async (configId: string) => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/admin/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          configId,
          testPrompt: 'Health check: create a simple div with "OK" text'
        })
      })

      if (response.ok) {
        setHealthStatus(prev => ({ ...prev, [configId]: 'healthy' }))
        toast.success('V0 API funcionando corretamente')
      } else {
        setHealthStatus(prev => ({ ...prev, [configId]: 'error' }))
        toast.error('V0 API com problemas')
      }
    } catch (error) {
      setHealthStatus(prev => ({ ...prev, [configId]: 'error' }))
      toast.error('Erro ao verificar V0 API')
    } finally {
      setIsChecking(false)
    }
  }

  const checkAllV0Health = async () => {
    for (const config of v0Configs) {
      await checkV0Health(config.id)
      // Delay between checks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Icons.check className="h-4 w-4" />
      case 'warning': return <Icons.alertTriangle className="h-4 w-4" />
      case 'error': return <Icons.x className="h-4 w-4" />
      default: return <Icons.info className="h-4 w-4" />
    }
  }

  if (v0Configs.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.activity className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Monitoramento V0</CardTitle>
          </div>
          <Button
            onClick={checkAllV0Health}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Icons.refresh className="mr-2 h-4 w-4" />
                Verificar Status
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {v0Configs.map((config) => {
            const status = healthStatus[config.id] || 'unknown'
            return (
              <div
                key={config.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <div className="font-medium">
                      {config.model}
                      {config.isActive && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm opacity-75">
                      {config._count.usageLogs} gerações realizadas
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {status === 'healthy' && 'Saudável'}
                    {status === 'warning' && 'Atenção'}
                    {status === 'error' && 'Offline'}
                    {status === 'unknown' && 'Desconhecido'}
                  </div>
                  <Button
                    onClick={() => checkV0Health(config.id)}
                    disabled={isChecking}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                  >
                    Testar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Alertas e Recomendações */}
        <div className="mt-4 space-y-2">
          {v0Configs.length === 0 && (
            <div className="p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
              <Icons.alertTriangle className="inline h-4 w-4 mr-2" />
              Nenhuma configuração V0 encontrada. Configure uma API key V0 para começar.
            </div>
          )}
          
          {v0Configs.length > 0 && !v0Configs.some(c => c.isActive) && (
            <div className="p-3 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg text-sm">
              <Icons.alertTriangle className="inline h-4 w-4 mr-2" />
              Nenhuma configuração V0 ativa. Ative uma configuração para usar a geração de componentes.
            </div>
          )}

          {Object.values(healthStatus).some(status => status === 'error') && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
              <Icons.x className="inline h-4 w-4 mr-2" />
              Algumas configurações V0 estão com problemas. Verifique suas API keys.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}