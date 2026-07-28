const express = require('express');
const path = require('path');
const { fetchMediumArticles } = require('./lib/medium');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/writing', async (req, res) => {
  const user = req.query.user || 'deepkul2002';
  try {
    const articles = await fetchMediumArticles(user);
    res.json(articles);
  } catch {
    res.status(502).json([]);
  }
});

if (require.main === module) {
  const server = app.listen(0, () => {
    const { port } = server.address();
    console.log(`Portfolio website running at http://localhost:${port}`);
  });
}

module.exports = app;
