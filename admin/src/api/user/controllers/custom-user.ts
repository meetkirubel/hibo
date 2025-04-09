import { factories } from '@strapi/strapi';
import userService from '../services/custom-user';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  (strapi) => ({
    async deleteAccount(ctx) {
      const userId = ctx.state.user?.documentId;
      // Check if the user is authenricated
      if (!userId) {
        return ctx.unauthorized('Authorization required');
      }

      // Delete the user through users-permissions plugin
      const result = await userService.deleteAccount(ctx, userId);

      return ctx.send({
        success: true,
        message: 'Account permanently deleted',
        data: {
          id: result.documentId,
        },
      });
    },
  })
);
