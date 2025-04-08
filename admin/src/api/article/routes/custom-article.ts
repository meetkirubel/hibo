export default {
  routes: [
    {
      method: 'GET',
      path: '/v1/articles',
      handler: 'api::article.custom-article.findArticles',
    },
    {
      method: 'GET',
      path: '/v1/articles/:slug',
      handler: 'api::article.custom-article.getArticle',
      config: {
        auth: false,
      },
    },
  ],
};
