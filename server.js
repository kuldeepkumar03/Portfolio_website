const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/** Parse Medium RSS feed into article list */
function fetchMediumArticles(username) {
  return new Promise((resolve, reject) => {
    const url = `https://medium.com/feed/@${username}`;
    https.get(url, { headers: { 'User-Agent': 'PortfolioBot/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const items = [...data.matchAll(/<item>([\s\S]*?)<\/item>/g)];
          const articles = items.slice(0, 6).map(match => {
            const block = match[1];
            const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
              || block.match(/<title>(.*?)<\/title>/)?.[1] || 'Untitled';
            const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '#';
            const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            const year = pubDate ? new Date(pubDate).getFullYear().toString() : '';
            return { title, url: link, date: year, readTime: 'Medium' };
          });
          resolve(articles);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

app.get('/api/writing', async (req, res) => {
  const user = req.query.user || 'deepkul2002';
  try {
    const articles = await fetchMediumArticles(user);
    res.json(articles);
  } catch {
    res.status(502).json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio website running at http://localhost:${PORT}`);
});

module.exports = app;
