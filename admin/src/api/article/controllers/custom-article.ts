import { factories } from '@strapi/strapi';
import articleService from '../services/custom-article';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    // Get all articles
    async findArticles(ctx) {
      try {
        const { page, limit, search, category, subcategory, locale } =
          ctx.query;

        const result = await articleService.getPaginatedArticles({
          page,
          limit,
          search,
          category,
          subcategory,
          locale,
        });

        return ctx.send(result);
      } catch (error) {
        ctx.throw(500, 'Failed to fetch articles');
      }
    },
  })
);
