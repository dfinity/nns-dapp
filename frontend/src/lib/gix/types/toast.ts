import type { Component } from "svelte";

export type ToastLevel = "success" | "warn" | "error" | "info" | "custom";

export type ToastPosition = "bottom" | "top";

export type ToastTheme = "themed" | "inverted";

export interface ToastMsg {
  id: symbol;
  title?: string;
  text: string;
  level: ToastLevel;
  spinner?: boolean;
  duration?: number;
  position?: ToastPosition;
  overflow?: "scroll" | "truncate" | "clamp";
  icon?: Component;
  theme?: ToastTheme;
  renderAsHtml?: boolean;
}
