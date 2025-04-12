import { factories } from '@strapi/strapi';
import categoryService from '../services/custom-category';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    async getRecentArticlesByCategory(ctx) {
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const { category, page, pageSize } = sanitizedQuery;

      const result = await categoryService.getRecentArticlesByCategory(
        ctx,
        page,
        pageSize
      );

      return ctx.send(result);
    },
  })
);
