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

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
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
});

export default config;
