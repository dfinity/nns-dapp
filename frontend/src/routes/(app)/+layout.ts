import type {LoadEvent} from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export const load = ({url: {searchParams}}: LoadEvent): App.PageData => ({
    universe: searchParams.get("u"),
    id: searchParams.get("id")
})