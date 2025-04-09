export default {
  async deleteAccount(ctx, userId) {
    // Delete the user
    const deletedUser = await strapi
      .documents('plugin::users-permissions.user')
      .delete({ documentId: userId });

    //   Clear authentication token
    ctx.set('Authorization', '');

    return deletedUser;
  },
};
