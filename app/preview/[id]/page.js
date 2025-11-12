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
        console.log('=== DADOS COMPLETOS DO PROJETO ===');
        console.log('data:', JSON.stringify(data, null, 2));
        console.log('data.generatedContent:', data.generatedContent);
        console.log('data.data:', data.data);
        console.log('data.data?.generatedContent:', data.data?.generatedContent);
        
        // Buscar HTML em todas as possíveis localizações (ordem de prioridade)
        let htmlContent = null;
        let htmlSource = 'fallback';
        
        // Prioridade 1: htmlContent na raiz (onde está sendo armazenado)
        if (data.htmlContent) {
          htmlContent = data.htmlContent;
          htmlSource = 'data.htmlContent';
        }
        // Prioridade 2: generatedContent na raiz
        else if (data.generatedContent?.html) {
          htmlContent = data.generatedContent.html;
          htmlSource = 'data.generatedContent.html';
        }
        // Prioridade 3: dentro de data.generatedContent
        else if (data.data?.generatedContent?.html) {
          htmlContent = data.data.generatedContent.html;
          htmlSource = 'data.data.generatedContent.html';
        }
        // Prioridade 4: dentro de data.htmlContent
        else if (data.data?.htmlContent) {
          htmlContent = data.data.htmlContent;
          htmlSource = 'data.data.htmlContent';
        }
        // Fallback se não encontrar nada
        else {
          htmlContent = '<div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif; background: #f8f9fa; border-radius: 8px; margin: 2rem;"><h2 style="color: #333; margin-bottom: 1rem;">🚀 Seu Site Está Sendo Criado!</h2><p style="color: #666; margin-bottom: 1rem;">Nossa IA está trabalhando para gerar o conteúdo perfeito para seu site.</p><p style="color: #666;">Este é um preview temporário. O conteúdo final será muito mais rico e personalizado!</p><div style="margin-top: 2rem; padding: 1rem; background: #fff; border-radius: 4px; border-left: 4px solid #007bff;"><strong>Status:</strong> Processando com IA...</div></div>';
        }
        
        console.log('HTML encontrado em:', htmlSource);
        console.log('HTML Content (primeiros 500 chars):', htmlContent?.substring(0, 500));
        console.log('HTML Content length:', htmlContent?.length);
        
        const adaptedData = {
          client_name: data.siteName || data.name,
          html_content: htmlContent,
          status: data.status === 'PREVIEW' ? 'pending' : data.status.toLowerCase()
        }
        
        console.log('Status do projeto:', data.status);
        console.log('Dados adaptados:', adaptedData);
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
        },
        body: JSON.stringify({ action: 'client_approve' })
      });
      
      if (res.ok) {
        setMessage('✅ Site aprovado com sucesso!');
        setSite({...site, status: 'approved'});
      } else {
        const errorData = await res.json();
        setMessage('❌ Erro ao aprovar: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      setMessage('❌ Erro ao aprovar site');
    }
  };

  const handleRequestRevision = async () => {
    if (!feedback.trim()) return;

    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/request-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: feedback.trim() })
      });

      if (res.ok) {
        setMessage('✅ Solicitação de revisão enviada com sucesso!');
        setFeedback('');
        setSite({...site, status: 'revision'});
      } else {
        const errorData = await res.json();
        setMessage('❌ Erro ao solicitar revisão: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao solicitar revisão:', error);
      setMessage('❌ Erro ao solicitar revisão');
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
        <p><strong>Status:</strong> {
          site.status === 'pending' ? 'Aguardando Aprovação' : 
          site.status === 'approved' ? 'Aprovado' : 
          site.status === 'revision' ? 'Em Revisão' :
          site.status
        }</p>
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
            <button 
              disabled={!feedback} 
              onClick={handleRequestRevision}
              style={{width: '100%', padding: '1rem 2rem', background: feedback ? '#ffc107' : '#ccc', color: '#000', border: 'none', borderRadius: '4px', cursor: feedback ? 'pointer' : 'not-allowed', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem'}}
            >
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
        {site.status === 'revision' && (
          <div style={{padding: '1.5rem', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px'}}>
            <h3 style={{marginTop: 0, color: '#856404'}}>📝 Revisão Solicitada</h3>
            <p style={{color: '#856404', marginBottom: 0}}>Suas solicitações de alteração foram enviadas. Nossa equipe fará as modificações e você receberá uma nova versão em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
