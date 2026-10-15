import type { StrapiApp } from '@strapi/strapi/admin';
import { Layout } from '@strapi/icons';
import santechLogo from './extensions/santech.png';
import santechMark from './extensions/santech-mark.png';
import './extensions/admin.css';

// Strapi defaults to the system theme. Use a light SAN TECH workspace on the
// first visit, while still allowing an administrator to change the theme later.
if (typeof window !== 'undefined') {
  try {
    if (!window.localStorage.getItem('santech-admin-theme-initialized')) {
      window.localStorage.setItem('STRAPI_THEME', 'light');
      window.localStorage.setItem('santech-admin-theme-initialized', 'true');
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export default {
  config: {
    locales: ['en'],
    auth: {
      logo: santechLogo,
    },
    menu: {
      logo: santechLogo,
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome to SAN TECH!',
        'Auth.form.register.subtitle': 'Your credentials are used only to access the SAN TECH content workspace. Saved content remains in your database.',
      },
    },
    tutorials: false,
    notifications: {
      releases: false,
    },
  },

  bootstrap(app: StrapiApp) {
    app.addMenuLink({
      to: 'santech-workspace',
      intlLabel: {
        id: 'santech.workspace',
        defaultMessage: 'SAN TECH Workspace',
      },
      icon: Layout,
      permissions: [],
      Component: () => import('./pages/santech-workspace'),
    });

    // Apply SAN TECH branding without observing the whole admin DOM. Strapi can
    // initialize this hook before the document body is mounted, but the head is
    // available for the title and favicon update.
    if (typeof document !== 'undefined') {
      const applySanTechBranding = () => {
        if (document.title !== 'SAN TECH CMS') {
          document.title = 'SAN TECH CMS';
        }

        let sanTechFavicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (!sanTechFavicon) {
          sanTechFavicon = document.createElement('link');
          sanTechFavicon.rel = 'icon';
          document.head.appendChild(sanTechFavicon);
        }

        if (sanTechFavicon.getAttribute('type') !== 'image/png') {
          sanTechFavicon.setAttribute('type', 'image/png');
        }
        if (sanTechFavicon.getAttribute('href') !== santechMark) {
          sanTechFavicon.setAttribute('href', santechMark);
        }
      };

      applySanTechBranding();

      // Strapi updates the document title when navigating between entries. Keep
      // that route title branded so the browser tab never falls back to
      // "Strapi Admin" or appends "| Strapi".
      if (document.head) {
        const adminTitleObserver = new MutationObserver(applySanTechBranding);
        adminTitleObserver.observe(document.head, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      // Remove Strapi's project-plan details card from the administrator view.
      // The card is rendered by the core admin UI, so its markup is not available
      // through the application config. Keep this observer narrowly scoped to the
      // card's own pricing link and identifying labels.
      const hideStrapiProjectDetails = () => {
        const pricingLink = Array.from(document.querySelectorAll<HTMLAnchorElement>('a')).find((link) => {
          const href = link.href.toLowerCase();
          const label = link.textContent?.toLowerCase() ?? '';
          return href.includes('strapi.io/pricing') || label.includes('see all pricing plans');
        });

        if (!pricingLink) return;

        let card = pricingLink.parentElement;
        while (card && card !== document.body) {
          const content = card.textContent?.toLowerCase() ?? '';
          if (content.includes('strapi version') && content.includes('current plan')) {
            card.style.display = 'none';
            return;
          }
          card = card.parentElement;
        }
      };

      const hideStrapiMediaLibraryAnnouncement = () => {
        const announcementText = 'introducing the new media library';
        const announcement = Array.from(document.querySelectorAll<HTMLElement>('*')).find((element) => {
          const content = element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
          return content.includes(announcementText) && content.includes('revamped version') && content.length < 400;
        });

        if (!announcement) return;

        let banner = announcement;
        let parent = banner.parentElement;
        while (parent && parent !== document.body) {
          const content = parent.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
          if (!content.includes(announcementText) || content.length >= 400) break;
          banner = parent;
          parent = parent.parentElement;
        }

        banner.style.display = 'none';
      };

      const watchForStrapiProjectDetails = () => {
        hideStrapiProjectDetails();
        hideStrapiMediaLibraryAnnouncement();
        if (!document.body) return;

        const projectDetailsObserver = new MutationObserver(() => {
          hideStrapiProjectDetails();
          hideStrapiMediaLibraryAnnouncement();
        });
        projectDetailsObserver.observe(document.body, { childList: true, subtree: true });
      };

      if (document.body) {
        watchForStrapiProjectDetails();
      } else {
        document.addEventListener('DOMContentLoaded', watchForStrapiProjectDetails, { once: true });
      }

    }
  },
};
