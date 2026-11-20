/**
 * Types of src/lib/gix/i18n/en.json.
 */

interface GixI18nCore {
  close: string;
  back: string;
  menu: string;
  collapse: string;
  expand: string;
  copy: string;
}

interface GixI18nTheme {
  switch_theme: string;
}

interface GixI18nProgress {
  completed: string;
  in_progress: string;
  failed: string;
}

interface GixI18n {
  lang: Languages;
  core: GixI18nCore;
  theme: GixI18nTheme;
  progress: GixI18nProgress;
}
