const https = require('https');

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

module.exports = { fetchMediumArticles };
