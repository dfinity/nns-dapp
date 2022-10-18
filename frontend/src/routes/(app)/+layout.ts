import type {LoadEvent} from "@sveltejs/kit";
import type { LayoutLoad } from './$types';
import {browser} from "$app/environment";

/** @type {import('./$types').PageLoad} */
export const load: LayoutLoad = ($event: LoadEvent): App.PageData => {
    // TODO(GIX-1071): constants
    if (!browser) {
        return {
            universe: undefined,
            id: undefined
        }
    }

    const {url: {searchParams}} = $event;

    return {
        universe: searchParams?.get("u"),
        id: searchParams?.get("id")
    }
}