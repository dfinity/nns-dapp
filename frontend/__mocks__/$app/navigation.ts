import type { AfterNavigate, BeforeNavigate, Navigation } from "@sveltejs/kit";
import { page } from "./stores";

let beforeNavigateCallbacks: ((navigation: BeforeNavigate) => void)[] = [];
let afterNavigateCallbacks: ((navigation: AfterNavigate) => void)[] = [];

export const goto = async (
  url: string | URL,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  opts?: {
    replaceState?: boolean;
    noScroll?: boolean;
    keepFocus?: boolean;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    state?: Record<string, any>;
    invalidateAll?: boolean;
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
      params: Object.fromEntries(new URLSearchParams(search)),
      route: { id: routeId },
      url: typeof url === "string" ? new URL(url, "http://localhost") : url,
    },
    type: "goto",
    complete: completePromise,
    willUnload: false,
  };

  let cancelled = false;
  for (const callback of beforeNavigateCallbacks) {
    const beforeNav: BeforeNavigate = {
      ...navigation,
      cancel: () => {
        cancelled = true;
      },
    };
    callback(beforeNav);
    if (cancelled) return;
  }

  page.mock({
    data: {
      universe,
      ...rest,
    },
    routeId,
  });

  await completePromise;

  for (const callback of afterNavigateCallbacks) {
    const afterNav: AfterNavigate = {
      ...navigation,
      type: "goto",
      willUnload: false,
    };
    callback(afterNav);
  }
};

export const beforeNavigate = (
  callback: (navigation: BeforeNavigate) => void
) => {
  beforeNavigateCallbacks.push(callback);
  return () => {
    beforeNavigateCallbacks = beforeNavigateCallbacks.filter(
      (cb) => cb !== callback
    );
  };
};

export const afterNavigate = (
  callback: (navigation: AfterNavigate) => void
) => {
  afterNavigateCallbacks.push(callback);
  return () => {
    afterNavigateCallbacks = afterNavigateCallbacks.filter(
      (cb) => cb !== callback
    );
  };
};

export const mockLinkClickEvent = (event) => {
  if (event.target.tagName === "A" && event.target.href) {
    event.preventDefault();
    const to = new URL(event.target.href).pathname;
    goto(to);
  }
};

export const resetNavigationCallbacks = () => {
  beforeNavigateCallbacks = [];
  afterNavigateCallbacks = [];
};
