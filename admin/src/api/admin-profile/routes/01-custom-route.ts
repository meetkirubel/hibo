export default {
  routes: [
    {
      method: 'GET',
      path: '/author/:userId',
      handler: 'api::admin-profile.custom-profile.getAuthor',
    },
  ],
};
