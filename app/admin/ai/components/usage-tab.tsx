"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export function UsageTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Histórico de Uso</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe o uso e performance das APIs de IA
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icons.activity className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Em Desenvolvimento</CardTitle>
          <CardDescription className="text-center">
            Esta funcionalidade será implementada em breve.<br />
            Aqui você poderá ver estatísticas detalhadas de uso, custos e performance.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}