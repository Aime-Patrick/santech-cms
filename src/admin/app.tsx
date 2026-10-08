import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Hide the "See all pricing plans" widget and other promotional content
    // from the Strapi admin dashboard
    locales: ['en'],
  },
  bootstrap(app: StrapiApp) {
    // Remove the "Details" widget (version info + pricing plans link)
    // from the admin homepage dashboard
    app.widgets.unregister(['ee.AdminGoldBanner', 'strapiCloud', 'adminUpdateNotification']);
  },
};
