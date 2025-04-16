export default {
  routes: [
    {
      method: 'POST',
      path: '/comments',
      handler: 'api::comment.custom-comment.customCreate',
    },
    {
      method: 'GET',
      path: '/articles/:articleId/comments',
      handler: 'api::comment.custom-comment.getCommentsForArticle',
      config: {
        auth: false,
      },
    },
  ],
};
