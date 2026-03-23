require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/websites', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM websites ORDER BY created_at DESC');
    
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.category]) {
        groupedData[row.category] = [];
      }
      groupedData[row.category].push({
        name: row.name,
        url: row.url,
        description: row.description,
        icon: row.icon
      });
    });
    
    res.json(groupedData);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

app.post('/api/websites', async (req, res) => {
  try {
    const { category, website } = req.body;
    
    if (!category || !website) {
      return res.status(400).json({ error: 'Missing category or website data' });
    }

    const { name, url, description, icon } = website;
    
    await db.query(
      'INSERT INTO websites (category, name, url, description, icon) VALUES (?, ?, ?, ?, ?)',
      [category, name, url, description || '', icon || '']
    );

    const [rows] = await db.query('SELECT * FROM websites ORDER BY created_at DESC');
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.category]) {
        groupedData[row.category] = [];
      }
      groupedData[row.category].push({
        name: row.name,
        url: row.url,
        description: row.description,
        icon: row.icon
      });
    });

    res.json({ success: true, data: groupedData });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ error: 'Failed to add website' });
  }
});

app.delete('/api/websites', async (req, res) => {
  try {
    const { category, url, name } = req.body;
    
    if (!category || (!url && !name)) {
      return res.status(400).json({ error: 'Missing category or identifier (url/name)' });
    }

    let query = 'DELETE FROM websites WHERE category = ?';
    const params = [category];
    
    if (url) {
      query += ' AND url = ?';
      params.push(url);
    }
    if (name) {
      query += ' AND name = ?';
      params.push(name);
    }

    await db.query(query, params);

    const [rows] = await db.query('SELECT * FROM websites ORDER BY created_at DESC');
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.category]) {
        groupedData[row.category] = [];
      }
      groupedData[row.category].push({
        name: row.name,
        url: row.url,
        description: row.description,
        icon: row.icon
      });
    });

    res.json({ success: true, data: groupedData });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const { data } = req.body;
    
    await db.query('DELETE FROM websites');
    
    for (const [category, websites] of Object.entries(data)) {
      for (const website of websites) {
        await db.query(
          'INSERT INTO websites (category, name, url, description, icon) VALUES (?, ?, ?, ?, ?)',
          [category, website.name, website.url, website.description || '', website.icon || '']
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
