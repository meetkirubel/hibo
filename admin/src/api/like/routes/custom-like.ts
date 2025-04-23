export default {
  routes: [
    {
      method: 'POST',
      path: '/likes/toggle',
      handler: 'api::like.custom-like.toggle',
    },
  ],
};
