const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Base directory to store files
const baseDir = path.join(__dirname, 'files');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

// Serve static frontend
const serveStatic = (req, res) => {
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
  }[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404); res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const method = req.method;

  // Serve frontend
  if (req.url.startsWith('/')) {
    if (!req.url.startsWith('/create') && !req.url.startsWith('/read') && !req.url.startsWith('/delete')) {
      return serveStatic(req, res);
    }
  }

  // Enable CORS and JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Routes
  if (pathname === '/create' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { filename, content } = JSON.parse(body);
      const filePath = path.join(baseDir, filename);
      fs.writeFile(filePath, content, err => {
        if (err) return res.end(JSON.stringify({ error: 'Error writing file' }));
        res.end(JSON.stringify({ message: '✅ File created' }));
      });
    });

  } else if (pathname === '/read' && method === 'GET') {
    const { filename } = query;
    const filePath = path.join(baseDir, filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.end(JSON.stringify({ error: '❌ File not found' }));
      res.end(JSON.stringify({ content: data }));
    });

  } else if (pathname === '/delete' && method === 'DELETE') {
    const { filename } = query;
    const filePath = path.join(baseDir, filename);
    fs.unlink(filePath, err => {
      if (err) return res.end(JSON.stringify({ error: '❌ Cannot delete file' }));
      res.end(JSON.stringify({ message: '🗑️ File deleted' }));
    });

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
