import { browser } from "$app/environment";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Page } from "$lib/derived/page.derived";
import type { LoadEvent } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

// Polyfill Buffer for development purpose. node_modules/@ledgerhq needs buffer.
// ⚠️ For production build the polyfill needs to be injected with Rollup (see vite.config.ts) because the page might be loaded before the _layout.js which will contains this polyfill
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

export const load: LayoutLoad = ($event: LoadEvent): Partial<Page> => {
  if (!browser) {
    return {
      universe: OWN_CANISTER_ID_TEXT,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  // TODO(GIX-1071): constants for u
  return {
    universe: searchParams?.get("u") ?? undefined,
  };
};
