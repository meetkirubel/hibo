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
          slug
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
          slug
        });

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, `Failed to fetch articles: ${error.message}`);
      }
    },
  })
);
