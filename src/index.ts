import type { Core } from '@strapi/strapi';

/**
 * Actions to grant to the "public" role on first boot (and on every restart
 * if the permission is missing).  Add more entries here as new collections
 * need public read access.
 */
const PUBLIC_PERMISSIONS: Array<{ action: string }> = [
  // Tech Pulse articles
  { action: 'api::tech-pulse-article.tech-pulse-article.find' },
  { action: 'api::tech-pulse-article.tech-pulse-article.findOne' },
  // Home — impact stats
  { action: 'api::site-stat.site-stat.find' },
  // Home + E-Visitors — partner brands
  { action: 'api::partner-brand.partner-brand.find' },
  // Home — story slides
  { action: 'api::home-story-slide.home-story-slide.find' },
  // Driving Change stories
  { action: 'api::driving-change-story.driving-change-story.find' },
  { action: 'api::driving-change-story.driving-change-story.findOne' },
  // SAN HUB catalog
  { action: 'api::san-hub-catalog-item.san-hub-catalog-item.find' },
  // Tech Pulse opportunities
  { action: 'api::opportunity.opportunity.find' },
  // Our Legacy — recognition
  { action: 'api::recognition.recognition.find' },
  // Our Legacy — team members
  { action: 'api::team-member.team-member.find' },
  // Our Legacy — journey stages
  { action: 'api::journey-stage.journey-stage.find' },
  // Our Legacy — company values
  { action: 'api::company-value.company-value.find' },
  // Our Legacy — focus areas
  { action: 'api::focus-area.focus-area.find' },
  // E-Visitors — testimonials
  { action: 'api::testimonial.testimonial.find' },
  // E-Visitors — platform features
  { action: 'api::e-visitors-feature.e-visitors-feature.find' },
  // E-Visitors — product milestones
  { action: 'api::product-milestone.product-milestone.find' },
  // E-Visitors — FAQ items
  { action: 'api::faq-item.faq-item.find' },
  // Innovation Lab — products
  { action: 'api::innovation-product.innovation-product.find' },
  // Innovation Lab — services
  { action: 'api::innovation-service.innovation-service.find' },
  // Innovation Lab — solutions
  { action: 'api::innovation-solution.innovation-solution.find' },
  // Innovation Lab — technology categories
  { action: 'api::technology-category.technology-category.find' },
  // Connect page — contact info (single type)
  { action: 'api::contact-info.contact-info.find' },
  // Our Legacy — standards / trust seals
  { action: 'api::standard.standard.find' },
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicPermissions(strapi);
  },
};

/**
 * Ensures each action in PUBLIC_PERMISSIONS is granted to the Public role.
 * Idempotent — skips any action that is already permitted.
 */
async function grantPublicPermissions(strapi: Core.Strapi) {
  // In Strapi 5, query the DB directly to find the Public role by type.
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission grant.');
    return;
  }

  // Fetch existing permissions for the public role
  const existingPermissions: Array<{ action: string }> = await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: { id: publicRole.id } } });

  const existingActions = new Set(existingPermissions.map((p) => p.action));

  const toCreate = PUBLIC_PERMISSIONS.filter((p) => !existingActions.has(p.action));

  if (toCreate.length === 0) {
    strapi.log.info('[bootstrap] Public Tech Pulse permissions already set — nothing to do.');
    return;
  }

  for (const { action } of toCreate) {
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: { action, role: publicRole.id },
    });
    strapi.log.info(`[bootstrap] Granted public permission: ${action}`);
  }
}
