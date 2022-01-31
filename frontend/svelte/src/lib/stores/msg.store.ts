import { writable } from "svelte/store";

export interface Msg {
  labelKey: string;
  type: "info" | "error";
}

export const msg = writable<Msg | undefined>(undefined);
