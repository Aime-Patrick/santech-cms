import type { StrapiApp } from '@strapi/strapi/admin';
import santechLogo from './extensions/santech.png';
import './extensions/admin.css';

// Strapi defaults to the system theme. Use a light SAN TECH workspace on the
// first visit, while still allowing an administrator to change the theme later.
if (typeof window !== 'undefined' && !window.localStorage.getItem('santech-admin-theme-initialized')) {
  window.localStorage.setItem('STRAPI_THEME', 'light');
  window.localStorage.setItem('santech-admin-theme-initialized', 'true');
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

  bootstrap(_app: StrapiApp) {
    const hideNewsletterOptIn = () => {
      document.querySelectorAll<HTMLElement>('[name="news"]').forEach((field) => {
        const container = field.closest('label') ?? field.parentElement;
        if (container) container.style.display = 'none';
      });
    };

    hideNewsletterOptIn();
    const newsletterObserver = new MutationObserver(hideNewsletterOptIn);
    newsletterObserver.observe(document.body, { childList: true, subtree: true });

    const hideApplicationDetails = () => {
      if (!window.location.pathname.includes('/settings/application')) {
        return;
      }

      const pricingLink = document.querySelector<HTMLAnchorElement>(
        'a[href="https://strapi.io/pricing-self-hosted"]',
      );

      if (!pricingLink) {
        return;
      }

      let current: HTMLElement | null = pricingLink;

      while (current && current !== document.body) {
        const text = current.textContent?.toLowerCase().replace(/\s+/g, ' ') ?? '';

        if (
          text.includes('details') &&
          text.includes('strapi version') &&
          text.includes('node version')
        ) {
          current.style.display = 'none';
          return;
        }

        current = current.parentElement;
      }
    };

    hideApplicationDetails();

    const observer = new MutationObserver(hideApplicationDetails);
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
