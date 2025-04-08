export default {
  routes: [
    {
      method: 'POST',
      path: '/v1/comments',
      handler: 'api::comment.custom-comment.create',
    },
    {
      method: 'GET',
      path: '/v1/articles/:articleId/comments',
      handler: 'api::comment.custom-comment.getCommentsForArticle',
      config: {
        auth: false,
      },
    },
  ],
};
