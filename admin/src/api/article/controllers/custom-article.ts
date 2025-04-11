import { factories } from '@strapi/strapi';
import articleService from '../services/custom-article';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    // Get all articles
    async findArticles(ctx) {
      try {
        const userId = ctx.state?.user?.documentId;
        const sanitizedQuery = await this.sanitizeQuery(ctx);

        const {
          page,
          limit,
          search,
          category,
          subcategory,
          tag,
          locale,
          is_featured,
          slug,
        } = sanitizedQuery;

        const result = await articleService.getPaginatedArticles({
          userId,
          page,
          limit,
          search,
          category,
          subcategory,
          tag,
          locale,
          is_featured,
          slug,
        });

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, `Failed to fetch articles: ${error.message}`);
      }
    },

    // Create an article bookmark
    async bookmark(ctx) {
      const userId = ctx.state?.user?.documentId;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { articleId } = sanitizedQuery;

      const result = await articleService.bookmark(ctx, userId, articleId);

      return ctx.send(result);
    },

    // Unbookmark an article
    async unbookmark(ctx) {
      const userId = ctx.state?.user?.documentId;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { articleId } = sanitizedQuery;

      const result = await articleService.unbookmark(ctx, userId, articleId);

      return ctx.send(result);
    },

    // Get all bookmarks bookmarked by a user
    async getBookmarks(ctx) {
      const userId = ctx.state?.user?.documentId;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { page, pageSize } = sanitizedQuery;

      const result = await articleService.getBookmarks(
        ctx,
        userId,
        page,
        pageSize
      );

      return ctx.send(result);
    },
  })
);
