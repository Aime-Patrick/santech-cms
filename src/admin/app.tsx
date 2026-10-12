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

    }
  },
};
