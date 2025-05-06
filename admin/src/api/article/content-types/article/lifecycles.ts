const truncate = require('html-truncate');

module.exports = {
  beforeCreate(event) {
    const ctx = strapi.requestContext.get();
    const { data } = event.params;

    // Assign the user to its own article
    if (
      ctx?.state?.isAuthenticated &&
      ctx.state.user?.roles?.[0]?.name === 'Author'
    ) {
      const { data } = event.params;

      // Assign the current user as the author
      data.author = {
        connect: [ctx.state.user.id],
      };
    }

    // Create a preview for an article
    if (data?.content) {
      data.preview = truncate(data.content, 200, { byWords: true });
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    if (data?.content) {
      data.preview = truncate(data.content, 200, { byWords: true });
    }
  },
};
