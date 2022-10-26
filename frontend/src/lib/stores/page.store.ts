import type { AppPath } from "$lib/constants/routes.constants";
import { writable } from "svelte/store";

// -- Workaround --
// I wish we could use afterNavigate in +page but, it would lead to SvelteKit issue https://github.com/sveltejs/kit/issues/1485#issuecomment-1291882125
// So instead, we should update the store each time a page is mounted - or each time the $page store changes - and use the store to initialize the referrer info when the page are initialized - i.e. before onMount imperatively.
// Note: On first load of a page the referrer might be itself
export const pageReferrerStore = writable<AppPath | undefined>(undefined);
