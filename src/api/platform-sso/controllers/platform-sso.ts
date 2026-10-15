import { createHmac, randomBytes } from 'node:crypto';

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function roleCanOpenPlatform(user: any) {
  return (user?.roles ?? []).some((role: any) => {
    const code = String(role.code ?? '').toLowerCase();
    const name = String(role.name ?? '').toLowerCase();
    return code === 'strapi-super-admin' || code === 'strapi-admin' || name === 'super admin' || name === 'admin';
  });
}

export default {
  async start(ctx: any) {
    const secret = String(process.env.PLATFORM_SSO_SECRET ?? '').trim();
    const platformUrl = String(process.env.PLATFORM_URL ?? '').trim().replace(/\/$/, '');
    const user = ctx.state.user;
    if (!secret || !platformUrl) ctx.throw(503, 'Platform SSO is not configured.');
    if (!user || !roleCanOpenPlatform(user)) ctx.throw(403, 'Only SAN TECH administrators can open the platform.');

    const payload = encode({
      iss: 'santech-cms',
      provider: 'strapi-admin',
      sub: String(user.id),
      email: String(user.email).toLowerCase(),
      firstName: String(user.firstname || user.firstName || 'SAN TECH'),
      lastName: String(user.lastname || user.lastName || 'Administrator'),
      exp: Math.floor(Date.now() / 1000) + 60,
      jti: randomBytes(24).toString('base64url'),
    });
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    ctx.body = { redirectUrl: `${platformUrl}/api/auth/sso/callback?token=${encodeURIComponent(`${payload}.${signature}`)}` };
  },
};
