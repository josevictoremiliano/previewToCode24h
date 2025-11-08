const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.query = async function(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

exports.initDatabase = async function() {
  await exports.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id VARCHAR(50) PRIMARY KEY,
      html_content TEXT NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      client_name VARCHAR(255),
      status VARCHAR(20) DEFAULT 'pending',
      feedback TEXT,
      domain VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
