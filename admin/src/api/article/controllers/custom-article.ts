import { factories } from '@strapi/strapi';
import articleService from '../services/custom-article';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    // Get all articles
    async findArticles(ctx) {
      try {
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
        } = sanitizedQuery;

        const result = await articleService.getPaginatedArticles({
          page,
          limit,
          search,
          category,
          subcategory,
          tag,
          locale,
          is_featured,
        });

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, `Failed to fetch articles: ${error.message}`);
      }
    },

    // Get article by slug
    async getArticle(ctx) {
      try {
        const sanitizedQuery = await this.sanitizeQuery(ctx);

        const { slug } = sanitizedQuery;

        const result = await articleService.getArticle(slug);

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, 'Failed to fetch article');
      }
    },
  })
);
