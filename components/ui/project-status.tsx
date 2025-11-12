'use client';
import { Badge } from '@/components/ui/badge';

export interface ProjectStatusProps {
  status: string;
  showDescription?: boolean;
}

export const PROJECT_STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando Aprovação',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Seu briefing está sendo analisado por nossa equipe.',
    icon: '⏳'
  },
  PROCESSING: {
    label: 'Briefing Aprovado',
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    description: 'Nossa IA está criando seu site baseado no briefing aprovado.',
    icon: '🤖'
  },
  PREVIEW: {
    label: 'Preview Disponível',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Seu site está pronto! Visualize e aprove o resultado.',
    icon: '👀'
  },
  APPROVED: {
    label: 'Aprovado pelo Cliente',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Você aprovou o site. Estamos preparando a publicação.',
    icon: '✅'
  },
  REVISION: {
    label: 'Em Revisão',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Ajustes solicitados estão sendo implementados.',
    icon: '🔄'
  },
  COMPLETED: {
    label: 'Finalizado',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Projeto concluído com sucesso.',
    icon: '🎉'
  },
  PUBLISHED: {
    label: 'Publicado',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Seu site está online e acessível ao público.',
    icon: '🚀'
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Projeto foi cancelado.',
    icon: '❌'
  }
};

export function ProjectStatus({ status, showDescription = false }: ProjectStatusProps) {
  const config = PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Status desconhecido',
    icon: '❓'
  };

  return (
    <div className="space-y-2">
      <Badge 
        className={`${config.color} font-medium px-3 py-1 text-xs border`}
      >
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </Badge>
      
      {showDescription && (
        <p className="text-sm text-gray-600">
          {config.description}
        </p>
      )}
    </div>
  );
}

export function ProjectTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'PENDING', title: 'Briefing Enviado', description: 'Análise pela equipe' },
    { key: 'PROCESSING', title: 'Briefing Aprovado', description: 'IA gerando site' },
    { key: 'PREVIEW', title: 'Preview Pronto', description: 'Aguardando aprovação' },
    { key: 'APPROVED', title: 'Aprovado', description: 'Preparando publicação' },
    { key: 'PUBLISHED', title: 'Publicado', description: 'Site no ar' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const isRevision = status === 'REVISION';
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Progresso do Projeto</h4>
      
      {isCancelled ? (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-medium text-gray-900">Projeto Cancelado</p>
            <p className="text-sm text-gray-600">Este projeto foi cancelado.</p>
          </div>
        </div>
      ) : isRevision ? (
        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <span className="text-xl">🔄</span>
          <div>
            <p className="font-medium text-orange-900">Revisão em Andamento</p>
            <p className="text-sm text-orange-700">Implementando ajustes solicitados.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex || 
              (currentStepIndex === index && status === step.key);
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-sm ${
                    isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}