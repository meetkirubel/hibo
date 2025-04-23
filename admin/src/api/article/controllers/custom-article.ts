import { factories } from '@strapi/strapi';
import articleService from '../services/custom-article';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    // Get all articles
    async customFind(ctx) {
      try {
        const userId = ctx.state?.user?.documentId;
        const sanitizedQuery = await this.sanitizeQuery(ctx);

        const articles = await articleService.getPaginatedArticles(
          userId,
          sanitizedQuery
        );
        if (!articles) {
          return ctx.notFound('No articles found');
        }

        return ctx.send(articles);
      } catch (error) {
        ctx.throw(500, `Failed to fetch articles: ${error.message}`);
      }
    },

    // Get article by slug
    async FindBySlug(ctx) {
      const { slug } = ctx.params;
      const query = this.sanitizeQuery(ctx);

      const article = await articleService.getBySlug(slug, query);
      if (!article) {
        return ctx.notFound('Article not found');
      }

      return ctx.send(article);
    },

    // Create an article bookmark
    async bookmark(ctx) {
      const userId = ctx.state?.user?.documentId;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { articleId } = sanitizedQuery;
      if (!articleId) {
        return ctx.badRequest('Article Id is needed');
      }

      const result = await articleService.bookmark(ctx, userId, articleId);

      return ctx.send(result);
    },

    // Unbookmark an article
    async unbookmark(ctx) {
      const userId = ctx.state?.user?.documentId;
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { articleId } = sanitizedQuery;
      if (!articleId) {
        return ctx.badRequest('Article Id is needed');
      }

      const result = await articleService.unbookmark(ctx, userId, articleId);

      return ctx.send(result);
    },

    // Get all bookmarks bookmarked by a user
    async getBookmarks(ctx) {
      const userId = ctx.state?.user?.documentId;
      const query = await this.sanitizeQuery(ctx);

      const result = await articleService.getBookmarks(ctx, userId, query);

      return ctx.send(result);
    },
  })
);
