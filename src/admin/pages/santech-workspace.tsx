import { ArrowRight, Layout } from '@strapi/icons';
import { useFetchClient } from '@strapi/strapi/admin';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './santech-workspace.css';

type CollectionLink = {
  label: string;
  description: string;
  uid: string;
  kind?: 'collection' | 'single';
};

type WorkspaceGroup = {
  eyebrow: string;
  title: string;
  description: string;
  links: CollectionLink[];
};

const groups: WorkspaceGroup[] = [
  {
    eyebrow: '01',
    title: 'Home',
    description: 'Manage the homepage content and proof points.',
    links: [
      { label: 'Site Settings', description: 'Global media, SEO, language, and social settings', uid: 'api::site-setting.site-setting', kind: 'single' },
      { label: 'Site Stats', description: 'Impact numbers and counters', uid: 'api::site-stat.site-stat' },
      { label: 'Partner Brands', description: 'Logos and partner listings', uid: 'api::partner-brand.partner-brand' },
      { label: 'Home Story Slides', description: 'Homepage story content', uid: 'api::home-story-slide.home-story-slide' },
    ],
  },
  {
    eyebrow: '02',
    title: 'E-Visitors',
    description: 'Manage the product page and operational platform content.',
    links: [
      { label: 'Features', description: 'Platform capabilities and screens', uid: 'api::e-visitors-feature.e-visitors-feature' },
      { label: 'FAQs', description: 'Frequently asked questions', uid: 'api::faq-item.faq-item' },
      { label: 'Product Milestones', description: 'Product journey and releases', uid: 'api::product-milestone.product-milestone' },
      { label: 'Testimonials', description: 'Customer and partner stories', uid: 'api::testimonial.testimonial' },
    ],
  },
  {
    eyebrow: '03',
    title: 'SAN HUB',
    description: 'Manage learning, programs, and ecosystem pathways.',
    links: [
      { label: 'Courses and Programs', description: 'Catalog items shown in SAN HUB', uid: 'api::san-hub-catalog-item.san-hub-catalog-item' },
      { label: 'Course Categories', description: 'Manage the categories used by SAN HUB courses', uid: 'api::course-category.course-category' },
    ],
  },
  {
    eyebrow: '04',
    title: 'Tech Pulse',
    description: 'Manage stories, opportunities, and journal content.',
    links: [
      { label: 'Articles', description: 'News, announcements, and insights', uid: 'api::tech-pulse-article.tech-pulse-article' },
      { label: 'Opportunities', description: 'Fellowships, jobs, and calls', uid: 'api::opportunity.opportunity' },
    ],
  },
  {
    eyebrow: '05',
    title: 'Innovation Lab',
    description: 'Manage products, services, solutions, and technology areas.',
    links: [
      { label: 'Products', description: 'SAN TECH product catalog', uid: 'api::innovation-product.innovation-product' },
      { label: 'Services', description: 'Services and capabilities', uid: 'api::innovation-service.innovation-service' },
      { label: 'Solutions', description: 'Solutions by challenge', uid: 'api::innovation-solution.innovation-solution' },
      { label: 'Technology Categories', description: 'Technology and expertise areas', uid: 'api::technology-category.technology-category' },
    ],
  },
  {
    eyebrow: '06',
    title: 'Driving Change',
    description: 'Manage impact stories, career outreach, and topic navigation.',
    links: [
      { label: 'Stories', description: 'Impact and career outreach stories', uid: 'api::driving-change-story.driving-change-story' },
      { label: 'Topics', description: 'Driving Change section categories', uid: 'api::driving-change-topic.driving-change-topic' },
    ],
  },
  {
    eyebrow: '07',
    title: 'Our Legacy',
    description: 'Manage company history, people, recognition, and identity.',
    links: [
      { label: 'Company Values', description: 'Values and principles', uid: 'api::company-value.company-value' },
      { label: 'Focus Areas', description: 'Technology focus areas', uid: 'api::focus-area.focus-area' },
      { label: 'Journey Stages', description: 'Company milestones', uid: 'api::journey-stage.journey-stage' },
      { label: 'Recognition', description: 'Awards and certificates', uid: 'api::recognition.recognition' },
      { label: 'Standards', description: 'Trust seals and standards', uid: 'api::standard.standard' },
      { label: 'Team Members', description: 'Leadership and team profiles', uid: 'api::team-member.team-member' },
    ],
  },
  {
    eyebrow: '08',
    title: 'Connect',
    description: 'Manage public contact and connection details.',
    links: [
      { label: 'Contact Information', description: 'Address, email, and contact details', uid: 'api::contact-info.contact-info', kind: 'single' },
    ],
  },
];

function collectionPath(link: CollectionLink) {
  const type = link.kind === 'single' ? 'single-types' : 'collection-types';
  return `/content-manager/${type}/${link.uid}`;
}

export default function SantechWorkspace() {
  const { post } = useFetchClient();
  const [openingPlatform, setOpeningPlatform] = useState(false);
  const [ssoError, setSsoError] = useState('');

  async function openPlatform() {
    setOpeningPlatform(true);
    setSsoError('');
    try {
      const response = await post('/api/platform-sso/start');
      window.location.assign(response.data.redirectUrl);
    } catch {
      setSsoError('Platform access is not configured for this CMS account.');
      setOpeningPlatform(false);
    }
  }

  return (
    <main className="santech-workspace">
      <header className="santech-workspace__hero">
        <div>
          <p className="santech-workspace__eyebrow">SAN TECH / CONTENT WORKSPACE</p>
          <h1>Manage the SAN TECH ecosystem.</h1>
          <p className="santech-workspace__intro">
            Find every website area and its content in one organized place. Each shortcut opens the standard Strapi editor.
          </p>
        </div>
        <div className="santech-workspace__hero-actions"><button type="button" className="santech-workspace__platform-button" onClick={openPlatform} disabled={openingPlatform}>{openingPlatform ? 'Opening platform…' : 'Open SAN TECH Platform'} <ArrowRight width="16" height="16" aria-hidden="true" /></button>{ssoError ? <small className="santech-workspace__error">{ssoError}</small> : null}<div className="santech-workspace__mark" aria-hidden="true"><Layout width="24" height="24" /></div></div>
      </header>

      <div className="santech-workspace__groups">
        {groups.map((group) => (
          <section className="santech-workspace__group" key={group.title}>
            <div className="santech-workspace__group-header">
              <span className="santech-workspace__number">{group.eyebrow}</span>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
            </div>

            <div className="santech-workspace__links">
              {group.links.map((link) => (
                <Link className="santech-workspace__link" key={link.uid} to={collectionPath(link)}>
                  <span>
                    <strong>{link.label}</strong>
                    <small>{link.description}</small>
                  </span>
                  <ArrowRight width="16" height="16" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
