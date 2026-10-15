import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const resendApiKey = env('RESEND_API_KEY', '').trim();

  return {
    email: {
      config: {
        provider: resendApiKey ? '@3xweb/strapi-provider-email-resend' : 'sendmail',
        ...(resendApiKey ? { providerOptions: { apiKey: resendApiKey } } : {}),
        settings: {
          defaultFrom: env('EMAIL_FROM', 'SAN TECH <noreply@santechconnect.com>'),
          defaultReplyTo: env('EMAIL_REPLY_TO', 'info@santechconnect.com'),
        },
      },
    },
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
      // ── Cloudinary upload provider ─────────────────────────────────────────
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_CLOUD_NAME'),
        api_key:    env('CLOUDINARY_API_KEY'),
        api_secret: env('CLOUDINARY_API_SECRET'),
      },
      // Keep Strapi's request limit above the size of PDFs and media sent to
      // Cloudinary. The provider still enforces Cloudinary's own account limits.
      sizeLimit: 256 * 1024 * 1024,
      actionOptions: {
        upload: {
          folder: env('CLOUDINARY_FOLDER', 'santech/uploads'),
          // Automatically generate responsive formats
          eager: [
            { width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            { width:  800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            { width:  400, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
          eager_async: true,
        },
        uploadStream: {
          folder: env('CLOUDINARY_FOLDER', 'santech/uploads'),
        },
        delete: {},
      },
      // ── File security (unchanged) ──────────────────────────────────────────
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
      },
    },
  };
};

export default config;
