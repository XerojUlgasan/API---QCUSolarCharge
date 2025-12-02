const {Pool} = require("pg")

const pool = new Pool({
    connectionString: process.env.SUPABASE_POOL_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
})

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected pool error:', err.message)
})

module.exports = pool
