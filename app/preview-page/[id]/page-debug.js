'use client';
import { useEffect, useState, use } from 'react';

export default function PreviewPage({ params }) {
  console.log('PreviewPage renderizada, params:', params);
  
  // Temporariamente vou usar um try-catch para debug
  let resolvedParams;
  try {
    resolvedParams = use(params);
    console.log('Params resolvidos:', resolvedParams);
  } catch (error) {
    console.error('Erro ao resolver params:', error);
    return <div style={{padding: '2rem'}}>Erro ao resolver parâmetros: {error.message}</div>;
  }
  
  const [site, setSite] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect executado, ID:', resolvedParams?.id);
    
    if (!resolvedParams?.id) {
      setMessage('ID do projeto não encontrado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    fetch(`/api/preview-data/${resolvedParams.id}`)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Dados do projeto:', data);
        
        // Adaptar dados do projeto para o formato esperado
        const adaptedData = {
          client_name: data.siteName || data.name,
          html_content: data.generatedContent?.html || data.data?.generatedContent?.html || '<p>Nenhum conteúdo gerado ainda</p>',
          status: data.status === 'PREVIEW' ? 'pending' : data.status.toLowerCase()
        }
        
        console.log('Dados adaptados:', adaptedData);
        setSite(adaptedData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar:', error);
        setMessage('Erro ao carregar projeto: ' + error.message);
        setIsLoading(false);
      });
  }, [resolvedParams?.id]);

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/approve`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setMessage('✅ Site aprovado!');
        setSite({...site, status: 'approved'});
      } else {
        const error = await res.text();
        setMessage('❌ Erro ao aprovar: ' + error);
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      setMessage('❌ Erro ao aprovar site');
    }
  };

  if (isLoading) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Carregando...</h2>
        <p>ID do projeto: {resolvedParams?.id || 'Não encontrado'}</p>
        <p>Status: Buscando dados do projeto...</p>
      </div>
    );
  }

  if (message && !site) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Erro</h2>
        <p>{message}</p>
        <p>ID: {resolvedParams?.id}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }
  
  if (!site) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Site não encontrado</h2>
        <p>ID: {resolvedParams?.id}</p>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', height: '100vh', fontFamily: 'system-ui'}}>
      <div style={{flex: 2, borderRight: '1px solid #ddd'}}>
        <div style={{background: '#1a1a1a', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
          Preview do Site - {site.client_name}
        </div>
        <iframe 
          srcDoc={site.html_content} 
          style={{width: '100%', height: 'calc(100% - 40px)', border: 0}}
          title="Preview do Site"
        />
      </div>
      <div style={{flex: 1, padding: '2rem', overflowY: 'auto'}}>
        <h2 style={{marginTop: 0}}>Aprovação do Site</h2>
        <p><strong>Status:</strong> {site.status === 'pending' ? 'Pendente' : site.status === 'approved' ? 'Aprovado' : site.status}</p>
        <p><strong>ID:</strong> {resolvedParams.id}</p>
        
        {message && (
          <div style={{padding: '1rem', background: message.includes('✅') ? '#d4edda' : '#f8d7da', border: '1px solid ' + (message.includes('✅') ? '#c3e6cb' : '#f5c6cb'), borderRadius: '4px', marginBottom: '1rem'}}>
            {message}
          </div>
        )}
        
        {site.status === 'pending' && (
          <div>
            <button 
              onClick={handleApprove} 
              style={{
                width: '100%', 
                padding: '1rem 2rem', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem'
              }}
            >
              ✅ Aprovar Site
            </button>
            
            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd'}} />
            
            <h3>Solicitar Alterações</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Descreva as alterações necessárias..."
              style={{
                width: '100%', 
                height: '100px', 
                padding: '1rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            <button 
              style={{
                width: '100%', 
                padding: '1rem 2rem', 
                background: '#ffc107', 
                color: '#212529', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                fontWeight: 'bold'
              }}
            >
              📝 Solicitar Revisão
            </button>
          </div>
        )}
        
        {site.status === 'approved' && (
          <div style={{padding: '1.5rem', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px'}}>
            <h3 style={{marginTop: 0, color: '#0c5460'}}>✅ Site Aprovado!</h3>
            <p style={{color: '#0c5460', marginBottom: 0}}>Entraremos em contato para finalizar a publicação.</p>
          </div>
        )}
      </div>
    </div>
  );
}