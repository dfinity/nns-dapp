import type { I18nSubstitutions } from "../utils/i18n.utils";

export type ToastLevel = "success" | "warn" | "error" | "running";

export interface ToastMsg {
  labelKey: string;
  level: ToastLevel;
  detail?: string;
  duration?: number;
  id?: symbol;
  substitutions?: I18nSubstitutions;
}
