import { writable } from "svelte/store";

export interface Msg {
  labelKey: string;
  level: "info" | "error";
}

export const msg = writable<Msg | undefined>(undefined);
