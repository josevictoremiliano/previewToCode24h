import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Project {
    id: string
    htmlContent?: string
    htmlFeedback?: string
    copy?: string
    status: string
    data: Record<string, unknown>
    briefing?: {
        siteName: string
        businessType: string
        description: string
        targetAudience: string
        mainServices: string
        contactInfo: string
        brandColors: string
        style: string
        additionalRequirements?: string
    }
}

interface ProjectV0TabProps {
    project: Project
    processing: string | null
    onApproveForClient: () => void
    onUpdateStatus: () => void
    onRefresh: () => void
}

export function ProjectV0Tab({
    project,
    processing,
    onApproveForClient,
    onUpdateStatus,
    onRefresh
}: ProjectV0TabProps) {
    const [editingHtml, setEditingHtml] = useState(false)
    const [editedHtml, setEditedHtml] = useState(project.htmlContent || "")

    const generatePrompt = () => {
        // Tenta obter o briefing da propriedade direta ou do campo data
        const briefing = project.briefing || (project.data as any)?.briefing || (project.data as any)
        const copy = project.copy

        if (!briefing && !copy) {
            return `Briefing e Copy não encontrados.\n\nDebug Data Keys: ${Object.keys(project.data || {}).join(', ')}`
        }
        if (!briefing) {
            return `Briefing não encontrado.\n\nDebug Data Keys: ${Object.keys(project.data || {}).join(', ')}`
        }
        if (!copy) {
            return "Copy não encontrada."
        }

        // Extrair dados adicionais do project.data
        const projectData = project.data as any || {}
        const images = projectData.additionalResources?.images || []
        const referenceUrls = projectData.visualIdentity?.referenceUrls || []
        const logoUrl = projectData.visualIdentity?.logoUrl
        const primaryColor = projectData.visualIdentity?.primaryColor
        const secondaryColor = projectData.visualIdentity?.secondaryColor

        // Formatar lista de imagens
        const formattedImages = images.map((img: any, index: number) => {
            const url = typeof img === 'string' ? img : img.url
            const name = typeof img === 'object' ? img.filename : `Imagem ${index + 1}`
            return `- ${name}: ${url}`
        }).join('\n')

        // Formatar referências
        const formattedReferences = referenceUrls.map((url: string) => `- ${url}`).join('\n')

        // Helper para adicionar campos apenas se existirem
        const addField = (label: string, value: any) => {
            if (value && value !== 'N/A') {
                return `${label}: ${value}\n`
            }
            return ''
        }

        let promptContent = `Você é um Especialista em UX Design e Copywriting de Alta Conversão. Sua tarefa é estruturar o conteúdo e as diretrizes de design para uma Landing Page profissional, responsiva e otimizada para vendas.

Usar animações na pagina, e phospor icons para icones.

--- DADOS DO BRIEFING ---\n`

        promptContent += addField('Nome do Site', briefing.siteName || briefing.nome)
        promptContent += addField('Tipo de Negócio', briefing.businessType || briefing.nicho)
        promptContent += addField('Descrição', briefing.description || briefing.descricao)
        promptContent += addField('Público Alvo', briefing.targetAudience || briefing.publicoAlvo)
        promptContent += addField('Serviços Principais', briefing.mainServices || briefing.servicos)
        promptContent += addField('Informações de Contato', briefing.contactInfo || briefing.contato)
        promptContent += addField('Cores da Marca', briefing.brandColors || briefing.cores)
        if (primaryColor) promptContent += `Cor Primária: ${primaryColor}\n`
        if (secondaryColor) promptContent += `Cor Secundária: ${secondaryColor}\n`
        promptContent += addField('Estilo', briefing.style || briefing.estilo)
        promptContent += addField('Requisitos Adicionais', briefing.additionalRequirements || briefing.requisitos)

        promptContent += `\n--- IDENTIDADE VISUAL E RECURSOS ---\n`
        if (logoUrl) promptContent += `Logo URL: ${logoUrl}\n`
        if (formattedImages) promptContent += `\nImagens do Projeto:\n${formattedImages}\n`
        if (formattedReferences) promptContent += `\nReferências Visuais:\n${formattedReferences}\n`

        promptContent += `\n--- COPY DO SITE ---\n${copy}\n`

        promptContent += `\n--- CONTEXTO COMPLETO DO BRIEFING (JSON) ---\n${JSON.stringify(briefing, null, 2)}`

        return promptContent
    }

    const handleCopyPrompt = () => {
        const prompt = generatePrompt()
        navigator.clipboard.writeText(prompt)
        toast.success("Prompt copiado para a área de transferência!")
    }

    const saveHtml = async () => {
        try {
            const response = await fetch(`/api/admin/projects/${project.id}/html`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ htmlContent: editedHtml })
            })
            if (!response.ok) throw new Error('Erro ao salvar HTML')
            setEditingHtml(false)
            onRefresh()
        } catch (error) {
            console.error('Erro ao salvar HTML:', error)
            toast.error("Erro ao salvar HTML")
        }
    }

    return (
        <div className="space-y-6">
            {/* Card do Prompt V0 */}
            <Card>
                <CardHeader>
                    <CardTitle>Prompt para V0.app</CardTitle>
                    <CardDescription>
                        Use este prompt no V0.app para gerar o código HTML do site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/50">
                            <pre className="text-sm whitespace-pre-wrap font-mono">
                                {generatePrompt()}
                            </pre>
                        </ScrollArea>
                        <Button
                            className="absolute top-2 right-2"
                            size="sm"
                            variant="secondary"
                            onClick={handleCopyPrompt}
                        >
                            <Icons.copy className="h-4 w-4 mr-2" />
                            Copiar Prompt
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Card do HTML */}
            <Card>
                <CardHeader>
                    <CardTitle>HTML Gerado</CardTitle>
                    <CardDescription>
                        Cole aqui o código HTML gerado pelo V0.app.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!project.htmlContent && !editingHtml ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">HTML não inserido ainda</p>
                            <Button
                                onClick={() => setEditingHtml(true)}
                            >
                                <Icons.code className="h-4 w-4 mr-2" />
                                Inserir HTML Manualmente
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Código HTML</Label>
                                <div className="flex gap-2">
                                    {!editingHtml ? (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => setEditingHtml(true)}>
                                                <Icons.edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingHtml(false)
                                                    setEditedHtml(project.htmlContent || "")
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={saveHtml}
                                                disabled={processing === 'save-html'}
                                            >
                                                {processing === 'save-html' ? (
                                                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Icons.check className="h-4 w-4 mr-2" />
                                                )}
                                                Salvar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingHtml ? (
                                <ScrollArea className="h-[400px] w-full rounded-md border">
                                    <Textarea
                                        value={editedHtml}
                                        onChange={(e) => setEditedHtml(e.target.value)}
                                        className="min-h-[400px] font-mono text-sm"
                                        placeholder="Cole o código HTML gerado pelo V0.app aqui..."
                                    />
                                </ScrollArea>
                            ) : (
                                <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
                                    <pre className="text-sm">
                                        <ScrollArea className="h-[400px] w-full">
                                            <code>{project.htmlContent?.substring(0, 500)}...</code>
                                        </ScrollArea>
                                    </pre>
                                </div>
                            )}

                            <Separator />

                            {/* Ações do HTML */}
                            <div className="flex gap-4">
                                {(project.status === 'HTML_READY' || project.status === 'HTML_REVISION' || project.htmlContent) && (
                                    <>
                                        <Button
                                            onClick={onApproveForClient}
                                            disabled={processing === 'approve-client'}
                                        >
                                            {processing === 'approve-client' ? (
                                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Icons.check className="h-4 w-4 mr-2" />
                                            )}
                                            Enviar para Cliente Aprovar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={onUpdateStatus}
                                        >
                                            Marcar para Revisão HTML
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
