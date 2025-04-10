import { factories } from '@strapi/strapi';
import commentService from '../services/custom-comment';

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    // Create a comment
    async create(ctx) {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('You must be logged in to create a comment');
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
        const sanitizedQuery = await this.sanitizeQuery(ctx);
        const { page, limit } = sanitizedQuery;
        const { articleId } = ctx.params;

        const result = await commentService.commentsForArticle(
          page,
          limit,
          articleId
        );

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, `Failed to fetch comments: ${error.message}`);
      }
    },
  })
);
