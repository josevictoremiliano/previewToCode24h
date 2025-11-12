'use client';
import { useEffect, useState, use } from 'react';

export default function PreviewPage({ params }) {
  const resolvedParams = use(params);
  const [site, setSite] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/preview-data/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Dados do projeto:', data); // Debug
        
        // Adaptar dados do projeto para o formato esperado
        const adaptedData = {
          client_name: data.siteName || data.name,
          html_content: data.generatedContent?.html || data.data?.generatedContent?.html || '<p>Nenhum conteúdo gerado ainda</p>',
          status: data.status === 'PREVIEW' ? 'pending' : data.status.toLowerCase()
        }
        
        console.log('Dados adaptados:', adaptedData); // Debug
        setSite(adaptedData)
      })
      .catch(error => {
        console.error('Erro ao carregar:', error);
        setMessage('Erro ao carregar projeto: ' + error.message);
      });
  }, [resolvedParams.id]);

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

  if (message && !site) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Erro</h2>
        <p>{message}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }
  
  if (!site) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Carregando...</h2>
        <p>ID do projeto: {resolvedParams.id}</p>
      </div>
    );
  }
  
  if (site.error) {
    return (
      <div style={{padding: '2rem'}}>
        <h2>Site não encontrado</h2>
        <p>ID: {resolvedParams.id}</p>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', height: '100vh', fontFamily: 'system-ui'}}>
      <div style={{flex: 2, borderRight: '1px solid #ddd'}}>
        <div style={{background: '#1a1a1a', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
          Preview do Site - {site.client_name}
        </div>
        <iframe srcDoc={site.html_content} style={{width: '100%', height: 'calc(100% - 40px)', border: 0}} />
      </div>
      <div style={{flex: 1, padding: '2rem', overflowY: 'auto'}}>
        <h2 style={{marginTop: 0}}>Aprovação do Site</h2>
        <p><strong>Status:</strong> {site.status === 'pending' ? 'Pendente' : site.status === 'approved' ? 'Aprovado' : site.status}</p>
        {message && (
          <div style={{padding: '1rem', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem'}}>
            {message}
          </div>
        )}
        {site.status === 'pending' && (
          <div>
            <button onClick={handleApprove} style={{width: '100%', padding: '1rem 2rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem'}}>
              ✅ Aprovar Site
            </button>
            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd'}} />
            <h3>Solicitar Alterações</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Descreva as alterações que deseja..."
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '120px', fontFamily: 'inherit', fontSize: '0.875rem', boxSizing: 'border-box'}}
            />
            <button disabled={!feedback} style={{width: '100%', padding: '1rem 2rem', background: feedback ? '#ffc107' : '#ccc', color: '#000', border: 'none', borderRadius: '4px', cursor: feedback ? 'pointer' : 'not-allowed', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem'}}>
              💬 Enviar Feedback
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
