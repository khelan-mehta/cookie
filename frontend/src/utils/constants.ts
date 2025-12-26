export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '';

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const;

export const DISTRESS_STATUS = {
  PENDING: 'pending',
  RESPONDED: 'responded',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
} as const;

// Cookie color palette based severity colors
export const SEVERITY_COLORS = {
  low: 'bg-[#FEEAC9] text-gray-800',
  medium: 'bg-[#FFCDC9] text-gray-800',
  high: 'bg-[#FDACAC] text-gray-800',
  critical: 'bg-[#FD7979] text-white',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ROLE_SELECT: '/role-select',
  DASHBOARD: '/dashboard',
  DISTRESS_CALL: '/distress-call',
  TRACKING: '/tracking',
  PROFILE: '/profile',
  STORE: '/store',
  VET_DASHBOARD: '/vet/dashboard',
  VET_DISTRESS_LIST: '/vet/distress-list',
  VET_STORE: '/vet/store',
  VET_STORE_EDITOR: '/vet/store/edit',
} as const;
