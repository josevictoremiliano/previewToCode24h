'use client';
import { useEffect, useState } from 'react';

export default function PreviewPage({ params }) {
  const [site, setSite] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/sites/${params.id}`)
      .then(res => res.json())
      .then(data => setSite(data))
      .catch(() => setMessage('Erro ao carregar'));
  }, [params.id]);

  const handleApprove = async () => {
    const res = await fetch(`/api/sites/${params.id}/approve`, { method: 'POST' });
    if (res.ok) {
      setMessage('✅ Site aprovado!');
      setSite({...site, status: 'approved'});
    }
  };

  if (!site) return <div style={{padding: '2rem'}}>Carregando...</div>;
  if (site.error) return <div style={{padding: '2rem'}}>Site não encontrado</div>;

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
