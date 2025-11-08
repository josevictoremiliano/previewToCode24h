const { query } = require('../../../../lib/db');

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM sites WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return Response.json({ error: 'Site não encontrado' }, { status: 404 });
    }
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ error: 'Erro ao buscar site' }, { status: 500 });
  }
}
