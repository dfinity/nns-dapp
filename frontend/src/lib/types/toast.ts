import type { I18nSubstitutions } from "../utils/i18n.utils";

export type ToastLevel = "success" | "warn" | "error" | "info";

export interface ToastMsg {
  labelKey: string;
  level: ToastLevel;
  spinner?: boolean;
  detail?: string;
  duration?: number;
  id?: symbol;
  substitutions?: I18nSubstitutions;
}
