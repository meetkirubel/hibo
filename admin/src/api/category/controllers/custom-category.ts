import { factories } from '@strapi/strapi';
import categoryService from '../services/custom-category';

export default factories.createCoreController(
  'api::article.article',
  ({ strapi }) => ({
    async getRecentArticlesByCategory(ctx) {
      const query = await this.sanitizeQuery(ctx);

      const result = await categoryService.getRecentArticlesByCategory(
        ctx,
        query
      );

      return ctx.send(result);
    },
  })
);
