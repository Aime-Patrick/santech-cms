export default {
  routes: [
    {
      method: 'POST',
      path: '/platform-sso/start',
      handler: 'platform-sso.start',
      config: { auth: { scope: ['admin::isAuthenticatedAdmin'] } },
    },
  ],
};
