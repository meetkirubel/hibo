export default {
  routes: [
    {
      method: 'GET',
      path: '/v1/articles',
      handler: 'api::article.custom-article.findArticles',
    },
  ],
};
