import { factories } from '@strapi/strapi';
import likeService from '../services/custom-like';

export default factories.createCoreController('api::like.like', (strapi) => ({
  // Toggle a like
  async toggle(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.unauthorized();
    }
    const userId = user.documentId;
    const query = await this.sanitizeQuery(ctx);
    const { articleId, action } = query;

    if (!articleId || !['like', 'unlike'].includes(action as string)) {
      return ctx.badRequest('Invalid input');
    }

    const result = await likeService.toggle(ctx, articleId, userId, action);

    return ctx.send({
      ...result,
    });
  },
}));
