import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const publicUrl = env('PUBLIC_URL', '');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(publicUrl ? { url: publicUrl } : {}),
    proxy: env.bool('IS_PROXIED', !!publicUrl),
    app: {
      keys: env.array('APP_KEYS')!,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};

export default config;
