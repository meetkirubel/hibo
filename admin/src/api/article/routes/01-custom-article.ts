export default {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'api::article.custom-article.customFind',
    },
    {
      method: 'POST',
      path: '/articles/bookmark',
      handler: 'api::article.custom-article.bookmark',
    },
    {
      method: 'POST',
      path: '/articles/unbookmark',
      handler: 'api::article.custom-article.unbookmark',
    },
    {
      method: 'GET',
      path: '/articles/bookmarks',
      handler: 'api::article.custom-article.getBookmarks',
    },
    {
      method: 'GET',
      path: '/articles/:slug',
      handler: 'api::article.custom-article.FindBySlug',
    },
  ],
};
