"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

// Componentes dos passos
import { InformacoesBasicas } from "@/components/criar-site/informacoes-basicas"
import { IdentidadeVisual } from "@/components/criar-site/identidade-visual"
import { Conteudo } from "@/components/criar-site/conteudo"
import { Contato } from "@/components/criar-site/contato"
import { RecursosAdicionais } from "@/components/criar-site/recursos-adicionais"
import { Revisao } from "@/components/criar-site/revisao"

// Tipos
export interface FormData {
  // Passo 1 - Informações Básicas
  basicInfo: {
    siteName: string
    slogan: string
    siteType: string
    niche: string
  }
  // Passo 2 - Identidade Visual
  visualIdentity: {
    logoFile: File | null
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    style: string
    referenceUrls: string[]
  }
  // Passo 3 - Conteúdo
  content: {
    description: string
    targetAudience: string
    products: string[]
    cta: string
    sections: string[]
  }
  // Passo 4 - Contato
  contact: {
    email: string
    phone: string
    address: string
    socialMedia: {
      instagram: string
      facebook: string
      linkedin: string
      twitter: string
      whatsapp: string
    }
  }
  // Passo 5 - Recursos Adicionais
  additionalResources: {
    images: File[]
    customTexts: string
    features: string[]
  }
}

const initialFormData: FormData = {
  basicInfo: {
    siteName: "",
    slogan: "",
    siteType: "",
    niche: ""
  },
  visualIdentity: {
    logoFile: null,
    logoUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    style: "",
    referenceUrls: []
  },
  content: {
    description: "",
    targetAudience: "",
    products: [],
    cta: "",
    sections: []
  },
  contact: {
    email: "",
    phone: "",
    address: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      whatsapp: ""
    }
  },
  additionalResources: {
    images: [],
    customTexts: "",
    features: []
  }
}

const steps = [
  { id: 1, title: "Informações Básicas", description: "Nome, tipo e nicho da landing page" },
  { id: 2, title: "Identidade Visual", description: "Logo, cores e estilo" },
  { id: 3, title: "Conteúdo", description: "Proposta de valor e estrutura" },
  { id: 4, title: "Contato", description: "Informações de contato" },
  { id: 5, title: "Recursos de Conversão", description: "Elementos que aumentam vendas" },
  { id: 6, title: "Revisão", description: "Confirmar e enviar" }
]

export default function CriarSitePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const goToNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast.error("Você precisa estar logado para criar um site")
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar payload para o webhook n8n
      const payload = {
        userId: session.user.id,
        projectId: `project_${Date.now()}`,
        basicInfo: formData.basicInfo,
        visualIdentity: {
          logoUrl: formData.visualIdentity.logoUrl,
          primaryColor: formData.visualIdentity.primaryColor,
          secondaryColor: formData.visualIdentity.secondaryColor,
          style: formData.visualIdentity.style,
          referenceUrls: formData.visualIdentity.referenceUrls
        },
        content: formData.content,
        contact: formData.contact,
        additionalResources: {
          images: [], // URLs das imagens após upload
          customTexts: formData.additionalResources.customTexts,
          features: formData.additionalResources.features
        },
        timestamp: new Date().toISOString()
      }

      // Enviar para API local primeiro (para salvar no banco)
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Erro ao criar projeto")
      }

      await response.json()

      toast.success("Landing page criada com sucesso! Você receberá um preview em até 12 horas.")
      router.push(`/dashboard/sites`)

    } catch (error) {
      console.error("Erro ao criar landing page:", error)
      toast.error("Erro ao criar landing page. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InformacoesBasicas
            data={formData.basicInfo}
            onUpdate={(data) => updateFormData({ basicInfo: data })}
            onNext={goToNext}
          />
        )
      case 2:
        return (
          <IdentidadeVisual
            data={formData.visualIdentity}
            onUpdate={(data) => updateFormData({ visualIdentity: data })}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        )
      case 3:
        return (
          <Conteudo
            data={formData.content}
            onUpdate={(data) => updateFormData({ content: data })}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        )
      case 4:
        return (
          <Contato
            data={formData.contact}
            onUpdate={(data) => updateFormData({ contact: data })}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        )
      case 5:
        return (
          <RecursosAdicionais
            data={formData.additionalResources}
            onUpdate={(data) => updateFormData({ additionalResources: data })}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        )
      case 6:
        return (
          <Revisao
            data={formData}
            onSubmit={handleSubmit}
            onPrevious={goToPrevious}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Site</h1>
        <p className="text-muted-foreground">
          Preencha as informações para criarmos seu site personalizado
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Passo {currentStep} de {steps.length}</CardTitle>
              <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% completo
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Steps Navigation */}
      <div className="hidden md:flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <Icons.checkCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2 hidden lg:block">
                <p className={`text-sm font-medium ${
                  step.id === currentStep ? "text-primary" : "text-muted-foreground"
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-muted mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo do Passo Atual */}
      <div className="min-h-[500px]">
        {renderCurrentStep()}
      </div>
    </div>
  )
}