import type {Theme} from '../types/theme';

export const applyTheme = (theme: Theme) => {
  const {documentElement, head} = document;

  documentElement.setAttribute('theme', theme);

  const color: string = getComputedStyle(documentElement).getPropertyValue('--gray-50-background');
  head?.children?.namedItem('theme-color')?.setAttribute('content', color.trim());

  localStorage.setItem('theme', theme);
};
