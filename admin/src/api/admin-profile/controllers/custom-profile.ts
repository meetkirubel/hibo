import { factories } from '@strapi/strapi';
import adminService from '../services/custom-profile';

export default factories.createCoreController('api::like.like', (strapi) => ({
  async getAuthor(ctx) {
    const { user } = ctx.state;
    const { userId } = ctx.params;

    if (!user) {
      return ctx.unauthorized();
    }

    if (!userId) {
      return ctx.badRequest('userId is needed');
    }

    const profile = await adminService.getAuthor(ctx, userId);
    if (!profile) {
      return ctx.notFound('User profile not found');
    }

    return ctx.send(profile);
  },
}));
