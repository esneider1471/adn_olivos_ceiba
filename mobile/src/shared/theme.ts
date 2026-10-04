/**
 * Design tokens de la app.
 *
 * Espejo de los tokens de Tailwind de la web (`reactNext/src/app/globals.css`):
 * `background`, `surface`, `ink`, `line`, `primary`, etc. Un solo set claro —
 * la web no implementa dark mode, y mantenerlos sincronizados es más simple
 * que duplicarlos por scheme.
 */
export const colors = {
  background: '#f6f7f9',
  surface: '#ffffff',
  ink: '#1a202c',
  inkSoft: '#5a6577',
  line: '#e2e6ec',
  primary: '#3056d3',
  primaryHover: '#2746ae',
  danger: '#d3382f',
  dangerHover: '#b52e26',
  success: '#1f8a4c',
  warning: '#b26a00',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;
