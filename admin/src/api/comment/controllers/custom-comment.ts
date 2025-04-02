import { factories } from '@strapi/strapi';
import commentService from '../services/custom-comment';

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
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
