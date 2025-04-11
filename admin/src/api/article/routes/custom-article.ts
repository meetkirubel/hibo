export default {
  routes: [
    {
      method: 'GET',
      path: '/v1/articles',
      handler: 'api::article.custom-article.findArticles',
    },
    {
      method: 'POST',
      path: '/v1/articles/bookmark',
      handler: 'api::article.custom-article.bookmark',
    },
    {
      method: 'POST',
      path: '/v1/articles/unbookmark',
      handler: 'api::article.custom-article.unbookmark',
    },
    {
      method: 'GET',
      path: '/v1/articles/bookmark',
      handler: 'api::article.custom-article.getBookmarks',
    },
  ],
};
