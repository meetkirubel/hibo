export default {
  routes: [
    {
      method: 'GET',
      path: '/custom-articles',
      handler: 'api::article.custom-article.findArticles',
      config: {
        auth: false,
      },
    },
  ],
};
