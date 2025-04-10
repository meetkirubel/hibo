export default {
  routes: [
    {
      method: 'DELETE',
      path: '/auth/delete',
      handler: 'api::user.custom-user.deleteAccount',
    },
  ],
};
