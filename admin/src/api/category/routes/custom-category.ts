export default {
  routes: [
    {
      method: 'GET',
      path: '/v1/recent-articles',
      handler: 'api::category.custom-category.getRecentArticlesByCategory',
    },
  ],
};
