import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::like.like', (strapi) => ({
  // Toggle a like
  async toggle(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.unauthorized('You must be logged in to like an article');
    }

    return user;
  },
}));
