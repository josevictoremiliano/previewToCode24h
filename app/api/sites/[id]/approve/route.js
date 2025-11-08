const { query } = require('../../../../../lib/db');

export async function POST(request, { params }) {
  try {
    const { id } = params;
    await query(
      "UPDATE sites SET status = 'approved', updated_at = NOW() WHERE id = $1",
      [id]
    );
    return Response.json({ success: true, status: 'approved' });
  } catch (error) {
    return Response.json({ error: 'Erro ao aprovar' }, { status: 500 });
  }
}
