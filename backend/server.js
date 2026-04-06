require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/connection');
const crypto = require('crypto');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const adminSessions = new Map();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const getCookie = (req, name) => {
  const raw = req.headers.cookie;
  if (!raw) return '';
  const parts = raw.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return '';
};

const isAdminAuthed = (req) => {
  const sessionId = getCookie(req, ADMIN_SESSION_COOKIE);
  if (!sessionId) return false;
  const exp = adminSessions.get(sessionId);
  if (!exp) return false;
  if (Date.now() > exp) {
    adminSessions.delete(sessionId);
    return false;
  }
  return true;
};

const requireAdmin = (req, res, next) => {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  if (isAdminAuthed(req)) return next();

  const auth = req.header('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';

  if (token && token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
};

const isValidCategory = (category) => typeof category === 'string' && category.length > 0 && category.length <= 255;
const isValidText = (v, maxLen) => v === undefined || v === null || (typeof v === 'string' && v.length <= maxLen);
const isValidUrl = (url) => {
  if (typeof url !== 'string' || url.length === 0 || url.length > 500) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/admin/status', (req, res) => {
  res.json({ authed: isAdminAuthed(req) });
});

app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_TOKEN) return res.status(500).json({ error: 'Server not configured' });
  const token = req.body?.token;
  if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Invalid token' });
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const sessionId = crypto.randomBytes(24).toString('hex');
  adminSessions.set(sessionId, Date.now() + ADMIN_SESSION_TTL_MS);

  const secure = req.secure || req.header('x-forwarded-proto') === 'https';
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_MS / 1000}${secure ? '; Secure' : ''}`
  );

  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  const sessionId = getCookie(req, ADMIN_SESSION_COOKIE);
  if (sessionId) adminSessions.delete(sessionId);
  const secure = req.secure || req.header('x-forwarded-proto') === 'https';
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
  );
  res.json({ success: true });
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

app.post('/api/websites', requireAdmin, async (req, res) => {
  try {
    const { category, website } = req.body;
    
    if (!category || !website) {
      return res.status(400).json({ error: 'Missing category or website data' });
    }

    const { name, url, description, icon } = website;
    if (!isValidCategory(category)) return res.status(400).json({ error: 'Invalid category' });
    if (!isValidText(name, 255) || !name) return res.status(400).json({ error: 'Invalid name' });
    if (!isValidUrl(url)) return res.status(400).json({ error: 'Invalid url' });
    if (!isValidText(description, 2000)) return res.status(400).json({ error: 'Invalid description' });
    if (!isValidText(icon, 255)) return res.status(400).json({ error: 'Invalid icon' });
    
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

app.delete('/api/websites', requireAdmin, async (req, res) => {
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

app.post('/api/seed', requireAdmin, async (req, res) => {
  try {
    if (req.header('x-confirm-seed') !== 'YES') {
      return res.status(400).json({ error: 'Missing confirmation header' });
    }

    const { data } = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Invalid data' });
    
    await db.query('DELETE FROM websites');
    
    for (const [category, websites] of Object.entries(data)) {
      if (!isValidCategory(category)) return res.status(400).json({ error: 'Invalid category' });
      if (!Array.isArray(websites)) return res.status(400).json({ error: 'Invalid websites list' });
      for (const website of websites) {
        if (!website || typeof website !== 'object') return res.status(400).json({ error: 'Invalid website' });
        if (!isValidText(website.name, 255) || !website.name) return res.status(400).json({ error: 'Invalid name' });
        if (!isValidUrl(website.url)) return res.status(400).json({ error: 'Invalid url' });
        if (!isValidText(website.description, 2000)) return res.status(400).json({ error: 'Invalid description' });
        if (!isValidText(website.icon, 255)) return res.status(400).json({ error: 'Invalid icon' });
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
