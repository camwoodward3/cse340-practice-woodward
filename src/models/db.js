import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: false // Set to true if your database requires SSL connections
});

let db = null;

if (process.env.NODE_ENV.includes('dev') && process.env.DISABLE_SQL_LOGGING !== 'true') {
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', {
                   text: text.replace(/\s+/g, ' ') .trim(),
                   duration: `${duration}ms`,
                   rows: res.rowCount
                });
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
} else {
    db = pool;
}

export default {
    query: async (text, params) => {
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (err) {
            console.error('Query error:', err.message);
            throw err;
        }

  
    }
};