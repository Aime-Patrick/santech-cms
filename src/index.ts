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
  { action: 'api::driving-change-topic.driving-change-topic.find' },
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
  // Global site settings (single type)
  { action: 'api::site-setting.site-setting.find' },
  // Our Legacy page (single type)
  { action: 'api::legacy-page.legacy-page.find' },
  // SAN HUB — books and categories
  { action: 'api::san-hub-book.san-hub-book.find' },
  { action: 'api::san-hub-book-category.san-hub-book-category.find' },
  // SAN HUB — trainee awards
  { action: 'api::trainee-award.trainee-award.find' },
];

/**
 * Recursively removes component `id` fields from incoming document payloads.
 *
 * In Strapi 5, components (e.g. shared.seo, shared.social-link) have distinct internal
 * database IDs between Draft and Published entities. When saving from the Content
 * Manager or REST API, sending an ID that belongs to the published entity causes:
 *   "ApplicationError: Some of the provided components in [field] are not related to the entity"
 *
 * Treating components as value objects and stripping their internal IDs allows Strapi's
 * Document Service to cleanly reconcile and re-create components without ID collisions.
 */
function sanitizeComponentIds(data: Record<string, any>, attributes?: Record<string, any>) {
  if (!data || typeof data !== 'object') return;

  if (attributes) {
    for (const [attrName, attrDef] of Object.entries(attributes)) {
      if (!attrDef || typeof attrDef !== 'object') continue;
      const value = data[attrName];
      if (!value) continue;

      if ((attrDef as any).type === 'component') {
        if ((attrDef as any).repeatable && Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object') {
              delete item.id;
              sanitizeComponentIds(item);
            }
          }
        } else if (typeof value === 'object') {
          delete value.id;
          sanitizeComponentIds(value);
        }
      } else if ((attrDef as any).type === 'dynamiczone' && Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            delete item.id;
            sanitizeComponentIds(item);
          }
        }
      }
    }
  } else {
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (const item of val) {
            if (item && typeof item === 'object') {
              sanitizeComponentIds(item);
            }
          }
        } else {
          sanitizeComponentIds(val);
        }
      }
    }
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    (strapi as any).documents?.use?.(async (context: any, next: () => Promise<any>) => {
      if ((context.action === 'update' || context.action === 'create') && context.params?.data) {
        const attributes = context.contentType?.attributes;
        sanitizeComponentIds(context.params.data, attributes);
      }
      return next();
    });
  },

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
