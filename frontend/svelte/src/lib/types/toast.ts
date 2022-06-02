export type ToastLevel = "success" | "warn" | "error";

export interface ToastMsg {
  labelKey: string;
  substitutions?: { [from: string]: string };
  level: ToastLevel;
  detail?: string;
  duration?: number;
  id?: symbol;
}
