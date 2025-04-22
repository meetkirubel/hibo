module.exports = {
  beforeCreate(event) {
    const ctx = strapi.requestContext.get();

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
  },
};
