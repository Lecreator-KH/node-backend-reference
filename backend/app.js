const express = require('express');
const { Pool } = require('pg'); // Import the Pool class

const app = express();
const port = 3000;

// Configure the database connection pool
let pool
if (!process.env.DATABASE_URL) {
    pool = new Pool({
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || '127.0.0.1', 
        database: process.env.PG_DATABASE || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
        port: process.env.PG_PORT || 5432,
        ssl: process.env.PG_SSL === 'true' ? true : false,
    });
} else {
    // For production environments like Vercel
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

app.use(express.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', (req, res) => { 
	res.send('Hello from Node.js!'); 
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

app.get('/about', (req, res) => { 
	res.send('This API is created by Tommy!'); 
});

app.get('/restaurants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});


app.get('/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});


app.post('/restaurants', async (req, res) => {
    const { name, cuisine, rating } = req.body;
    if (!name || !cuisine || typeof rating !== 'number') {
        return res.status(400).json({ error: "name, cuisine, and numeric rating are required" });
    }
    try {
        const result = await pool.query(
            'INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, $3) RETURNING *',
            [name, cuisine, rating]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});


app.delete('/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            // result.rowCount gives the number of deleted rows
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.json(result.rows[0]); // Return the deleted item
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});

app.put('/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cuisine, rating } = req.body;
    // For simplicity, this example requires all fields. A more robust solution
    // would dynamically build the query for partial updates.
    if (!name || !cuisine || typeof rating !== 'number') {
        return res.status(400).json({ error: "name, cuisine, and numeric rating are required" });
    }
    try {
        const result = await pool.query(
            'UPDATE restaurants SET name = $1, cuisine = $2, rating = $3 WHERE id = $4 RETURNING *',
            [name, cuisine, rating, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});


// Export the app for testing
module.exports = app;
