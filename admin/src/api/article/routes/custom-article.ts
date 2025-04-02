export default {
  routes: [
    {
      method: 'GET',
      path: '/v1/articles',
      handler: 'api::article.custom-article.findArticles',
      config: {
        auth: false,
      },
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
