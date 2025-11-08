const { query, initDatabase } = require('../../../lib/db');
const { nanoid } = require('nanoid');

export async function POST(request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { html_content, client_email, client_name } = body;

    if (!html_content || !client_email) {
      return Response.json({ error: 'HTML e email obrigatórios' }, { status: 400 });
    }

    const siteId = nanoid(10);
    await query(
      'INSERT INTO sites (id, html_content, client_email, client_name, status) VALUES ($1, $2, $3, $4, $5)',
      [siteId, html_content, client_email, client_name || '', 'pending']
    );

    const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/preview/${siteId}`;
    return Response.json({ success: true, site_id: siteId, preview_url: previewUrl });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Erro ao criar site' }, { status: 500 });
  }
}
