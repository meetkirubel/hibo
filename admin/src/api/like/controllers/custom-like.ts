import { factories } from '@strapi/strapi';
import likeService from '../services/custom-like';

export default factories.createCoreController('api::like.like', (strapi) => ({
  // Toggle a like
  async toggle(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.unauthorized('You must be logged in to like an article');
    }
    const commentorId = user.documentId;
    const { articleId, action } = ctx.request.body;

    if (!articleId || !['like', 'unlike'].includes(action)) {
      return ctx.badRequest('Invalid input');
    }

    const result = await likeService.toggle(
      ctx,
      articleId,
      commentorId,
      action
    );

    return ctx.send({
      status: 'success',
      ...result,
    });
  },
}));
