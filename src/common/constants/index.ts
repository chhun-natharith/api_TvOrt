export const IS_PUBLIC_KEY = 'isPublic';
export const PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Static catalog of role names — mirrors the seed.
 * Use these constants when referring to roles in code to avoid stringly-typed bugs.
 */
export const ROLES = {
  ADMIN: 'Admin',
  SUPPORT: 'Support',
  CUSTOMER: 'Customer',
} as const;

/**
 * Static catalog of permission names — mirrors the seed.
 * Import these in controllers via the `@RequirePermissions()` decorator.
 *
 * Reading travel content (provinces, foods, places, plans) is public and has no
 * permission; only writes and the visitor inbox are guarded.
 */
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage-roles',
  // Destinations: provinces and their "coming soon" teasers
  PROVINCES_WRITE: 'provinces:write',
  PROVINCES_DELETE: 'provinces:delete',
  FOODS_WRITE: 'foods:write',
  FOODS_DELETE: 'foods:delete',
  PLACES_WRITE: 'places:write',
  PLACES_DELETE: 'places:delete',
  PLANS_WRITE: 'plans:write',
  PLANS_DELETE: 'plans:delete',
  // Contact form messages
  MESSAGES_READ: 'messages:read',
  MESSAGES_WRITE: 'messages:write',
  MESSAGES_DELETE: 'messages:delete',
  // Newsletter
  SUBSCRIBERS_READ: 'subscribers:read',
  SUBSCRIBERS_DELETE: 'subscribers:delete',
  // Uploaded images/files
  MEDIA_READ: 'media:read',
  MEDIA_WRITE: 'media:write',
  MEDIA_DELETE: 'media:delete',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
