const { fetchMediumArticles } = require('../lib/medium');

module.exports = async (req, res) => {
  const user = req.query.user || 'deepkul2002';
  try {
    const articles = await fetchMediumArticles(user);
    res.json(articles);
  } catch {
    res.status(502).json([]);
  }
};
