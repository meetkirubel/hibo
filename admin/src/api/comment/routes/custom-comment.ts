export default {
  routes: [
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
