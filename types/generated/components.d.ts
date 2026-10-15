import type { Schema, Struct } from '@strapi/strapi';

export interface CourseDetail extends Struct.ComponentSchema {
  collectionName: 'components_course_details';
  info: {
    displayName: 'Course detail';
    icon: 'information';
  };
  attributes: {
    detail: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 400;
      }>;
    icon: Schema.Attribute.Enumeration<
      ['certificate', 'language', 'schedule', 'access']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'access'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface CourseListItem extends Struct.ComponentSchema {
  collectionName: 'components_course_list_items';
  info: {
    displayName: 'Course list item';
    icon: 'list';
  };
  attributes: {
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 240;
      }>;
  };
}

export interface CourseSeriesItem extends Struct.ComponentSchema {
  collectionName: 'components_course_series_items';
  info: {
    displayName: 'Course journey module';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    duration: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 140;
      }>;
  };
}

export interface CourseStat extends Struct.ComponentSchema {
  collectionName: 'components_course_stats';
  info: {
    displayName: 'Course stat';
    icon: 'chart-bar';
  };
  attributes: {
    detail: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface CourseTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_course_testimonials';
  info: {
    displayName: 'Course testimonial';
    icon: 'quote';
  };
  attributes: {
    initials: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 4;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    quote: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 600;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Search and social metadata shared by pages and content entries.';
    displayName: 'SEO';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    keywords: Schema.Attribute.Text;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    shareImage: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'A public social or community profile link.';
    displayName: 'Social Link';
  };
  attributes: {
    iconName: Schema.Attribute.Enumeration<
      [
        'AlertCircle',
        'Award',
        'BarChart3',
        'BadgeCheck',
        'BrainCircuit',
        'BriefcaseBusiness',
        'Building2',
        'CalendarDays',
        'CheckCircle2',
        'Cloud',
        'CloudCog',
        'Code2',
        'Compass',
        'Cpu',
        'Database',
        'Eye',
        'FileText',
        'FlaskConical',
        'Globe2',
        'GraduationCap',
        'Handshake',
        'HeartHandshake',
        'Lightbulb',
        'LockKeyhole',
        'Mail',
        'MapPin',
        'Network',
        'Radar',
        'Radio',
        'Rocket',
        'ScanLine',
        'ShieldCheck',
        'Smartphone',
        'Target',
        'Truck',
        'Users',
        'Workflow',
        'Wrench',
      ]
    >;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    platform: Schema.Attribute.Enumeration<
      ['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'whatsapp', 'other']
    > &
      Schema.Attribute.DefaultTo<'other'>;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'course.detail': CourseDetail;
      'course.list-item': CourseListItem;
      'course.series-item': CourseSeriesItem;
      'course.stat': CourseStat;
      'course.testimonial': CourseTestimonial;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
    }
  }
}
