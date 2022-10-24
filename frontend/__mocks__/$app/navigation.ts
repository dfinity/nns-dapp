import { page } from "./stores";

export const goto = async (
  url: string | URL,
  opts?: {
    replaceState?: boolean;
    noscroll?: boolean;
    keepfocus?: boolean;
    state?: any;
  }
): Promise<void> => {
  const { search, pathname: routeId } =
    url instanceof URL ? url : new URL(`http://localhost:8080${url}`);

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
