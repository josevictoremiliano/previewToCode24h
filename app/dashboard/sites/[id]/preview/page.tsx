'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ClientPreviewPage({ params }: Props) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (projectId) {
      // Redirecionar para a rota correta de preview
      router.replace(`/preview/${projectId}`);
    }
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecionando para preview...</h2>
        <p className="text-muted-foreground">Aguarde um momento</p>
      </div>
    </div>
  );
}