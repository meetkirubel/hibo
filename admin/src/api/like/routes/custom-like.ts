export default {
  routes: [
    {
      method: 'POST',
      path: '/v1/likes/toggle',
      handler: 'api::like.custom-like.toggle',
    },
  ],
};
