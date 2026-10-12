import type { StrapiApp } from '@strapi/strapi/admin';
import { Layout } from '@strapi/icons';
import santechLogo from './extensions/santech.png';
import santechMark from './extensions/santech-mark.png';
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

  bootstrap(app: StrapiApp) {
    app.addMenuLink({
      to: 'santech-workspace',
      intlLabel: {
        id: 'santech.workspace',
        defaultMessage: 'SAN TECH Workspace',
      },
      icon: Layout,
      Component: () => import('./pages/santech-workspace'),
    });

    // Apply SAN TECH branding without observing the whole admin DOM. Strapi can
    // initialize this hook before the document body is mounted, but the head is
    // available for the title and favicon update.
    if (typeof document !== 'undefined') {
      const applySanTechBranding = () => {
        document.title = 'SAN TECH CMS';

        let sanTechFavicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (!sanTechFavicon) {
          sanTechFavicon = document.createElement('link');
          sanTechFavicon.rel = 'icon';
          document.head.appendChild(sanTechFavicon);
        }

        sanTechFavicon.type = 'image/png';
        sanTechFavicon.href = santechMark;
      };

      applySanTechBranding();

      // Strapi updates document.title when navigating between content types.
      // Watch only the head so the branding survives navigation without
      // observing or mutating the admin body.
      if (document.head && !document.head.dataset.santechBrandingObserver) {
        document.head.dataset.santechBrandingObserver = 'true';
        const brandingObserver = new MutationObserver(applySanTechBranding);
        brandingObserver.observe(document.head, { childList: true, characterData: true, subtree: true });
      }
    }

    // Keep the older DOM cleanup code below disabled. It is intentionally
    // retained for reference, but broad observers can interfere with Strapi's
    // admin lifecycle.
    return;

    const applyAdminBranding = () => {
      document.title = 'SAN TECH CMS';

      let favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }

      favicon.type = 'image/png';
      favicon.href = santechMark;
    };

    applyAdminBranding();
    const brandingObserver = new MutationObserver(applyAdminBranding);
    brandingObserver.observe(document.head, { childList: true, subtree: true });

    const hideNewsletterOptIn = () => {
      document.querySelectorAll<HTMLElement>('[name="news"]').forEach((field) => {
        const container = field.closest('label') ?? field.parentElement;
        if (container) container.style.display = 'none';
      });
    };

    hideNewsletterOptIn();
    const newsletterObserver = new MutationObserver(hideNewsletterOptIn);
    if (document.body) {
      newsletterObserver.observe(document.body, { childList: true, subtree: true });
    }

    const hideMarketplace = () => {
      const marketplaceSelectors = [
        "a[href*='marketplace' i]",
        "a[href*='market.strapi.io' i]",
        "[aria-label*='marketplace' i]",
        "[title*='marketplace' i]",
        "[data-testid*='marketplace' i]",
      ].join(',');

      document.querySelectorAll<HTMLElement>(marketplaceSelectors).forEach((element) => {
        const item = element.closest<HTMLElement>('li') ?? element;
        item.style.display = 'none';
      });
    };

    hideMarketplace();
    const marketplaceObserver = new MutationObserver(hideMarketplace);
    if (document.body) {
      marketplaceObserver.observe(document.body, { childList: true, subtree: true });
    }

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
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    const hidePreviewSetup = () => {
      const setupButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.trim().toLowerCase() === 'set up preview',
      );

      if (!setupButton) {
        return;
      }

      let current: HTMLElement | null = setupButton.parentElement;

      while (current && current !== document.body) {
        const text = current.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';

        // The built-in panel contains only its heading and the setup button.
        if (text === 'preview set up preview' || text === 'previewsetup preview') {
          current.style.display = 'none';
          return;
        }

        current = current.parentElement;
      }
    };

    hidePreviewSetup();

    const previewObserver = new MutationObserver(hidePreviewSetup);
    if (document.body) {
      previewObserver.observe(document.body, { childList: true, subtree: true });
    }
  },
};
