export type ToastLevel = "success" | "warn" | "error";

export interface ToastMsg {
  labelKey: string;
  level: ToastLevel;
  detail?: string;
  duration?: number;
  id?: symbol;
}
