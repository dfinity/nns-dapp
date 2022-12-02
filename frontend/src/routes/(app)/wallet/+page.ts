import { browser } from "$app/environment";
import { ACCOUNT_PARAM } from "$lib/constants/routes.constants";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { account: string | null | undefined } => {
  if (!browser) {
    return {
      account: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  return {
    account: searchParams?.get(ACCOUNT_PARAM),
  };
};
