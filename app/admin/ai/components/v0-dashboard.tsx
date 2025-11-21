'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface V0DashboardProps {
  configs: any[]
}

export function V0Dashboard({ configs }: V0DashboardProps) {
  const v0Configs = configs.filter(config => config.provider === 'v0')
  const activeV0Config = v0Configs.find(config => config.isActive)
  const totalV0Usage = v0Configs.reduce((sum, config) => sum + config._count.usageLogs, 0)

  if (v0Configs.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icons.zap className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-900">V0 API Dashboard</CardTitle>
          {activeV0Config && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Icons.check className="w-3 h-3 mr-1" />
              Ativo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{v0Configs.length}</div>
            <div className="text-sm text-purple-700">Configurações V0</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-blue-600">{totalV0Usage}</div>
            <div className="text-sm text-blue-700">Componentes Gerados</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-green-600">
              {activeV0Config ? '100%' : '0%'}
            </div>
            <div className="text-sm text-green-700">Status Operacional</div>
          </div>
          
          <div className="text-center p-4 bg-white/50 rounded-lg border border-purple-100">
            <div className="text-2xl font-bold text-orange-600">
              {activeV0Config?.model || 'N/A'}
            </div>
            <div className="text-sm text-orange-700">Modelo Ativo</div>
          </div>
        </div>
        
        {activeV0Config && (
          <div className="mt-4 p-3 bg-white/70 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-purple-900">Configuração Ativa</h4>
                <p className="text-xs text-purple-700">
                  {activeV0Config.model} • {activeV0Config._count.usageLogs} usos • 
                  Criado em {new Date(activeV0Config.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Icons.zap className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Pronto para uso</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}