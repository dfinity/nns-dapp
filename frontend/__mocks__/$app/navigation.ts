import type { Navigation } from "@sveltejs/kit";
import { page } from "./stores";

export const goto = async (
  url: string | URL,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  opts?: {
    replaceState?: boolean;
    noscroll?: boolean;
    keepfocus?: boolean;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    state?: any;
  }
): Promise<void> => {
  const { search, pathname: routeId } =
    url instanceof URL ? url : new URL(`http://_${url}`);

  const { u: universe, ...rest }: Record<string, string> = Object.fromEntries(
    new URLSearchParams(search)
  );

  page.mock({
    data: {
      universe,
      ...rest,
    },
    routeId,
  });
};

export const afterNavigate = (callback: (navigation: Navigation) => void) => {
  callback({
    from: null,
    to: null,
    type: "goto",
    willUnload: true,
    delta: undefined,
  });
};
