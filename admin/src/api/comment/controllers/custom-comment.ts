import { factories } from '@strapi/strapi';
import commentService from '../services/custom-comment';

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    // Create a comment
    async customCreate(ctx) {
      const { user } = ctx.state;
      if (user.isAuthenticated) {
        return ctx.unauthorized();
      }
      const { comment } = ctx.request.body;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { articleId } = sanitizedQuery;

      if (!articleId) {
        return ctx.badRequest('Article Id is required');
      }

      if (!comment) {
        return ctx.badRequest('You must write some comment');
      }

      const result = await commentService.create(ctx, user, comment, articleId);

      return ctx.send(result);
    },

    // Get all comments
    async getCommentsForArticle(ctx) {
      try {
        const query = await this.sanitizeQuery(ctx);
        const { articleId } = ctx.params;

        const result = await commentService.commentsForArticle(
          articleId,
          query
        );

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, `Failed to fetch comments: ${error.message}`);
      }
    },
  })
);
