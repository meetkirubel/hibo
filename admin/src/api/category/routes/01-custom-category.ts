export default {
  routes: [
    {
      method: 'GET',
      path: '/recent-articles',
      handler: 'api::category.custom-category.getRecentArticlesByCategory',
    },
  ],
};
