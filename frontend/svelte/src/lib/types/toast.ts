export type ToastLevel = "info" | "warn" | "error";

export interface ToastMsg {
  labelKey: string;
  level: ToastLevel;
  detail?: string;
}
