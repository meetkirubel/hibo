export default {
  async getAuthor(ctx, userId) {
    const profile = await strapi
      .documents('api::admin-profile.admin-profile')
      .findOne({ documentId: userId });

    return profile;
  },
};
