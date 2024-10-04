import type { Navigation } from "@sveltejs/kit";
import { page } from "./stores";

let beforeNavigateCallback: ((navigation: Navigation) => void) | null = null;
let afterNavigateCallback: ((navigation: Navigation) => void) | null = null;

export const beforeNavigate = (callback: (navigation: Navigation) => void) => {
  beforeNavigateCallback = callback;
};

export const afterNavigate = (callback: (navigation: Navigation) => void) => {
  afterNavigateCallback = callback;
};

export const goto =
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
  async (
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

    const params = Object.fromEntries(new URLSearchParams(search));
    const { u: universe, ...rest }: Record<string, string> = params;

    const completePromise = new Promise<void>((resolve) =>
      setTimeout(resolve, 0)
    );

    const navigation: Navigation = {
      from: null,
      to: {
        url: typeof url === "string" ? new URL(url, "http://localhost") : url,
        params: Object.fromEntries(new URLSearchParams(search)),
        route: { id: routeId },
      },
      type: "goto",
      willUnload: true,
      delta: undefined,
      complete: completePromise,
    };

    if (beforeNavigateCallback) {
      beforeNavigateCallback(navigation);
    }

    page.mock({
      data: {
        universe,
        ...rest,
      },
      routeId,
    });
    // Simulate some async operation
    await completePromise;

    if (afterNavigateCallback) {
      afterNavigateCallback(navigation);
    }
  };
