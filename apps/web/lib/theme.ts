export type Theme = 'dark' | 'light';

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme') as Theme | null;
  return stored ?? 'dark';
};

export const saveTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('theme', theme);
}; 
